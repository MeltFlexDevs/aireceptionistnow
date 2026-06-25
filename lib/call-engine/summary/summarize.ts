import { getAnthropic } from "../llm/claude";
import { getEnv } from "../env";
import type { CallSummary, NumberConfig, TranscriptTurn } from "../types";

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

  const message = await getAnthropic().messages.create({
    model: getEnv().CLAUDE_MODEL,
    max_tokens: 600,
    system:
      "You summarize a phone call for a business dashboard. Be concise, factual, and neutral.",
    messages: [
      {
        role: "user",
        content: `Call for ${config.businessName} on the "${config.label}" line.\n\nTranscript:\n${transcript}\n\nProduce the JSON summary.`,
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: SUMMARY_SCHEMA },
      effort: "medium",
    },
  });

  const block = message.content.find((b) => b.type === "text");
  const raw = JSON.parse(block && "text" in block ? block.text : "{}") as RawSummary;

  return {
    summary: raw.summary ?? "",
    outcome: raw.outcome ?? "resolved",
    sentiment: raw.sentiment ?? "neutral",
    actionItems: raw.action_items ?? [],
    tags: raw.tags ?? [],
  };
}
