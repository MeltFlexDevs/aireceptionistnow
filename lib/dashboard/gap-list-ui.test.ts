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

// Source guard: the repo has no component test runner, so this pins the
// knowledge gaps fixes: no nested form, a two-step Dismiss, an empty state.
const GAPS = readFileSync(
  new URL("../../app/(main)/dashboard/knowledge/GapList.tsx", import.meta.url),
  "utf8",
);

const DICTS = { en, sk, de, es, fr, it: itDict, nl, pt };

test("Dismiss sits outside the answer form, so no form nests in another", () => {
  const forms = [...GAPS.matchAll(/<form\b[\s\S]*?<\/form>/g)].map((m) => m[0]);
  assert.equal(forms.length, 2);
  for (const f of forms) {
    // DismissButton renders its own <form>.
    assert.ok(!f.includes("<DismissButton"), "a form must not hold DismissButton");
  }
});

test("the first Dismiss click only opens an inline confirm", () => {
  assert.ok(GAPS.includes("onClick={() => setConfirming(true)}"));
  assert.ok(GAPS.includes("{k.gapsDismissConfirm}"));
  assert.ok(GAPS.includes("{t.common.cancel}"));
});

test("an empty answerable list shows a line, not an empty list", () => {
  assert.ok(GAPS.includes("answerable.length === 0"));
  assert.ok(GAPS.includes("{k.gapsAllAnswered}"));
});

test("every dictionary has the two new gap strings, with the Dismiss verb", () => {
  for (const [loc, d] of Object.entries(DICTS)) {
    const k = d.knowledge;
    assert.ok(k.gapsDismissConfirm.trim(), loc);
    assert.ok(k.gapsAllAnswered.trim(), loc);
    assert.ok(k.gapsDismissConfirm.toLowerCase().includes(k.gapsDismiss.toLowerCase()), loc);
    if (loc !== "en") {
      assert.notEqual(k.gapsDismissConfirm, en.knowledge.gapsDismissConfirm, loc);
      assert.notEqual(k.gapsAllAnswered, en.knowledge.gapsAllAnswered, loc);
    }
  }
});
