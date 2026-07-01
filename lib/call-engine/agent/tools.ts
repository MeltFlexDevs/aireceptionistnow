import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { elevenClient } from "./eleven-client";
import type { AgentTool, Assistant } from "../../dashboard/db";

// The receptionist's *actions* — what the ElevenLabs agent can actually DO on a
// call, built from the assistant's settings. Two kinds:
//
//   • Webhook (server) tools — check_availability / book_appointment /
//     take_message. Each is a standalone ElevenLabs "tool" object that POSTs to
//     our /api/agent/* routes; the routes run the same shared actions (actions.ts)
//     and hand a spoken string back to the agent. ElevenLabs deprecated inline
//     prompt.tools in favour of tool_ids referencing these objects, so we create
//     them here and attach their ids (see sync.ts). We track [{id, name}] so a
//     re-sync deletes the previous set and a delete tears them down.
//
//   • Built-in system tools — end_call, transfer_to_number, voicemail_detection,
//     language_detection. These live inline on the prompt (builtInTools) — no
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

/** Read the capability flags off an assistant's routing JSON. */
function capabilities(assistant: Assistant): { transferTo: string; hasCalendar: boolean } {
  const r = (assistant.routing ?? {}) as {
    transferTo?: unknown;
    calendar?: { access?: unknown[] };
  };
  const transferTo = typeof r.transferTo === "string" ? r.transferTo.trim() : "";
  const access = r.calendar?.access;
  const hasCalendar = Array.isArray(access) && access.length > 0;
  return { transferTo, hasCalendar };
}

/** Which webhook server tools this assistant should expose, per its settings. */
function webhookToolSpecs(assistant: Assistant): WebhookToolSpec[] {
  const { hasCalendar } = capabilities(assistant);
  const specs: WebhookToolSpec[] = [];

  if (hasCalendar) {
    specs.push({
      name: "check_availability",
      path: "/api/agent/check-availability",
      description:
        "Check whether a specific time slot is free on the business calendar before offering or confirming it. Call this whenever the caller proposes or asks about a time. Provide start_time and end_time as ISO 8601 timestamps.",
      params: {
        start_time: {
          type: "string",
          description: "Requested start, ISO 8601 (e.g. 2026-07-02T15:00:00Z).",
        },
        end_time: {
          type: "string",
          description: "Requested end, ISO 8601 (e.g. 2026-07-02T15:30:00Z).",
        },
      },
      required: ["start_time", "end_time"],
    });
    specs.push({
      name: "book_appointment",
      path: "/api/agent/book-appointment",
      description:
        "Book an appointment on the business calendar once the caller has agreed to a specific time. Only call after confirming the time is free. Collect the caller's name if you can.",
      params: {
        title: {
          type: "string",
          description: "Short title for the appointment, e.g. 'Consultation with Jane Doe'.",
        },
        start_time: { type: "string", description: "Start, ISO 8601." },
        end_time: { type: "string", description: "End, ISO 8601." },
        attendee_name: { type: "string", description: "Caller's full name, if given." },
        attendee_phone: { type: "string", description: "Callback number, if different from caller ID." },
        notes: { type: "string", description: "Any relevant details the caller mentioned." },
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

/** Turn a spec into the ElevenLabs standalone-tool create request. */
function toToolRequest(
  spec: WebhookToolSpec,
  baseUrl: string,
  secret: string,
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
export function buildBuiltInTools(assistant: Assistant): ElevenLabs.BuiltInToolsOutput {
  const { transferTo } = capabilities(assistant);

  const tools: ElevenLabs.BuiltInToolsOutput = {
    endCall: { name: "end_call", params: { systemToolType: "end_call" } },
    languageDetection: {
      name: "language_detection",
      params: { systemToolType: "language_detection" },
    },
    voicemailDetection: {
      name: "voicemail_detection",
      params: { systemToolType: "voicemail_detection" },
    },
  };

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
 * (returning empty) when APP_BASE_URL or AGENT_WEBHOOK_SECRET is unset — the agent
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
      "[agent-tools] APP_BASE_URL or AGENT_WEBHOOK_SECRET unset — agent gets no server tools (Q&A + system tools only).",
    );
    return { toolIds: [], tools: [] };
  }

  const client = elevenClient();
  const toolIds: string[] = [];
  const tools: AgentTool[] = [];

  for (const spec of webhookToolSpecs(assistant)) {
    try {
      const created = await client.conversationalAi.tools.create(
        toToolRequest(spec, baseUrl, secret),
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
