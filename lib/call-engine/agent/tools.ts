import crypto from "node:crypto";
import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { elevenClient } from "./eleven-client";
import type { AgentTool, Assistant } from "../../dashboard/db";
import {
  needsPerCallPolicy,
  parseEscalation,
  transferCondition,
  transferTypeFor,
} from "../escalation";
import { toCustomToolRequest, type CustomTool } from "./custom-tools";

function sharedFields(): Record<string, ElevenLabs.LiteralJsonSchemaProperty> {
  return {
    to_number: { type: "string", dynamicVariable: "system__called_number" },
    from_number: { type: "string", dynamicVariable: "system__caller_id" },
    conversation_id: { type: "string", dynamicVariable: "system__conversation_id" },
  };
}
const SHARED_REQUIRED = ["to_number", "conversation_id"];

interface WebhookToolSpec {
  name: string;
  path: string;
  description: string;
  params: Record<string, ElevenLabs.LiteralJsonSchemaProperty>;
  required: string[];
  /** "force" = always announce the action out loud; the webhook then runs while the agent is speaking. */
  preToolSpeech?: ElevenLabs.PreToolSpeechMode;
  /** Ambient sound played while the tool executes, so the wait never reads as dead air. */
  toolCallSound?: ElevenLabs.ToolCallSoundType;
  /** Override the default 15s webhook budget (e.g. booking: 6s guard + 13s create). */
  responseTimeoutSecs?: number;
}

// What the assistant's calendar grants can actually do. Computed at sync time
// from the real integration providers (see resolveAgentCapabilities) - an
// access entry alone doesn't prove the provider can answer availability.
export interface AgentCapabilities {
  canRead: boolean;
  canBook: boolean;
}

function webhookToolSpecs({ canRead, canBook }: AgentCapabilities): WebhookToolSpec[] {
  const specs: WebhookToolSpec[] = [];

  if (canRead) {
    specs.push({
      name: "check_availability",
      path: "/api/agent/check-availability",
      description:
        "Check whether a specific time slot is free on the business calendar before offering or confirming it. Call this whenever the caller proposes or asks about a time. Provide start_time and end_time as ISO 8601 timestamps.",
      params: {
        start_time: {
          type: "string",
          description:
            "Requested start, ISO 8601 with explicit UTC offset (e.g. 2026-07-02T15:00:00+02:00).",
        },
        end_time: {
          type: "string",
          description:
            "Requested end, ISO 8601 with explicit UTC offset (e.g. 2026-07-02T15:30:00+02:00).",
        },
      },
      required: ["start_time", "end_time"],
      // "auto" self-tunes: snapshot-backed checks answer fast enough that a
      // spoken acknowledgement would only slow the turn down; cold live reads
      // still get one.
      preToolSpeech: "auto",
      toolCallSound: "typing",
    });
  }

  if (canBook) {
    specs.push({
      name: "book_appointment",
      path: "/api/agent/book-appointment",
      description:
        "Book an appointment on the business calendar once the caller has agreed to a specific time. " +
        (canRead ? "Only call after confirming the time is free. " : "") +
        "Collect the caller's name, and whatever this business needs to know about the appointment (see `notes`), before calling this.",
      params: {
        title: {
          type: "string",
          description:
            "Short title for the appointment, naming what it's for when you know - e.g. 'Check-up - Jane Doe' or 'Consultation with Jane Doe'. This is what the business sees in its calendar.",
        },
        start_time: { type: "string", description: "Start, ISO 8601 with explicit UTC offset." },
        end_time: { type: "string", description: "End, ISO 8601 with explicit UTC offset." },
        attendee_name: { type: "string", description: "Caller's full name, if given." },
        attendee_phone: { type: "string", description: "Callback number, if different from caller ID." },
        notes: {
          type: "string",
          description:
            "Why the caller is coming and anything the business needs to prepare, in their own words - e.g. the reason for a medical visit, or the service they want. Include only what's relevant to this business; leave empty if nothing about it warranted asking.",
        },
      },
      required: ["title", "start_time", "end_time"],
      // Always announce ("Alright, booking that now…") - the create runs in
      // parallel with the speech, so the caller never waits in silence.
      preToolSpeech: "force",
      toolCallSound: "typing",
      // Worst case inside: 6s double-book guard + 13s create (see net.ts),
      // plus the post-create DB writes and request transit - leave headroom.
      responseTimeoutSecs: 25,
    });
  }

  // Always available: taking a message is the universal fallback.
  specs.push({
    name: "take_message",
    path: "/api/agent/take-message",
    description:
      "Record a message for the business when you can't fully resolve the caller's request, when they ask someone to call back, or when no other tool applies. Capture the caller's name, callback number and the message.",
    params: {
      caller_name: { type: "string", description: "Caller's name." },
      callback_number: { type: "string", description: "Best number to call back, if given." },
      message: { type: "string", description: "The message to pass on, in the caller's words." },
      urgency: {
        type: "string",
        enum: ["low", "normal", "high"],
        description: "How urgent the caller says it is.",
      },
    },
    required: ["message"],
  });

  return specs;
}

