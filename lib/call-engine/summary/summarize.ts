import { getGemini } from "../llm/gemini";
import { getEnv } from "../env";
import { languageFromPhone, languageName } from "../voice/phone-language";
import type {
  CallAction,
  CallSummary,
  NumberConfig,
  TranscriptTurn,
} from "../types";

const SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string", description: "2-4 sentence recap of the call" },
    outcome: {
      type: "string",
      enum: ["booked", "message", "transferred", "resolved", "abandoned"],
    },
    sentiment: {
      type: "string",
      enum: ["positive", "neutral", "negative", "frustrated", "angry"],
      description:
        "The caller's overall mood: positive (happy/satisfied), neutral, negative (dissatisfied), frustrated (repeated trouble, impatient), or angry (hostile, raised tone, complaints).",
    },
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
  from = "",
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

  const ownerLangName = localeName(config.ownerLocale);
  const phoneLang = languageFromPhone(from);
  const callerHint = phoneLang ? ` (most likely ${languageName(phoneLang)})` : "";
  const langDirective = ownerLangName
    ? `Write the "summary" and every "action_items" entry in ${ownerLangName}.`
    : `Write the "summary" and every "action_items" entry in the language the caller spoke${callerHint}.`;

  const system =
    "You summarize a phone call for a business dashboard. Recap what the caller " +
    "asked for, how the assistant responded, and what was actually done (the " +
    "actions). Be concise, factual, and neutral. Reflect every action in the " +
    "summary and surface anything that failed or is still pending as an action item. " +
    "Pick the outcome that best fits: 'booked' if an appointment was made, " +
    "'message' if a message/callback was taken, 'transferred' if handed to a human, " +
    "'resolved' if the caller's question was answered. Use 'abandoned' ONLY when the " +
    "caller hung up before anything was accomplished - never for a call where the " +
    "assistant actually helped. Also judge the caller's sentiment. " +
    langDirective +
    ` Keep the "outcome" and "sentiment" values as the allowed English enum values.`;
  const prompt =
    `Call for ${config.businessName} on the "${config.label}" line.\n\n` +
    `Transcript:\n${transcript}\n\n` +
    `Actions the assistant took:\n${actionsBlock}\n\n` +
    `Produce the JSON summary.`;

  const raw = await summarizeWithGemini(system, prompt);

  return {
    summary: raw.summary ?? "",
    outcome: raw.outcome ?? "resolved",
    sentiment: raw.sentiment ?? "neutral",
    actionItems: raw.action_items ?? [],
    tags: raw.tags ?? [],
  };
}

function localeName(locale: string): string {
  const code = (locale ?? "").trim();
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? "";
  } catch {
    return "";
  }
}

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
      const error = a.error ? ` - error: ${a.error}` : "";
      return `- ${a.type} [${a.status}]${detail ? `: ${detail}` : ""}${error}`;
    })
    .join("\n");
}

function parseSummary(text: string): RawSummary {
  try {
    return JSON.parse(text || "{}") as RawSummary;
  } catch (err) {
    // Persisting {} here would show the business an empty summary marked
    // "resolved" - fail instead so runPostCall records a real error.
    console.error("[summary] model returned unparseable JSON:", text.slice(0, 300), err);
    throw new Error("summary output was not valid JSON");
  }
}

async function summarizeWithGemini(system: string, prompt: string): Promise<RawSummary> {
  const res = await (await getGemini()).models.generateContent({
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
