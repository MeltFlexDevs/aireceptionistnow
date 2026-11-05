import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  CURATED_VOICES,
  FALLBACK_VOICES,
  FUNNEL_VOICES,
  FUNNEL_VOICE_FEMALE,
  FUNNEL_VOICE_MALE,
  LEGACY_VOICES,
  LIBRARY_VOICES,
  libraryPickValue,
} from "@/app/(main)/dashboard/numbers/voices";
import {
  addSharedVoice,
  DEFAULT_VOICE_ID,
  isAllowedVoice,
  LEGACY_DEFAULT_VOICE_ID,
  scanAccountVoices,
  voiceForLanguage,
  voicePreviewUrls,
} from "./catalog";

const realFetch = globalThis.fetch;
const savedKey = process.env.ELEVENLABS_API_KEY;
let calls: string[] = [];

// Records each request URL and answers like the ElevenLabs add endpoint.
function stubElevenLabs(): void {
  calls = [];
  process.env.ELEVENLABS_API_KEY = "test-key";
  globalThis.fetch = ((input: string | URL | Request) => {
    calls.push(String(input));
    return Promise.resolve(
      new Response(JSON.stringify({ voice_id: "acct1" }), {
        headers: { "content-type": "application/json" },
      }),
    );
  }) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = realFetch;
  if (savedKey === undefined) delete process.env.ELEVENLABS_API_KEY;
  else process.env.ELEVENLABS_API_KEY = savedKey;
});

test("addSharedVoice: real ElevenLabs ids reach the add endpoint unchanged", async () => {
  stubElevenLabs();
  const owner = "f".repeat(64);
  assert.equal(await addSharedVoice("abc123", "Voice9", "Front desk"), "acct1");
  assert.equal(await addSharedVoice(owner, "zGjIP4SZlMnY9m93k97r", "Front desk"), "acct1");
  assert.deepEqual(calls, [
    "https://api.elevenlabs.io/v1/voices/add/abc123/Voice9",
    `https://api.elevenlabs.io/v1/voices/add/${owner}/zGjIP4SZlMnY9m93k97r`,
  ]);
});

test("addSharedVoice: ids with dot segments, slashes, query or fragment are refused before any request (cr-mobile-api-11)", async () => {
  stubElevenLabs();
  const bad: Array<[string, string]> = [
    ["%2e%2e", "%2e%2e/%2e%2e/v1/user#"],
    ["..", "x"],
    ["abc", "../v1/user"],
    ["abc", "x?y=1"],
    ["abc", "x#y"],
    ["", "x"],
    ["abc", ""],
    ["a".repeat(65), "x"],
  ];
  for (const [ownerId, voiceId] of bad) {
    assert.equal(await addSharedVoice(ownerId, voiceId, "n"), null, `${ownerId} / ${voiceId}`);
  }
  assert.deepEqual(calls, []);
});

test("scanAccountVoices: a stray voice from the shared account is never picked for a language", () => {
  const scan = scanAccountVoices([
    // Another project's voice, labeled Spanish, scores highest.
    {
      voice_id: "georgeScream1",
      name: "Screaming George",
      category: "professional",
      labels: { language: "es", gender: "female", description: "professional" },
    },
    // Live moderation on: unusable in ElevenAgents, even when premade.
    { voice_id: "moderated1", name: "Mod", category: "premade", labels: { language: "es" }, sharing: { live_moderation_enabled: true } },
    { voice_id: "premadeEs1", name: "Sarah", category: "premade", labels: { language: "es", gender: "male" } },
    { voice_id: "importedDe1", name: "Anna (de)", category: "professional", labels: { language: "de" } },
    { voice_id: "otherDe1", name: "Someone", category: "professional", labels: { language: "de" } },
    { voice_id: CURATED_VOICES[0].voiceId, name: "Hope", category: "professional", verified_languages: [{ language: "fr" }] },
  ]);
  assert.equal(scan.byLanguage.es, "premadeEs1");
  assert.equal(scan.byLanguage.de, "importedDe1");
  assert.equal(scan.byLanguage.fr, CURATED_VOICES[0].voiceId);
  assert.deepEqual([...scan.allowed].sort(), ["importedDe1", CURATED_VOICES[0].voiceId, "premadeEs1"].sort());
});

