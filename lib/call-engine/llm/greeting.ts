import { getEnv } from "../env";
import { languageName } from "../voice/phone-language";
import { getAnthropic } from "./claude";
import { getGemini } from "./gemini";

// Localize a fixed greeting into the caller's language. Used at call start (tier
// B) and by the conversation-init webhook (tier A) so the very first thing the
// caller hears is in their own language. Best-effort: any failure falls back to
// the original greeting, so a translation hiccup never blocks the call.

/**
 * Return the greeting rewritten in `languageCode`, or the original greeting when
 * the target language is English/unknown or translation fails. Kept to one short
 * sentence so it stays a natural phone greeting, not a paragraph.
 */
export async function localizeGreeting(
  greeting: string,
  languageCode: string,
): Promise<string> {
  const name = languageName(languageCode);
  // No-op for English or an unmapped code — the configured greeting already fits.
  if (!greeting.trim() || name === "English" || name === languageCode) {
    return greeting;
  }

  const system =
    "You translate a short phone greeting for an AI receptionist. Return ONLY " +
    "the translated greeting — no quotes, no notes, no alternatives. Keep it to " +
    "one natural, warm sentence as a receptionist would answer the phone. " +
    "Preserve any business name verbatim.";
  const prompt = `Translate this greeting into ${name}:\n${greeting}`;

  try {
    const text =
      getEnv().LLM_PROVIDER === "claude"
        ? await translateWithClaude(system, prompt)
        : await translateWithGemini(system, prompt);
    const cleaned = text.trim().replace(/^["']|["']$/g, "");
    return cleaned || greeting;
  } catch (err) {
    console.error("[greeting] localize failed", err);
    return greeting;
  }
}

async function translateWithClaude(system: string, prompt: string): Promise<string> {
  const message = await getAnthropic().messages.create({
    model: getEnv().CLAUDE_MODEL,
    max_tokens: 200,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content.find((b) => b.type === "text");
  return block && "text" in block ? block.text : "";
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
