
export function baseLanguage(code: string): string {
  return (code || "").split("-")[0].toLowerCase();
}

export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export const VOICE_BY_LANGUAGE: Record<string, string> = {
};

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
    const native: Record<string, string> = {};
    const verified: Record<string, string> = {};
    for (const v of data.voices ?? []) {
      if (!v.voice_id) continue;
      if (v.labels?.language) {
        const l = baseLanguage(v.labels.language);
        if (!native[l]) native[l] = v.voice_id;
      }
      for (const vl of v.verified_languages ?? []) {
        if (!vl.language) continue;
        const l = baseLanguage(vl.language);
        if (!verified[l]) verified[l] = v.voice_id;
      }
    }
    return { ...verified, ...native };
  } catch {
    return {};
  }
}

const XI_API = "https://api.elevenlabs.io";

const importedVoiceCache = new Map<string, Promise<string | null>>();

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
  if (added.voice_id) voiceMapPromise = null;
  return added.voice_id ?? null;
}

export async function addSharedVoice(
  ownerId: string,
  voiceId: string,
  newName: string,
): Promise<string | null> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${XI_API}/v1/voices/add/${ownerId}/${voiceId}`, {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({ new_name: newName }),
    });
    if (!res.ok) return null;
    const added = (await res.json()) as { voice_id?: string };
    if (added.voice_id) voiceMapPromise = null; // let the next account scan see it
    return added.voice_id ?? null;
  } catch {
    return null;
  }
}

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

export function isAutoLanguage(code: string): boolean {
  const c = (code || "").toLowerCase();
  return c === "multi" || c === "auto" || c === "";
}
