
export function baseLanguage(code: string): string {
  return (code || "").split("-")[0].toLowerCase();
}

// Default voice: ElevenLabs "Rachel" - a professional-sounding female voice.
// Voice policy: default to a female voice with a professional tone; the
// auto-resolvers below rank candidates with voicePreferenceScore.
export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

const PROFESSIONAL_RE =
  /\b(professional|business|corporate|formal|polished|news|announcer|articulate|confident|office)\b/i;

// Rank auto-picked voices: professional female > female > professional > rest.
export function voicePreferenceScore(gender?: string, descriptors?: string): number {
  const female = (gender ?? "").trim().toLowerCase() === "female" ? 2 : 0;
  const professional = PROFESSIONAL_RE.test(descriptors ?? "") ? 1 : 0;
  return female + professional;
}

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

let voiceMapPromise: Promise<Record<string, string> | null> | null = null;

interface RawVoice {
  voice_id: string;
  labels?: Record<string, string>;
  verified_languages?: Array<{ language?: string }>;
}

// null = fetch failed (retryable); {} = the account genuinely has no voices.
async function accountVoicesByLanguage(): Promise<Record<string, string> | null> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return {};
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { voices?: RawVoice[] };
    // Best-scoring voice per language per tier (female/professional preferred);
    // ties keep the first seen, so the stable API order stays deterministic.
    const native: Record<string, { id: string; score: number }> = {};
    const verified: Record<string, { id: string; score: number }> = {};
    for (const v of data.voices ?? []) {
      if (!v.voice_id) continue;
      const score = voicePreferenceScore(
        v.labels?.gender,
        `${v.labels?.description ?? ""} ${v.labels?.use_case ?? ""}`,
      );
      if (v.labels?.language) {
        const l = baseLanguage(v.labels.language);
        if (!native[l] || score > native[l].score) native[l] = { id: v.voice_id, score };
      }
      for (const vl of v.verified_languages ?? []) {
        if (!vl.language) continue;
        const l = baseLanguage(vl.language);
        if (!verified[l] || score > verified[l].score) verified[l] = { id: v.voice_id, score };
      }
    }
    const out: Record<string, string> = {};
    for (const [l, v] of Object.entries(verified)) out[l] = v.id;
    for (const [l, v] of Object.entries(native)) out[l] = v.id;
    return out;
  } catch {
    return null;
  }
}

const XI_API = "https://api.elevenlabs.io";

const importedVoiceCache = new Map<string, Promise<string | null>>();

interface SharedVoiceHit {
  public_owner_id?: string;
  voice_id?: string;
  name?: string;
  gender?: string;
  descriptive?: string;
  use_case?: string;
}

async function searchSharedVoices(
  base: string,
  key: string,
  femaleOnly: boolean,
): Promise<SharedVoiceHit[]> {
  const q = new URLSearchParams({ language: base, page_size: "12", sort: "trending" });
  if (femaleOnly) q.set("gender", "female");
  const res = await fetch(`${XI_API}/v1/shared-voices?${q}`, { headers: { "xi-api-key": key } });
  if (!res.ok) return [];
  const data = (await res.json()) as { voices?: SharedVoiceHit[] };
  return (data.voices ?? []).filter((v) => v.public_owner_id && v.voice_id);
}

async function importSharedVoiceForLanguage(base: string, key: string): Promise<string | null> {
  // Female voices first (professional-sounding preferred); only when the
  // language has none, fall back to any voice so the language still works.
  let hits = await searchSharedVoices(base, key, true);
  if (hits.length === 0) hits = await searchSharedVoices(base, key, false);
  if (hits.length === 0) return null;
  const hit = [...hits].sort(
    (a, b) =>
      voicePreferenceScore(b.gender, `${b.descriptive ?? ""} ${b.use_case ?? ""}`) -
      voicePreferenceScore(a.gender, `${a.descriptive ?? ""} ${a.use_case ?? ""}`),
  )[0];
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

// Resolve a voice-picker value to a usable ElevenLabs voice id. Library picks
// arrive as "lib:owner:voiceId:encodedName" and must be imported into the
// account first (the funnel provisioner can't store them raw); plain ids pass
// through. Returns null when a library import fails so callers keep their
// existing voice instead of persisting a broken id.
export async function resolvePickedVoiceId(raw: string): Promise<string | null> {
  const value = (raw || "").trim();
  if (!value) return null;
  if (!value.startsWith("lib:")) return value;
  const [, owner, voiceId, encName] = value.split(":");
  if (!owner || !voiceId) return null;
  let name = "Voice";
  try {
    name = decodeURIComponent(encName || "Voice");
  } catch {
    name = encName || "Voice";
  }
  return addSharedVoice(owner, voiceId, name);
}

// Preview-URL lookups for specific voice ids (the static pinned funnel voices
// ship without one). Cached per id for the instance; a failed lookup is dropped
// so the next call retries instead of hiding the preview forever.
const previewCache = new Map<string, Promise<string | null>>();

export async function voicePreviewUrls(ids: string[]): Promise<Record<string, string>> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key || ids.length === 0) return {};
  const out: Record<string, string> = {};
  await Promise.all(
    ids.map(async (id) => {
      if (!previewCache.has(id)) {
        const pending = fetch(`${XI_API}/v1/voices/${id}`, { headers: { "xi-api-key": key } })
          .then(async (res) =>
            res.ok ? (((await res.json()) as { preview_url?: string }).preview_url ?? null) : null,
          )
          .catch(() => null);
        previewCache.set(id, pending);
        void pending.then((url) => {
          if (!url) previewCache.delete(id);
        });
      }
      const url = await previewCache.get(id)!;
      if (url) out[id] = url;
    }),
  );
  return out;
}

export async function voiceForLanguage(
  code: string,
  fallbackVoiceId: string,
  importFromLibrary = false,
): Promise<string> {
  const base = baseLanguage(code);
  const explicit = envVoiceOverrides()[base];
  if (explicit) return explicit;

  const key = process.env.ELEVENLABS_API_KEY;
  // English uses the assistant's own configured voice; no key → nothing to query.
  if (!key || base === "en") return fallbackVoiceId;

  // A failed scan (null) must not be cached for the life of the instance -
  // reset so the next lookup retries instead of losing account voices forever.
  voiceMapPromise ??= accountVoicesByLanguage().then((map) => {
    if (!map) voiceMapPromise = null;
    return map;
  });
  const onAccount = ((await voiceMapPromise) ?? {})[base];
  if (onAccount) return onAccount;

  if (!importFromLibrary) return fallbackVoiceId;
  if (!importedVoiceCache.has(base)) {
    importedVoiceCache.set(base, importSharedVoiceForLanguage(base, key).catch(() => null));
  }
  return (await importedVoiceCache.get(base)!) ?? fallbackVoiceId;
}
