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

/** Default TTS voice (ElevenLabs "Rachel") — the base voice for the demo agent
 *  and any assistant without an explicit voice. Single source of truth. */
export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

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
  // Hand-pinned per-language voice ids (base language code -> ElevenLabs voice id).
  // Empty by default: voices are auto-resolved from YOUR account by language (see
  // voiceForLanguage). Add an entry here — or via ELEVENLABS_VOICE_OVERRIDES — only
  // to force a specific voice for a language, e.g. sk: "<slovak-voice-id>". Don't
  // put an id here that isn't on the account: an invalid preset voice makes the
  // whole multilingual agent config get rejected at sync time.
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

// The account's voices grouped by the base language they're verified/labeled for,
// fetched once from /v1/voices (best-effort, cached). This is how a language gets
// a voice that natively fits it: add e.g. a Slovak voice from the Voice Library to
// your account and Slovak calls pick it up automatically. Premade multilingual
// voices carry no per-language verification, so they don't get mapped here — which
// is correct: they're spoken by the base voice, not mistaken for native.
let voiceMapPromise: Promise<Record<string, string>> | null = null;

interface RawVoice {
  voice_id: string;
  labels?: Record<string, string>;
  verified_languages?: Array<{ language?: string }>;
}

async function accountVoicesByLanguage(): Promise<Record<string, string>> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return {};
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as { voices?: RawVoice[] };
    const map: Record<string, string> = {};
    for (const v of data.voices ?? []) {
      if (!v.voice_id) continue;
      const langs = new Set<string>();
      for (const vl of v.verified_languages ?? []) {
        if (vl.language) langs.add(baseLanguage(vl.language));
      }
      if (v.labels?.language) langs.add(baseLanguage(v.labels.language));
      // First voice seen for a language wins (stable API order → deterministic).
      for (const l of langs) if (!map[l]) map[l] = v.voice_id;
    }
    return map;
  } catch {
    return {};
  }
}

const XI_API = "https://api.elevenlabs.io";

// base language -> the account voice id we imported from the shared Voice Library
// for it (once). Separate from the account scan so a "not on account" result
// doesn't poison the cache before an import gets a chance to run.
const importedVoiceCache = new Map<string, Promise<string | null>>();

// Find a voice for `base` in the shared Voice Library and add it to the account —
// library voices must be on the account to be usable as a TTS voice. Returns the
// new account voice id, or null when nothing matched / the add failed.
async function importSharedVoiceForLanguage(base: string, key: string): Promise<string | null> {
  const q = new URLSearchParams({ language: base, page_size: "1", sort: "trending" });
  const res = await fetch(`${XI_API}/v1/shared-voices?${q}`, { headers: { "xi-api-key": key } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    voices?: Array<{ public_owner_id?: string; voice_id?: string; name?: string }>;
  };
  const hit = (data.voices ?? [])[0];
  if (!hit?.public_owner_id || !hit.voice_id) return null;

  const add = await fetch(`${XI_API}/v1/voices/add/${hit.public_owner_id}/${hit.voice_id}`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({ new_name: `${hit.name ?? "Voice"} (${base})` }),
  });
  if (!add.ok) return null;
  const added = (await add.json()) as { voice_id?: string };
  return added.voice_id ?? null;
}

/**
 * The voice id to synthesize a given language with. Resolution order:
 *   1. ELEVENLABS_VOICE_OVERRIDES env map (deploy-time config), then
 *   2. the built-in VOICE_BY_LANGUAGE map, then
 *   3. a voice already on the account verified/labeled for that language, then
 *   4. (only when importFromLibrary) a shared Voice Library voice for that
 *      language, added to the account, then
 *   5. the assistant's configured voice as a fallback.
 * The multilingual model still pronounces the language via the language_code hint
 * when no match exists, so a missing entry is not a failure.
 *
 * importFromLibrary is OFF for bulk callers — agent sync builds ~30 language
 * presets and must not import (and burn a voice slot for) every language. The
 * per-call init webhook turns it ON for the ONE language the caller is speaking.
 */
export async function voiceForLanguage(
  code: string,
  fallbackVoiceId: string,
  importFromLibrary = false,
): Promise<string> {
  const base = baseLanguage(code);
  const explicit = envVoiceOverrides()[base] ?? VOICE_BY_LANGUAGE[base];
  if (explicit) return explicit;

  const key = process.env.ELEVENLABS_API_KEY;
  // English uses the assistant's own configured voice; no key → nothing to query.
  if (!key || base === "en") return fallbackVoiceId;

  voiceMapPromise ??= accountVoicesByLanguage();
  const onAccount = (await voiceMapPromise)[base];
  if (onAccount) return onAccount;

  if (!importFromLibrary) return fallbackVoiceId;
  if (!importedVoiceCache.has(base)) {
    importedVoiceCache.set(base, importSharedVoiceForLanguage(base, key).catch(() => null));
  }
  return (await importedVoiceCache.get(base)!) ?? fallbackVoiceId;
}

/** Whether an assistant's language setting means "auto-detect the caller". */
export function isAutoLanguage(code: string): boolean {
  const c = (code || "").toLowerCase();
  return c === "multi" || c === "auto" || c === "";
}