let secretLocatorPromise: Promise<ElevenLabs.ConvAiSecretLocator | null> | null = null;

/**
 * Store a value as an ElevenLabs workspace secret and return its locator, so the
 * credential is never written into a tool config in plaintext.
 *
 * The name is derived from a hash of the value, which makes this idempotent:
 * re-syncing an unchanged secret finds the existing one instead of piling up
 * duplicates. Also means a rotated value gets a new secret rather than silently
 * reusing the old one.
 */
export async function storeWorkspaceSecret(
  prefix: string,
  value: string,
): Promise<ElevenLabs.ConvAiSecretLocator | null> {
  const name = `${prefix}-${crypto.createHash("sha256").update(value).digest("hex").slice(0, 8)}`;
  try {
    const client = elevenClient();
    const existing = (await client.conversationalAi.secrets.list({ search: name })).secrets.find(
      (s) => s.name === name,
    );
    if (existing) return { secretId: existing.secretId };
    const created = await client.conversationalAi.secrets.create({ name, value });
    return { secretId: created.secretId };
  } catch (err) {
    console.error("[agent-tools] workspace secret setup failed", name, err);
    return null;
  }
}

function workspaceSecretLocator(secret: string): Promise<ElevenLabs.ConvAiSecretLocator | null> {
  secretLocatorPromise ??= storeWorkspaceSecret("agent-webhook", secret).then((locator) => {
    // On failure, clear the memo so the next sync retries instead of caching a
    // null forever. The caller falls back to a plaintext header meanwhile.
    if (!locator) secretLocatorPromise = null;
    return locator;
  });
  return secretLocatorPromise;
}

function toToolRequest(
  spec: WebhookToolSpec,
  baseUrl: string,
  secret: string | ElevenLabs.ConvAiSecretLocator,
): ElevenLabs.ToolRequestModel {
  return {
    toolConfig: {
      type: "webhook",
      name: spec.name,
      description: spec.description,
      responseTimeoutSecs: spec.responseTimeoutSecs ?? 15,
      // The agent announces the action ("Alright, booking that now…") and the
      // webhook fires immediately, so the call and the speech run in parallel.
      preToolSpeech: spec.preToolSpeech ?? "auto",
      // Spread, don't assign undefined: the SDK serializer turns explicit
      // undefined into "tool_call_sound": null on the wire instead of omitting.
      ...(spec.toolCallSound
        ? { toolCallSound: spec.toolCallSound, toolCallSoundBehavior: "auto" as const }
        : {}),
      apiSchema: {
        url: `${baseUrl}${spec.path}`,
        method: "POST",
        requestHeaders: { "x-agent-secret": secret },
        requestBodySchema: {
          type: "object",
          required: [...SHARED_REQUIRED, ...spec.required],
          properties: { ...sharedFields(), ...spec.params },
        },
      },
    },
  };
}

