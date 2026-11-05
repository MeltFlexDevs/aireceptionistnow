
import { CURATED_VOICES, LIBRARY_VOICES } from "@/app/(main)/dashboard/numbers/voices";

export function baseLanguage(code: string): string {
  return (code || "").split("-")[0].toLowerCase();
}

// Voice a receptionist row with no voice_id has always spoken with. On this
// account it is a copied voice named "Janet". Kept so a re-sync does not change
// the live voice of an old row; new receptionists use DEFAULT_VOICE_ID.
export const LEGACY_DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Default voice for new receptionists: "Hope", a female American voice on the
// platform account, tuned for eleven_v4_turbo, live moderation off.
// Voice policy: default to a female voice with a professional tone; the
// auto-resolvers below rank candidates with voicePreferenceScore.
export const DEFAULT_VOICE_ID = "zGjIP4SZlMnY9m93k97r";

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

// What one account scan found: the best allowed voice per language, and every
// allowed voice id (isAllowedVoice reads it).
interface AccountScan {
  byLanguage: Record<string, string>;
  allowed: Set<string>;
}
let voiceMapPromise: Promise<AccountScan | null> | null = null;

interface RawVoice {
  voice_id: string;
  name?: string;
  category?: string;
  labels?: Record<string, string>;
  verified_languages?: Array<{ language?: string }>;
  sharing?: { live_moderation_enabled?: boolean };
}

// The ElevenLabs account is shared with other projects (cloned and library
// voices that are not ours). Only these may be picked automatically: the
// curated voices, premade voices, and voices that importSharedVoiceForLanguage
// added (named "<name> (<language code>)"). A voice with live moderation on
// cannot be used in ElevenAgents, so it is never allowed.
const CURATED_IDS = new Set([...CURATED_VOICES, ...LIBRARY_VOICES].map((v) => v.voiceId));
const IMPORTED_NAME = /\s\([a-z]{2,3}\)$/;

function isAllowedAccountVoice(v: RawVoice): boolean {
  if (!v.voice_id || v.sharing?.live_moderation_enabled) return false;
  return v.category === "premade" || CURATED_IDS.has(v.voice_id) || IMPORTED_NAME.test(v.name ?? "");
}

export function scanAccountVoices(voices: RawVoice[]): AccountScan {
  // Best-scoring voice per language per tier (female/professional preferred);
  // ties keep the first seen, so the stable API order stays deterministic.
  const native: Record<string, { id: string; score: number }> = {};
  const verified: Record<string, { id: string; score: number }> = {};
  const allowed = new Set<string>();
  for (const v of voices) {
    if (!isAllowedAccountVoice(v)) continue;
    allowed.add(v.voice_id);
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
  const byLanguage: Record<string, string> = {};
  for (const [l, v] of Object.entries(verified)) byLanguage[l] = v.id;
  for (const [l, v] of Object.entries(native)) byLanguage[l] = v.id;
  return { byLanguage, allowed };
}

// null = fetch failed (retryable); an empty scan = the account genuinely has no voices.
async function accountVoicesByLanguage(): Promise<AccountScan | null> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return { byLanguage: {}, allowed: new Set() };
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { voices?: RawVoice[] };
    return scanAccountVoices(data.voices ?? []);
  } catch {
    return null;
  }
}

// A failed scan (null) must not be cached for the life of the instance -
// reset so the next lookup retries instead of losing account voices forever.
function accountScan(): Promise<AccountScan | null> {
  voiceMapPromise ??= accountVoicesByLanguage().then((scan) => {
    if (!scan) voiceMapPromise = null;
    return scan;
  });
  return voiceMapPromise;
}

// True when a stored voice id may be played without the owner having picked it:
// a curated voice, one set in ELEVENLABS_VOICE_OVERRIDES, or one the allowlist
// above accepts on the account.
export async function isAllowedVoice(voiceId: string): Promise<boolean> {
  if (!voiceId) return false;
  if (CURATED_IDS.has(voiceId)) return true;
  if (Object.values(envVoiceOverrides()).includes(voiceId)) return true;
  const scan = await accountScan();
  return !!scan?.allowed.has(voiceId);
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
  preview_url?: string;
  live_moderation_enabled?: boolean;
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
  // Voices with live moderation on cannot be used in ElevenAgents.
  return (data.voices ?? []).filter(
    (v) => v.public_owner_id && v.voice_id && !v.live_moderation_enabled,
  );
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

// ElevenLabs ids: a public_owner_id is 64 hex chars, a voice_id about 20
// letters and digits. Both come from a voice value the client picks and go into
// the URL path of a request that carries the platform API key, so anything else
// ("..", "%2e%2e", "/", "?", "#") is refused before the fetch (cr-mobile-api-11).
const XI_ID = /^[A-Za-z0-9]{1,64}$/;

// The id when this voice is already on the account and usable in ElevenAgents.
async function accountVoiceId(voiceId: string, key: string): Promise<string | null> {
  try {
    const res = await fetch(`${XI_API}/v1/voices/${encodeURIComponent(voiceId)}`, {
      headers: { "xi-api-key": key },
    });
    if (!res.ok) return null;
    const v = (await res.json()) as RawVoice;
    return v.voice_id && !v.sharing?.live_moderation_enabled ? v.voice_id : null;
  } catch {
    return null;
  }
}

export async function addSharedVoice(
  ownerId: string,
  voiceId: string,
  newName: string,
): Promise<string | null> {
  if (!XI_ID.test(ownerId) || !XI_ID.test(voiceId)) return null;
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return null;
  try {
    const path = `${encodeURIComponent(ownerId)}/${encodeURIComponent(voiceId)}`;
    const res = await fetch(`${XI_API}/v1/voices/add/${path}`, {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({ new_name: newName }),
    });
    // The add fails when the voice is already on the account (an earlier pick):
    // a copied voice keeps its library id, so use it from there.
    if (!res.ok) return (await accountVoiceId(voiceId, key)) ?? null;
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

async function sharedPreviewUrl(voiceId: string, key: string): Promise<string | null> {
  if (!XI_ID.test(voiceId)) return null;
  const q = new URLSearchParams({ search: voiceId, page_size: "5" });
  const res = await fetch(`${XI_API}/v1/shared-voices?${q}`, { headers: { "xi-api-key": key } });
  if (!res.ok) return null;
  const data = (await res.json()) as { voices?: SharedVoiceHit[] };
  return (data.voices ?? []).find((v) => v.voice_id === voiceId)?.preview_url ?? null;
}

export async function voicePreviewUrls(ids: string[]): Promise<Record<string, string>> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key || ids.length === 0) return {};
  const out: Record<string, string> = {};
  await Promise.all(
    ids.map(async (id) => {
      if (!previewCache.has(id)) {
        // A library voice that is not on the account has no /v1/voices entry:
        // look it up in the shared library instead.
        const pending = fetch(`${XI_API}/v1/voices/${id}`, { headers: { "xi-api-key": key } })
          .then(async (res) =>
            res.ok
              ? (((await res.json()) as { preview_url?: string }).preview_url ?? null)
              : sharedPreviewUrl(id, key),
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

  const onAccount = ((await accountScan())?.byLanguage ?? {})[base];
  if (onAccount) return onAccount;

  if (!importFromLibrary) return fallbackVoiceId;
  if (!importedVoiceCache.has(base)) {
    importedVoiceCache.set(base, importSharedVoiceForLanguage(base, key).catch(() => null));
  }
  return (await importedVoiceCache.get(base)!) ?? fallbackVoiceId;
}
