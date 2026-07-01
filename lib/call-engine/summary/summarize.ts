import { getGemini } from "../llm/gemini";
import { getEnv } from "../env";
import type {
  CallAction,
  CallSummary,
  NumberConfig,
  TranscriptTurn,
} from "../types";

// Post-call summarization. Not latency-sensitive, so this runs after the call
// with structured output to guarantee a clean, dashboard-ready shape.

const SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string", description: "2-4 sentence recap of the call" },
    outcome: {
      type: "string",
      enum: ["booked", "message", "transferred", "resolved", "abandoned"],
    },
    sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
    action_items: { type: "array", items: { type: "string" } },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "outcome", "sentiment", "action_items", "tags"],
} as const;

interface RawSummary {
  summary: string;
  outcome: CallSummary["outcome"];
  sentiment: CallSummary["sentiment"];
  action_items: string[];
  tags: string[];
}

export async function summarizeCall(
  turns: TranscriptTurn[],
  config: NumberConfig,
  actions: CallAction[] = [],
): Promise<CallSummary> {
  if (turns.length === 0) {
    return {
      summary: "Caller hung up before any conversation.",
      outcome: "abandoned",
      sentiment: "neutral",
      actionItems: [],
      tags: [],
    };
  }

  const transcript = turns
    .map((t) => `${t.role === "caller" ? "Caller" : "AI"}: ${t.text}`)
    .join("\n");

  const actionsBlock = formatActions(actions);

  const system =
    "You summarize a phone call for a business dashboard. Recap what the caller " +
    "asked for, how the assistant responded, and what was actually done (the " +
    "actions). Be concise, factual, and neutral. Reflect every action in the " +
    "summary and surface anything that failed or is still pending as an action item.";
  const prompt =
    `Call for ${config.businessName} on the "${config.label}" line.\n\n` +
    `Transcript:\n${transcript}\n\n` +
    `Actions the assistant took:\n${actionsBlock}\n\n` +
    `Produce the JSON summary.`;

  // Not latency-sensitive — structured JSON output guarantees a clean,
  // dashboard-ready shape. Gemini is our only backend LLM.
  const raw = await summarizeWithGemini(system, prompt);

  return {
    summary: raw.summary ?? "",
    outcome: raw.outcome ?? "resolved",
    sentiment: raw.sentiment ?? "neutral",
    actionItems: raw.action_items ?? [],
    tags: raw.tags ?? [],
  };
}

/** Render the structured actions into compact lines for the prompt, e.g.
 *  "- booking [done]: Consultation at 2026-07-02T15:00:00Z". Keeps the most
 *  useful payload fields per action type and always shows the status + error. */
function formatActions(actions: CallAction[]): string {
  if (actions.length === 0) return "(none)";
  return actions
    .map((a) => {
      const p = a.payload ?? {};
      const detail =
        a.type === "booking"
          ? [p.title, p.start_time].filter(Boolean).join(" at ")
          : a.type === "message"
            ? String(p.message ?? "")
            : a.type === "transfer"
              ? String(p.reason ?? "")
              : "";
      const error = a.error ? ` — error: ${a.error}` : "";
      return `- ${a.type} [${a.status}]${detail ? `: ${detail}` : ""}${error}`;
    })
    .join("\n");
}

function parseSummary(text: string): RawSummary {
  try {
    return JSON.parse(text || "{}") as RawSummary;
  } catch {
    return {} as RawSummary;
  }
}

async function summarizeWithGemini(system: string, prompt: string): Promise<RawSummary> {
  const res = await getGemini().models.generateContent({
    model: getEnv().GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: system,
      maxOutputTokens: 600,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseJsonSchema: SUMMARY_SCHEMA,
    },
  });
  return parseSummary(res.text ?? "{}");
}