export function buildBuiltInTools(
  assistant: Assistant,
  includeLanguageDetection = true,
): ElevenLabs.BuiltInToolsOutput {
  const escalation = parseEscalation(assistant.routing);

  const tools: ElevenLabs.BuiltInToolsOutput = {
    endCall: { name: "end_call", params: { systemToolType: "end_call" } },
    voicemailDetection: {
      name: "voicemail_detection",
      params: { systemToolType: "voicemail_detection" },
    },
  };
  if (includeLanguageDetection) {
    tools.languageDetection = {
      name: "language_detection",
      params: { systemToolType: "language_detection" },
    };
  }

  if (escalation.targets.length > 0) {
    // One entry per destination, each with its own condition, so the agent can
    // route (billing vs the on-call engineer) instead of dumping every caller
    // on one number.
    //
    // When any destination is scheduled, every condition carries a second
    // clause. The tool itself cannot know the time - it is static agent config -
    // so the real decision is the {{transfer_policy}} line in the prompt, filled
    // per call. The clause only stops the condition from contradicting it:
    // without it the tool advertises an unconditional "caller asked for a human
    // ⇒ transfer", which is precisely what the prompt may be forbidding.
    const gated = needsPerCallPolicy(escalation);
    tools.transferToNumber = {
      name: "transfer_to_number",
      description:
        "Transfer the caller to a person when they ask for one, when the request is beyond what you can handle, or when they are upset or describing an emergency.",
      params: {
        systemToolType: "transfer_to_number",
        transfers: escalation.targets.map((target) => ({
          transferDestination: { type: "phone" as const, phoneNumber: target.number },
          condition: transferCondition(target, gated),
          // Spread, not assign: an explicit undefined serializes as
          // "transfer_type": null instead of being omitted, which would override
          // the platform default rather than leave it alone.
          ...(transferTypeFor(target) ? { transferType: transferTypeFor(target) } : {}),
        })),
        enableClientMessage: true,
      },
    };
  }

  return tools;
}

export async function createAgentTools(
  capabilities: AgentCapabilities,
  /** The business's own actions, already validated - see ./custom-tools.ts. */
  customTools: CustomTool[] = [],
): Promise<{ toolIds: string[]; tools: AgentTool[] }> {
  const baseUrl = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  const secret = process.env.AGENT_WEBHOOK_SECRET ?? "";

  const client = elevenClient();

  const requests: { name: string; build: () => Promise<ElevenLabs.ToolRequestModel> }[] = [];

  // Our own webhook tools need the callback URL and shared secret. Custom
  // actions point at the customer's own API and need neither, so they are still
  // created when ours cannot be.
  if (baseUrl && secret) {
    const headerValue = (await workspaceSecretLocator(secret)) ?? secret;
    for (const spec of webhookToolSpecs(capabilities)) {
      requests.push({
        name: spec.name,
        build: async () => toToolRequest(spec, baseUrl, headerValue),
      });
    }
  } else {
    console.warn(
      "[agent-tools] APP_BASE_URL or AGENT_WEBHOOK_SECRET unset - agent gets no server tools (Q&A + system tools only).",
    );
  }

  for (const tool of customTools) {
    requests.push({
      name: tool.name,
      build: async () => {
        // The header value lives in a workspace secret; only its id is stored
        // on the assistant, so the credential is never in our database.
        const auth = tool.authSecretId ? { secretId: tool.authSecretId } : undefined;
        return toCustomToolRequest(tool, auth);
      },
    });
  }

  if (requests.length === 0) return { toolIds: [], tools: [] };

  const created = await Promise.all(
    requests.map(async ({ name, build }) => {
      try {
        const t = await client.conversationalAi.tools.create(await build());
        return { id: t.id, name };
      } catch (err) {
        console.error("[agent-tools] tool create failed", name, err);
        return null;
      }
    }),
  );
  const tools = created.filter((t): t is AgentTool => t !== null);
  return { toolIds: tools.map((t) => t.id), tools };
}

export async function deleteAgentTools(tools: AgentTool[]): Promise<void> {
  if (!tools.length) return;
  const client = elevenClient();
  await Promise.all(
    tools.map(async (tool) => {
      try {
        await client.conversationalAi.tools.delete(tool.id, { force: true });
      } catch (err) {
        console.error("[agent-tools] tool delete failed", tool.id, err);
      }
    }),
  );
}
