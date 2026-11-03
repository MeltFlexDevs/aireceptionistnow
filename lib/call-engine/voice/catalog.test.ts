import test, { afterEach } from "node:test";
import assert from "node:assert/strict";

import { addSharedVoice } from "./catalog";

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
  assert.equal(await addSharedVoice(owner, "21m00Tcm4TlvDq8ikWAM", "Front desk"), "acct1");
  assert.deepEqual(calls, [
    "https://api.elevenlabs.io/v1/voices/add/abc123/Voice9",
    `https://api.elevenlabs.io/v1/voices/add/${owner}/21m00Tcm4TlvDq8ikWAM`,
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
