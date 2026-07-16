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

const smsCache = new Map<string, string>();

// Translate an outbound customer SMS into the caller's language. Falls back
// to the original text on any failure.
export async function localizeSms(body: string, languageCode: string): Promise<string> {
  const name = languageName(languageCode);
  if (!body.trim() || name === "English" || name === languageCode) return body;

  const cacheKey = `${languageCode} ${body}`;
  const cached = smsCache.get(cacheKey);
  if (cached) return cached;

  const system =
    "You translate a short SMS a business sends to its customer. " +
    "Return ONLY the translated SMS text - no quotes, no notes. " +
    "Keep business names, person names, phone numbers, dates and times verbatim, " +
    "and keep it as short, warm, and clear as the original.";
  try {
    const text = await translateWithGemini(system, `Translate this SMS into ${name}:\n${body}`);
    const cleaned = text.trim().replace(/^["']|["']$/g, "");
    if (cleaned) {
      smsCache.set(cacheKey, cleaned);
      if (smsCache.size > 200) smsCache.clear();
    }
    return cleaned || body;
  } catch (err) {
    console.error("[sms] localize failed", err);
    return body;
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
