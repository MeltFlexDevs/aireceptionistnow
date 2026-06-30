import { getAnthropic } from "../llm/claude";
import { getGemini } from "../llm/gemini";
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

  const system =
    "You summarize a phone call for a business dashboard. Be concise, factual, and neutral.";
  const prompt = `Call for ${config.businessName} on the "${config.label}" line.\n\nTranscript:\n${transcript}\n\nProduce the JSON summary.`;

  // Summarize with the same brain that runs the calls, so a single-provider
  // deploy needs only that provider's key. Not latency-sensitive — structured
  // JSON output guarantees a clean, dashboard-ready shape.
  const raw =
    getEnv().LLM_PROVIDER === "claude"
      ? await summarizeWithClaude(system, prompt)
      : await summarizeWithGemini(system, prompt);

  return {
    summary: raw.summary ?? "",
    outcome: raw.outcome ?? "resolved",
    sentiment: raw.sentiment ?? "neutral",
    actionItems: raw.action_items ?? [],
    tags: raw.tags ?? [],
  };
}

function parseSummary(text: string): RawSummary {
  try {
    return JSON.parse(text || "{}") as RawSummary;
  } catch {
    return {} as RawSummary;
  }
}

async function summarizeWithClaude(system: string, prompt: string): Promise<RawSummary> {
  const message = await getAnthropic().messages.create({
    model: getEnv().CLAUDE_MODEL,
    max_tokens: 600,
    system,
    messages: [{ role: "user", content: prompt }],
    output_config: {
      format: { type: "json_schema", schema: SUMMARY_SCHEMA },
      effort: "medium",
    },
  });
  const block = message.content.find((b) => b.type === "text");
  return parseSummary(block && "text" in block ? block.text : "{}");
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
