import assert from "node:assert/strict";
import { test } from "node:test";

import { fetchWebsiteMarkdown, readCappedText } from "./website";

const enc = new TextEncoder();

// A literal public address: assertPublicHost skips DNS for it, and fetch is
// mocked in every test, so nothing here touches the network.
const PAGE = "https://93.184.216.34/";

function htmlResponse(body: ReadableStream<Uint8Array>): Response {
  return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
}

test("readCappedText stops at the byte cap and cancels the rest of the body", async () => {
  let cancelled = 0;
  const endless = new ReadableStream<Uint8Array>({
    pull(c) {
      c.enqueue(enc.encode("abcd"));
    },
    cancel() {
      cancelled++;
    },
  });
  const text = await readCappedText(endless, 10, new AbortController().signal);
  assert.equal(text, "abcdabcdab");
  assert.equal(cancelled, 1);
});

test("readCappedText decodes a character split across chunks", async () => {
  const bytes = enc.encode("café");
  const split = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(bytes.subarray(0, 4));
      c.enqueue(bytes.subarray(4));
      c.close();
    },
  });
  assert.equal(await readCappedText(split, 1_000, new AbortController().signal), "café");
});

test("readCappedText returns an empty string for a missing body", async () => {
  assert.equal(await readCappedText(null, 10, new AbortController().signal), "");
});

test("readCappedText rejects with an AbortError when the deadline hits mid-body", async () => {
  const slow = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(enc.encode("<html><body>first part"));
    },
    pull() {
      return new Promise(() => {}); // the rest never arrives
    },
  });
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 20);
  await assert.rejects(readCappedText(slow, 1_000, controller.signal), { name: "AbortError" });
});

// The timeout turns a regression (deadline cleared before the body) into a
// failure instead of a test run that never ends.
test(
  "fetchWebsiteMarkdown keeps its deadline running while the body downloads",
  { timeout: 2_000 },
  async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let bodyStarted!: () => void;
    const started = new Promise<void>((resolve) => (bodyStarted = resolve));
    const slow = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(enc.encode("<html><title>Slow</title><body>first part"));
      },
      pull() {
        bodyStarted();
        return new Promise(() => {}); // headers came fast, the rest never arrives
      },
    });
    t.mock.method(globalThis, "fetch", async () => htmlResponse(slow));

    const result = fetchWebsiteMarkdown(PAGE);
    await started;
    t.mock.timers.tick(12_000);
    await assert.rejects(result, { message: "The page took too long to load." });
  },
);

test("fetchWebsiteMarkdown reads a normal page", async (t) => {
  const page = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(enc.encode("<html><title>Bakery</title><body><p>Open 8 to 5.</p></body></html>"));
      c.close();
    },
  });
  t.mock.method(globalThis, "fetch", async () => htmlResponse(page));
  const result = await fetchWebsiteMarkdown(PAGE);
  assert.equal(result.title, "Bakery");
  assert.match(result.markdown, /Open 8 to 5\./);
});
