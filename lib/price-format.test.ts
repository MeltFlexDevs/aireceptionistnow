import test from "node:test";
import assert from "node:assert/strict";

import { formatEur } from "./price-format";

// Intl puts a non-breaking (U+00A0) or narrow non-breaking (U+202F) space
// before the euro sign in some locales. Compare with plain spaces.
const plain = (s: string) => s.replace(/[  ]/g, " ");

test("English keeps the en-IE format the pricing page always had", () => {
  assert.equal(formatEur(299, "en"), "€299");
  assert.equal(formatEur(24.9, "en"), "€24.90");
  assert.equal(formatEur(3229.2, "en", 2), "€3,229.20");
});

test("Slovak puts the euro sign after the number", () => {
  assert.equal(plain(formatEur(299, "sk")), "299 €");
});

test("German uses a decimal comma with fixed fraction digits", () => {
  assert.equal(plain(formatEur(0.09, "de", 2)), "0,09 €");
});
