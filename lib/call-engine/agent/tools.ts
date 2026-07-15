import crypto from "node:crypto";
import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { elevenClient } from "./eleven-client";
import type { AgentTool, Assistant } from "../../dashboard/db";

// The receptionist's *actions* - what the ElevenLabs agent can actually DO on a
// call, built from the assistant's settings. Two kinds:
//
//   • Webhook (server) tools - check_availability / book_appointment /
//     take_message. Each is a standalone ElevenLabs "tool" object that POSTs to
//     our /api/agent/* routes; the routes run the same shared actions (actions.ts)
//     and hand a spoken string back to the agent. ElevenLabs deprecated inline
//     prompt.tools in favour of tool_ids referencing these objects, so we create
//     them here and attach their ids (see sync.ts). We track [{id, name}] so a
//     re-sync deletes the previous set and a delete tears them down.
//
//   • Built-in system tools - end_call, transfer_to_number, voicemail_detection,
//     language_detection. These live inline on the prompt (builtInTools) - no
//     separate object to manage.
//
// Everything is gated by the assistant's settings so the agent is only offered
// the capabilities it's actually configured for (e.g. no calendar → no booking).

/** The three fields every server tool forwards, sourced from ElevenLabs system
 *  dynamic variables. resolveAgentContext (context.ts) reads exactly these. */
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
  /** LLM-supplied params (beyond the shared three). */
  params: Record<string, ElevenLabs.LiteralJsonSchemaProperty>;
  required: string[];
}

/**
 * Read the capability flags off an assistant's routing JSON.
 *
 * Read and write are separate flags, not one "hasCalendar": the three levels a
 * user picks per calendar (none / read / write) only mean anything if a
 * read-only grant withholds the booking tool. Handing an agent a tool it isn't
 * allowed to use invites it to try - and to tell the caller it booked.
 */
function capabilities(assistant: Assistant): {
  transferTo: string;
  canRead: boolean;
  canBook: boolean;
} {
  const r = (assistant.routing ?? {}) as {
    transferTo?: unknown;
    calendar?: { access?: unknown[] };
  };
  const transferTo = typeof r.transferTo === "string" ? r.transferTo.trim() : "";
  const access = Array.isArray(r.calendar?.access) ? r.calendar.access : [];
  // Any granted level can read free/busy; only an explicit "write" may book.
  // Legacy "busy" grants are read-only (the dashboard maps them to read on save).
  const canRead = access.length > 0;
  const canBook = access.some((a) => (a as { level?: unknown })?.level === "write");
  return { transferTo, canRead, canBook };
}

