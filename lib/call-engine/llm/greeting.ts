import { getEnv } from "../env";
import { languageName } from "../voice/phone-language";
import { getGemini } from "./gemini";

const translationCache = new Map<string, string>();

export async function localizeGreeting(
  greeting: string,
  languageCode: string,
): Promise<string> {
  const name = languageName(languageCode);
  // No-op for English or an unmapped code - the configured greeting already fits.
  if (!greeting.trim() || name === "English" || name === languageCode) {
    return greeting;
  }

  const cacheKey = `${languageCode} ${greeting}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  const system =
    "You translate a short phone greeting for a business's phone receptionist. " +
    "Return ONLY the translated greeting - no quotes, no notes, no alternatives. " +
    "Keep it to one natural, warm sentence as a receptionist would answer the " +
    "phone. Preserve any business name verbatim, and keep the greeting speaking " +
    "as the business itself (we/our), never about it in the third person.";
  const prompt = `Translate this greeting into ${name}:\n${greeting}`;

  try {
    const text = await translateWithGemini(system, prompt);
    const cleaned = text.trim().replace(/^["']|["']$/g, "");
    if (cleaned) translationCache.set(cacheKey, cleaned);
    return cleaned || greeting;
  } catch (err) {
    console.error("[greeting] localize failed", err);
    return greeting;
  }
}

async function translateWithGemini(system: string, prompt: string): Promise<string> {
  const res = await getGemini().models.generateContent({
    model: getEnv().GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: system,
      maxOutputTokens: 200,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  return res.text ?? "";
}
