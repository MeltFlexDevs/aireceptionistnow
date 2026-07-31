import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MAX_VERIFIED,
  formatVerifiedLines,
  mergeKnowledge,
  parseVerifiedLines,
  readKnowledge,
  readVerified,
} from "./sources";

// These are the answers a business has decided must come out right every time.
// The failure mode is quiet: a half-parsed pair means the receptionist believes
// it has an approved answer and improvises the rest.

test("Q/A pairs are read out of the textarea", () => {
  const pairs = parseVerifiedLines(
    "Q: Do you offer refunds?\nA: Within 14 days, if unused.\n\nQ: Do you deliver?\nA: Within 20 miles.",
  );
  assert.deepEqual(pairs, [
    { q: "Do you offer refunds?", a: "Within 14 days, if unused." },
    { q: "Do you deliver?", a: "Within 20 miles." },
  ]);
});

test("a question with no answer is discarded, never stored half-formed", () => {
  assert.deepEqual(parseVerifiedLines("Q: Do you offer refunds?"), []);
  assert.deepEqual(readVerified([{ q: "Do you deliver?" }]), []);
  assert.deepEqual(readVerified([{ a: "Within 20 miles." }]), []);
});

test("the Q/A prefixes are optional on the question and case-insensitive", () => {
  const pairs = parseVerifiedLines("Do you deliver?\na: Within 20 miles.");
  assert.deepEqual(pairs, [{ q: "Do you deliver?", a: "Within 20 miles." }]);
});

test("a second answer without a new question does not attach to the old one", () => {
  // Otherwise a stray line silently rewrites the previous approved answer.
  const pairs = parseVerifiedLines("Q: Refunds?\nA: 14 days.\nA: Actually 30 days.");
  assert.deepEqual(pairs, [{ q: "Refunds?", a: "14 days." }]);
});

test("pairs survive the edit round trip", () => {
  const text = "Q: Do you offer refunds?\nA: Within 14 days, if unused.";
  assert.equal(formatVerifiedLines(parseVerifiedLines(text)), text);
});

test("the list is capped", () => {
  const many = Array.from({ length: MAX_VERIFIED + 5 }, (_, i) => ({ q: `q${i}`, a: `a${i}` }));
  assert.equal(readVerified(many).length, MAX_VERIFIED);
});

test("readKnowledge always returns an array, never undefined", () => {
  assert.deepEqual(readKnowledge(null).verified, []);
  assert.deepEqual(readKnowledge({ verified: "nonsense" }).verified, []);
});

test("an assistant-level answer overrides the organization's, rather than doubling it", () => {
  // Two answers to the same question is the worst outcome: the agent picks one
  // at random and the business cannot tell which.
  const merged = mergeKnowledge(
    { verified: [{ q: "Do you offer refunds?", a: "Within 14 days." }] },
    { verified: [{ q: "do you offer refunds?", a: "Within 30 days." }] },
  );
  assert.equal(merged.verified?.length, 1);
  assert.equal(merged.verified?.[0].a, "Within 30 days.");
});