test("isAllowedVoice and voiceForLanguage use the allowlist (one account scan)", async () => {
  process.env.ELEVENLABS_API_KEY = "test-key";
  const urls: string[] = [];
  globalThis.fetch = ((input: string | URL | Request) => {
    urls.push(String(input));
    return Promise.resolve(
      Response.json({
        voices: [
          { voice_id: "georgeScream1", name: "Screaming George", category: "professional", labels: { language: "es" } },
          { voice_id: "premadeEs1", name: "Sarah", category: "premade", labels: { language: "es" } },
        ],
      }),
    );
  }) as typeof fetch;
  assert.equal(await isAllowedVoice(""), false);
  // A curated voice needs no scan.
  assert.equal(await isAllowedVoice(CURATED_VOICES[1].voiceId), true);
  assert.deepEqual(urls, []);
  assert.equal(await isAllowedVoice("georgeScream1"), false);
  assert.equal(await isAllowedVoice("premadeEs1"), true);
  assert.equal(await voiceForLanguage("es", DEFAULT_VOICE_ID), "premadeEs1");
  assert.equal(urls.length, 1, "one scan serves both");
});

test("addSharedVoice: a failed add falls back to the voice already on the account", async () => {
  process.env.ELEVENLABS_API_KEY = "test-key";
  const seen: string[] = [];
  let onAccount: Response | null = Response.json({ voice_id: "Voice9" });
  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    seen.push(`${init?.method ?? "GET"} ${String(input)}`);
    if (init?.method === "POST") return Promise.resolve(new Response("{}", { status: 400 }));
    return Promise.resolve(onAccount ?? new Response("{}", { status: 404 }));
  }) as typeof fetch;
  assert.equal(await addSharedVoice("abc123", "Voice9", "n"), "Voice9");
  assert.deepEqual(seen, [
    "POST https://api.elevenlabs.io/v1/voices/add/abc123/Voice9",
    "GET https://api.elevenlabs.io/v1/voices/Voice9",
  ]);
  onAccount = Response.json({ voice_id: "Voice9", sharing: { live_moderation_enabled: true } });
  assert.equal(await addSharedVoice("abc123", "Voice9", "n"), null, "live moderation on");
  onAccount = null;
  assert.equal(await addSharedVoice("abc123", "Voice9", "n"), null, "not on the account");
});

test("voicePreviewUrls: a library voice falls back to the shared-voice search", async () => {
  process.env.ELEVENLABS_API_KEY = "test-key";
  const id = LIBRARY_VOICES[0].voiceId;
  globalThis.fetch = ((input: string | URL | Request) => {
    const url = String(input);
    if (url.includes("/v1/shared-voices")) {
      return Promise.resolve(
        Response.json({ voices: [{ voice_id: "other", preview_url: "https://x/other.mp3" }, { voice_id: id, preview_url: "https://x/lib.mp3" }] }),
      );
    }
    return Promise.resolve(new Response("{}", { status: 404 }));
  }) as typeof fetch;
  assert.deepEqual(await voicePreviewUrls([id]), { [id]: "https://x/lib.mp3" });
});

test("voice lists: defaults and funnel voices are listed, library picks are well formed", () => {
  const ids = new Set(FALLBACK_VOICES.map((v) => v.voiceId));
  assert.ok(CURATED_VOICES.some((v) => v.voiceId === DEFAULT_VOICE_ID));
  assert.equal(FUNNEL_VOICES.find((v) => v.voiceId === FUNNEL_VOICE_FEMALE)?.gender, "f");
  assert.equal(FUNNEL_VOICES.find((v) => v.voiceId === FUNNEL_VOICE_MALE)?.gender, "m");
  for (const v of FUNNEL_VOICES) assert.ok(ids.has(v.voiceId), `${v.name} is in FALLBACK_VOICES`);
  // Old receptionists keep their voice, and the lists show the name callers hear.
  assert.notEqual(LEGACY_DEFAULT_VOICE_ID, DEFAULT_VOICE_ID);
  assert.equal(FALLBACK_VOICES.find((v) => v.voiceId === LEGACY_DEFAULT_VOICE_ID)?.name, "Janet");
  assert.ok(LEGACY_VOICES.every((v) => !CURATED_VOICES.some((c) => c.voiceId === v.voiceId)));
  assert.equal(new Set(FALLBACK_VOICES.map((v) => v.voiceId)).size, FALLBACK_VOICES.length);
  for (const v of LIBRARY_VOICES) {
    const [prefix, owner, voiceId, name] = libraryPickValue(v).split(":");
    assert.deepEqual([prefix, owner, voiceId, decodeURIComponent(name)], ["lib", v.ownerId, v.voiceId, v.name]);
    assert.match(owner, /^[A-Za-z0-9]{1,64}$/);
  }
});
