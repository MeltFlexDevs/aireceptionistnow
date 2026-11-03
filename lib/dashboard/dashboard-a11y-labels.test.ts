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
// keyboard and screen-reader fixes on the calls pane and two dashboard inputs.
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const DETAIL = read("app/(main)/dashboard/calls/CallDetailBody.tsx");
const FILTERS = read("app/(main)/dashboard/calls/CallFilters.tsx");
const TEACH = read("app/(main)/dashboard/knowledge/TeachBar.tsx");

const DICTS = { en, sk, de, es, fr, it: itDict, nl, pt };

test("the call detail pane scroll region takes keyboard focus and has a name", () => {
  assert.ok(!DETAIL.includes('<div className="min-h-0 flex-1 overflow-y-auto p-5">{sections}</div>'));
  assert.ok(DETAIL.includes("tabIndex={0}"));
  assert.ok(DETAIL.includes('role="region"'));
  assert.ok(DETAIL.includes("aria-label={t.calls.detailsRegion}"));
  assert.ok(
    DETAIL.includes(
      'className="min-h-0 flex-1 overflow-y-auto p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900"',
    ),
  );
});

test("the calls search input and the website input have accessible names", () => {
  assert.ok(FILTERS.includes("aria-label={t.calls.searchPlaceholder}"));
  assert.ok(TEACH.includes("aria-label={k.teachWebsiteLabel}"));
});

test("every dictionary names the detail region and the website input", () => {
  assert.equal(en.calls.detailsRegion, "Call details");
  assert.equal(en.knowledge.teachWebsiteLabel, "Your website address");
  for (const [locale, dict] of Object.entries(DICTS)) {
    assert.ok(dict.calls.detailsRegion.trim().length > 0, `${locale} calls.detailsRegion`);
    assert.ok(dict.knowledge.teachWebsiteLabel.trim().length > 0, `${locale} knowledge.teachWebsiteLabel`);
    assert.notEqual(dict.knowledge.teachWebsiteLabel, dict.knowledge.teachWebsitePlaceholder, locale);
  }
});
