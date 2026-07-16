import crypto from "node:crypto";
import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { elevenClient } from "./eleven-client";
import type { AgentTool, Assistant } from "../../dashboard/db";

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
}

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
  const canRead = access.length > 0;
  const canBook = access.some((a) => (a as { level?: unknown })?.level === "write");
  return { transferTo, canRead, canBook };
}

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
      console.error("[agent-tools] workspace secret setup failed, using plaintext header", err);
      secretLocatorPromise = null;
      return null;
    }
  })();
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
      responseTimeoutSecs: 15,
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

  const headerValue = (await workspaceSecretLocator(secret)) ?? secret;

  const created = await Promise.all(
    webhookToolSpecs(assistant).map(async (spec) => {
      try {
        const t = await client.conversationalAi.tools.create(
          toToolRequest(spec, baseUrl, headerValue),
        );
        return { id: t.id, name: spec.name };
      } catch (err) {
        console.error("[agent-tools] tool create failed", spec.name, err);
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
