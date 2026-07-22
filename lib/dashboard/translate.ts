import { unstable_cache } from "next/cache";
import { getEnv } from "../call-engine/env";
import { getGemini } from "../call-engine/llm/gemini";

// Display-time translation of call summaries/transcripts into the dashboard
// language. Cached per (content, locale): each text costs one Gemini call ever.

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  de: "German",
  es: "Spanish",
  fr: "French",
  it: "Italian",
  nl: "Dutch",
  pt: "Portuguese",
  sk: "Slovak",
};

function checksum(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `${h}:${s.length}`;
}

async function gemini(system: string, prompt: string, maxTokens: number): Promise<string> {
  const res = await (await getGemini()).models.generateContent({
    model: getEnv().GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: system,
      maxOutputTokens: maxTokens,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  return (res.text ?? "").trim();
}

export function translateText(text: string, locale: string): Promise<string> {
  const clean = (text ?? "").trim();
  const target = LOCALE_NAMES[locale];
  if (!clean || !target) return Promise.resolve(text);
  return unstable_cache(
    async () => {
      const out = await gemini(
        `You translate dashboard text for a business owner. Translate the user's text into ${target}. ` +
          `If it is already in ${target}, return it EXACTLY unchanged. ` +
          `Return ONLY the text - no quotes, no notes.`,
        clean,
        1500,
      );
      return out || clean;
    },
    ["ui-translation", locale, checksum(clean)],
    { revalidate: 30 * 24 * 3600 },
  )().catch((err) => {
    console.error("[translate] text translation failed", err);
    return text;
  });
}

// Batch variant for transcripts: one model call for the whole conversation.
// Throws on model failure so callers can tell "failed" from "already in the
// target language"; any shape mismatch falls back to the originals.
export function translateTextsOrThrow(texts: string[], locale: string): Promise<string[]> {
  const target = LOCALE_NAMES[locale];
  if (!target || texts.length === 0) return Promise.resolve(texts);
  const joined = JSON.stringify(texts);
  return unstable_cache(
    async () => {
      const out = await gemini(
        `You translate a phone-call transcript for a business owner. The input is a JSON array of utterances. ` +
          `Translate each utterance into ${target}; keep utterances already in ${target} EXACTLY unchanged. ` +
          `Return ONLY a JSON array of strings with the same length and order - no markdown fences, no notes.`,
        joined,
        8192,
      );
      const parsed = JSON.parse(out.replace(/^```(?:json)?\s*|\s*```$/g, "")) as unknown;
      if (!Array.isArray(parsed) || parsed.length !== texts.length) return texts;
      return parsed.map((s, i) => (typeof s === "string" && s.trim() ? s : texts[i]));
    },
    ["ui-translation-batch", locale, checksum(joined)],
    { revalidate: 30 * 24 * 3600 },
  )();
}
