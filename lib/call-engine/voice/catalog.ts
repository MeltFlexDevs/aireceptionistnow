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
 * Built-in override voices keyed by base language code. Empty by default except
 * English, which intentionally has no override so the assistant's own configured
 * voice is kept when the caller speaks English. Add native voice ids from your
 * ElevenLabs account here to hard-code a per-language voice, e.g.:
 *   es: "<spanish-voice-id>",
 *   de: "<german-voice-id>",
 *
 * Prefer the ELEVENLABS_VOICE_OVERRIDES env var (a JSON map) for deploy-time
 * config; env entries take precedence over this map.
 */
export const VOICE_BY_LANGUAGE: Record<string, string> = {
  // ElevenLabs premade voices — global ids, multilingual via eleven_flash_v2_5.
  // Charlotte handles Slovak/Czech well; swap for a native Voice Library id later.
  sk: "XB0fDUnXU5powFXDhCwa", // Charlotte
  cs: "XB0fDUnXU5powFXDhCwa", // Charlotte (Czech shares the pick)
  // es: "...",
  // fr: "...",
  // de: "...",
};

// Parse ELEVENLABS_VOICE_OVERRIDES once. Read straight from process.env (not the
// validated env) so this module stays independent of full env validation and is
// safe to import in isolation; a malformed value is logged and ignored rather
// than failing a call.
let envOverrides: Record<string, string> | null = null;
function envVoiceOverrides(): Record<string, string> {
  if (envOverrides) return envOverrides;
  envOverrides = {};
  const raw = process.env.ELEVENLABS_VOICE_OVERRIDES;
  if (!raw) return envOverrides;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const [lang, voiceId] of Object.entries(parsed)) {
      if (typeof voiceId === "string" && voiceId) {
        envOverrides[baseLanguage(lang)] = voiceId;
      }
    }
  } catch (err) {
    console.error("[voice] invalid ELEVENLABS_VOICE_OVERRIDES JSON", err);
  }
  return envOverrides;
}

/**
 * The voice id to synthesize a given language with. Resolution order:
 *   1. ELEVENLABS_VOICE_OVERRIDES env map (deploy-time config), then
 *   2. the built-in VOICE_BY_LANGUAGE map, then
 *   3. the assistant's configured voice as a fallback.
 * The multilingual model still pronounces the language correctly via the
 * language_code hint when no override exists, so a missing entry is not a failure.
 */
export function bestVoiceForLanguage(code: string, fallbackVoiceId: string): string {
  const base = baseLanguage(code);
  return envVoiceOverrides()[base] ?? VOICE_BY_LANGUAGE[base] ?? fallbackVoiceId;
}

/** Whether an assistant's language setting means "auto-detect the caller". */
export function isAutoLanguage(code: string): boolean {
  const c = (code || "").toLowerCase();
  return c === "multi" || c === "auto" || c === "";
}