/** Which webhook server tools this assistant should expose, per its settings. */
function webhookToolSpecs(assistant: Assistant): WebhookToolSpec[] {
  const { canRead, canBook } = capabilities(assistant);
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
    });
  }

  // Booking is gated separately: a read-only assistant can quote free/busy but
  // must not be able to write to someone's calendar.
  if (canBook) {
    specs.push({
      name: "book_appointment",
      path: "/api/agent/book-appointment",
      description:
        "Book an appointment on the business calendar once the caller has agreed to a specific time. Only call after confirming the time is free. Collect the caller's name, and whatever this business needs to know about the appointment (see `notes`), before calling this.",
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
          // The agent decides what's worth asking from the business's own
          // knowledge (see composeSystemPrompt) - this is where the answer lands.
          description:
            "Why the caller is coming and anything the business needs to prepare, in their own words - e.g. the reason for a medical visit, or the service they want. Include only what's relevant to this business; leave empty if nothing about it warranted asking.",
        },
      },
      required: ["title", "start_time", "end_time"],
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

// Locator for the workspace secret holding AGENT_WEBHOOK_SECRET, resolved once
// per process. Referencing the secret by id keeps the raw value out of every
// tool config (readable by anyone with workspace access in the dashboard). The
// secret's name embeds a hash of its value, so rotating the env secret
// automatically creates and uses a fresh workspace secret on the next sync.
let secretLocatorPromise: Promise<ElevenLabs.ConvAiSecretLocator | null> | null = null;

function workspaceSecretLocator(secret: string): Promise<ElevenLabs.ConvAiSecretLocator | null> {
  secretLocatorPromise ??= (async () => {
    const name = `agent-webhook-${crypto.createHash("sha256").update(secret).digest("hex").slice(0, 8)}`;
    try {
      const client = elevenClient();
      const existing = (await client.conversationalAi.secrets.list({ search: name })).secrets.find(
        (s) => s.name === name,
      );
      if (existing) return { secretId: existing.secretId };
      const created = await client.conversationalAi.secrets.create({ name, value: secret });
      return { secretId: created.secretId };
    } catch (err) {
      // Best-effort hardening: fall back to the plaintext header value so tool
      // creation (and therefore agent sync) never breaks on the secrets API.
      // Clear the memo so a transient failure doesn't pin every future sync to
      // the plaintext header for the whole process lifetime - the next sync
      // retries the secrets API.
      console.error("[agent-tools] workspace secret setup failed, using plaintext header", err);
      secretLocatorPromise = null;
      return null;
    }
  })();
  return secretLocatorPromise;
}

/** Turn a spec into the ElevenLabs standalone-tool create request. */
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
      responseTimeoutSecs: 20,
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

/**
 * Build the inline built-in system tools for an assistant. end_call is always
 * on; transfer_to_number is added only when a transfer target is configured;
 * voicemail_detection + language_detection are always useful for a receptionist.
 */
// Returns the Output variant because ElevenLabs' ConversationalConfig (what
// agents.create/update accept) is built from the shared Output-typed schema; the
// system-tool bodies are structurally identical to the Input variant, so this is
// purely a which-label question, not a runtime difference.
export function buildBuiltInTools(
  assistant: Assistant,
  // False for the English-only fallback agent: with no language presets there is
  // nothing for language_detection to switch to.
  includeLanguageDetection = true,
): ElevenLabs.BuiltInToolsOutput {
  const { transferTo } = capabilities(assistant);

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

  if (transferTo) {
    tools.transferToNumber = {
      name: "transfer_to_number",
      description:
        "Transfer the caller to a human when they ask for a person, or when the request is beyond what you can handle.",
      params: {
        systemToolType: "transfer_to_number",
        transfers: [
          {
            transferDestination: { type: "phone", phoneNumber: transferTo },
            condition:
              "The caller asks to speak to a human, asks to be transferred, or has a problem you cannot resolve.",
          },
        ],
        enableClientMessage: true,
      },
    };
  }

  return tools;
}

/**
 * Create the standalone webhook tool objects for an assistant and return both the
 * ids to attach (prompt.toolIds) and the records to track. Skips webhook tools
 * (returning empty) when APP_BASE_URL or AGENT_WEBHOOK_SECRET is unset - the agent
 * still works for Q&A + system tools, it just can't reach our action routes.
 *
 * Best-effort per tool: one failed create is logged and skipped, never aborting
 * the whole sync. Callers pass the returned records to setAssistantAgent so a
 * later sync/delete can clean them up.
 */
export async function createAgentTools(
  assistant: Assistant,
): Promise<{ toolIds: string[]; tools: AgentTool[] }> {
  const baseUrl = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  const secret = process.env.AGENT_WEBHOOK_SECRET ?? "";
  if (!baseUrl || !secret) {
    console.warn(
      "[agent-tools] APP_BASE_URL or AGENT_WEBHOOK_SECRET unset - agent gets no server tools (Q&A + system tools only).",
    );
    return { toolIds: [], tools: [] };
  }

  const client = elevenClient();
  const toolIds: string[] = [];
  const tools: AgentTool[] = [];

  // Prefer referencing the secret from the workspace secrets manager; falls
  // back to the raw value if that setup fails.
  const headerValue = (await workspaceSecretLocator(secret)) ?? secret;

  for (const spec of webhookToolSpecs(assistant)) {
    try {
      const created = await client.conversationalAi.tools.create(
        toToolRequest(spec, baseUrl, headerValue),
      );
      toolIds.push(created.id);
      tools.push({ id: created.id, name: spec.name });
    } catch (err) {
      console.error("[agent-tools] tool create failed", spec.name, err);
    }
  }

  return { toolIds, tools };
}

/** Delete standalone tool objects we previously created for an assistant. Best-
 *  effort: force-detaches from any agent and ignores already-gone tools. */
export async function deleteAgentTools(tools: AgentTool[]): Promise<void> {
  if (!tools.length) return;
  const client = elevenClient();
  for (const tool of tools) {
    try {
      await client.conversationalAi.tools.delete(tool.id, { force: true });
    } catch (err) {
      console.error("[agent-tools] tool delete failed", tool.id, err);
    }
  }
}
