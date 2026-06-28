// Maps a detected/selected language to the best TTS voice for it. ElevenLabs
// multilingual models (eleven_flash_v2_5) let one voice speak many languages, so
// a missing entry is not a failure — the configured voice still speaks the
// caller's language. This map is the override hook for when you have a voice that
// sounds natively right for a language: add the ElevenLabs voice id under the
// base language code (e.g. "es", "de") and it takes precedence in auto mode.

/** Strip a region subtag: "es-419" -> "es", "en-GB" -> "en". */
export function baseLanguage(code: string): string {
  return (code || "").split("-")[0].toLowerCase();
}

/**
 * Override voices keyed by base language code. Empty by default except English,
 * which intentionally has no override so the assistant's own configured voice is
 * kept when the caller speaks English. Populate with native voice ids from your
 * ElevenLabs account to get a per-language voice, e.g.:
 *   es: "<spanish-voice-id>",
 *   de: "<german-voice-id>",
 */
export const VOICE_BY_LANGUAGE: Record<string, string> = {
  // es: "...",
  // fr: "...",
  // de: "...",
};

/**
 * The voice id to synthesize a given language with. Falls back to the assistant's
 * configured voice when there's no language-specific override — the multilingual
 * model still pronounces the language correctly via the language_code hint.
 */
export function bestVoiceForLanguage(code: string, fallbackVoiceId: string): string {
  const base = baseLanguage(code);
  return VOICE_BY_LANGUAGE[base] ?? fallbackVoiceId;
}

/** Whether an assistant's language setting means "auto-detect the caller". */
export function isAutoLanguage(code: string): boolean {
  const c = (code || "").toLowerCase();
  return c === "multi" || c === "auto" || c === "";
}
