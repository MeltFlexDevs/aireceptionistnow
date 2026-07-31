import { getGemini } from "../llm/gemini";
import { getEnv } from "../env";
import { renderKnowledgeMarkdown } from "../../knowledge/sources";
import { languageFromPhone, languageName } from "../voice/phone-language";
import type {
  CallAction,
  CallSummary,
  NumberConfig,
  TranscriptTurn,
} from "../types";

/** How much of the knowledge base the accuracy audit gets to see. */
const KNOWLEDGE_DIGEST_CHARS = 12_000;
/** A long list is noise; the first few are what the operator will act on. */
const MAX_CLAIMS = 8;

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
    unsupported_claims: {
      type: "array",
      items: { type: "string" },
      description:
        "Specific factual claims the assistant made to the caller that the business information does not support. Quote or paraphrase each one. Empty if everything it stated was backed.",
    },
    needs_review: {
      type: "boolean",
      description:
        "True if a person at the business should read this call - an unsupported claim, an angry caller, or a promise that may not be kept.",
    },
  },
  required: [
    "summary",
    "outcome",
    "sentiment",
    "action_items",
    "tags",
    "unsupported_claims",
    "needs_review",
  ],
} as const;

interface RawSummary {
  summary: string;
  outcome: CallSummary["outcome"];
  sentiment: CallSummary["sentiment"];
  action_items: string[];
  tags: string[];
  unsupported_claims: string[];
  needs_review: boolean;
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
      unsupportedClaims: [],
      needsReview: false,
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
    // The groundedness pass. Folded into the same call rather than a second
    // one: it needs exactly the same transcript, and a call summary already
    // costs one Gemini round trip in the background.
    "You ALSO audit the assistant for accuracy. Compare every factual statement it " +
    "made - prices, hours, availability, what is included, policies, addresses, " +
    "names - against the business information you are given. List in " +
    '"unsupported_claims" anything it stated as fact that the business information ' +
    "does not back up. Judge only what it ASSERTED: questions, acknowledgements, " +
    "generic pleasantries, and anything it explicitly said it could not confirm are " +
    "never unsupported claims, and neither is a detail the CALLER supplied. If the " +
    "business information is empty, only flag statements that are specific and " +
    "checkable rather than everything it said. " +
    langDirective +
    ` Keep the "outcome" and "sentiment" values as the allowed English enum values.`;

  // Trimmed hard: this is a background summarization, but the knowledge base can
  // run to tens of thousands of characters and the audit only needs the facts an
  // answer would have been drawn from.
  const knowledge = renderKnowledgeMarkdown(config.knowledge).slice(0, KNOWLEDGE_DIGEST_CHARS);
  const prompt =
    `Call for ${config.businessName} on the "${config.label}" line.\n\n` +
    `Business information the assistant was given:\n${knowledge || "(none)"}\n\n` +
    `Transcript:\n${transcript}\n\n` +
    `Actions the assistant took:\n${actionsBlock}\n\n` +
    `Produce the JSON summary.`;

  const raw = await summarizeWithGemini(system, prompt);

  const unsupportedClaims = (raw.unsupported_claims ?? []).slice(0, MAX_CLAIMS);
  return {
    summary: raw.summary ?? "",
    outcome: raw.outcome ?? "resolved",
    sentiment: raw.sentiment ?? "neutral",
    actionItems: raw.action_items ?? [],
    tags: raw.tags ?? [],
    unsupportedClaims,
    // An unsupported claim or a caller who left angry always warrants a read,
    // whatever the model decided - those are the two cases where staying quiet
    // costs the business a customer.
    needsReview:
      raw.needs_review === true ||
      unsupportedClaims.length > 0 ||
      raw.sentiment === "angry" ||
      raw.sentiment === "frustrated",
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
      // Raised from 600 for the accuracy audit: a truncated response is not
      // valid JSON, and parseSummary rightly throws rather than persisting a
      // half-summary marked "resolved".
      maxOutputTokens: 900,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseJsonSchema: SUMMARY_SCHEMA,
    },
  });
  return parseSummary(res.text ?? "{}");
}
