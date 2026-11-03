import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { de } from "../i18n/dictionaries/de";
import { en } from "../i18n/dictionaries/en";
import { es } from "../i18n/dictionaries/es";
import { fr } from "../i18n/dictionaries/fr";
import { it as itDict } from "../i18n/dictionaries/it";
import { nl } from "../i18n/dictionaries/nl";
import { pt } from "../i18n/dictionaries/pt";
import { sk } from "../i18n/dictionaries/sk";
import { digestText, hasDigestInput } from "./knowledge-digest";

const DICTS = { en, sk, de, es, fr, it: itDict, nl, pt };

test("hasDigestInput is false with no notes, sources or description", () => {
  assert.equal(hasDigestInput({ description: "", knowledge: {} }), false);
  assert.equal(hasDigestInput({ description: "  ", knowledge: { notes: "   " } }), false);
});

test("hasDigestInput is true with notes or a description", () => {
  assert.equal(hasDigestInput({ description: "", knowledge: { notes: "Open 9-5" } }), true);
  assert.equal(hasDigestInput({ description: "Dental clinic", knowledge: {} }), true);
});

test("digestText picks the summary, then unavailable, then empty", () => {
  assert.equal(digestText(null, true, en.knowledge), en.knowledge.digestUnavailable);
  assert.equal(digestText(null, false, en.knowledge), en.knowledge.digestEmpty);
  assert.equal(digestText("Summary.", true, en.knowledge), "Summary.");
});

test("every dictionary has its own digestUnavailable line without dashes", () => {
  for (const [name, d] of Object.entries(DICTS)) {
    const k = d.knowledge;
    assert.ok(k.digestUnavailable.length > 0, `${name} digestUnavailable is empty`);
    assert.notEqual(k.digestUnavailable, k.digestEmpty, `${name} repeats digestEmpty`);
    assert.ok(!/[–—]/.test(k.digestUnavailable), `${name} has an em or en dash`);
  }
});

test("the knowledge page uses digestText with the org content check", () => {
  const page = readFileSync(
    new URL("../../app/(main)/dashboard/knowledge/page.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(page.includes("digestText(summary, hasDigestInput(entry.org)"));
  assert.ok(!page.includes("summary || t.knowledge.digestEmpty"));
});
