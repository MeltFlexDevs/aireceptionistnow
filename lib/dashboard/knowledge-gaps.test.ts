import test from "node:test";
import assert from "node:assert/strict";

import { mergeVerifiedAnswer } from "./knowledge-gaps";

const pair = (q: string, a: string) => ({ q, a });

test("a new answer goes first and keeps what was there", () => {
  const out = mergeVerifiedAnswer([pair("Do you park?", "Yes, out back.")], "Open Sundays?", "No.", 25);
  assert.deepEqual(out, [pair("Open Sundays?", "No."), pair("Do you park?", "Yes, out back.")]);
});

test("re-answering a question replaces it instead of stacking a second pair", () => {
  const out = mergeVerifiedAnswer(
    [pair("Do you park?", "Yes."), pair("  open sundays? ", "Yes, 10-2.")],
    "Open Sundays?",
    "Not any more.",
    25,
  );
  assert.deepEqual(out, [pair("Open Sundays?", "Not any more."), pair("Do you park?", "Yes.")]);
});

test("the cap drops the oldest tail, never the new answer", () => {
  const existing = [pair("a", "1"), pair("b", "2"), pair("c", "3")];
  const out = mergeVerifiedAnswer(existing, "d", "4", 3);
  assert.deepEqual(out, [pair("d", "4"), pair("a", "1"), pair("b", "2")]);
});

test("an empty list gets just the new pair", () => {
  assert.deepEqual(mergeVerifiedAnswer([], "q", "a", 25), [pair("q", "a")]);
});

test("the input list is not mutated", () => {
  const existing = [pair("a", "1")];
  mergeVerifiedAnswer(existing, "a", "2", 25);
  assert.deepEqual(existing, [pair("a", "1")]);
});
