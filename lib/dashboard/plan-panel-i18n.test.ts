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
import { localizedHref } from "../i18n/marketing/href";
import { localizedPageIdToPath } from "../i18n/marketing/ids";
import { isPublished } from "../i18n/marketing/manifest";

// Source guard: the repo has no component test runner, so this pins the
// translated plan badge and the localized pricing links in the dashboard.
const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const PLAN_USAGE = read("app/(main)/dashboard/components/PlanUsage.tsx");
const OVERVIEW = read("app/(main)/dashboard/page.tsx");
const SETTINGS = read("app/(main)/dashboard/settings/page.tsx");
const ASSISTANTS = read("app/(main)/dashboard/assistant/page.tsx");
const ASSISTANT = read("app/(main)/dashboard/assistant/[id]/page.tsx");

const DICTS = { en, sk, de, es, fr, it: itDict, nl, pt };

test("the plan badge shows a translated 'No plan' when there is no plan", () => {
  assert.ok(!PLAN_USAGE.includes("{ctx.planName}"));
  assert.ok(PLAN_USAGE.includes("{ctx.planId ? ctx.planName : s.noPlan}"));
  assert.ok(!OVERVIEW.includes("{plan.planName}"));
  assert.ok(OVERVIEW.includes("{plan.planId ? plan.planName : t.settings.noPlan}"));
  assert.equal(en.settings.noPlan, "No plan");
  for (const [code, d] of Object.entries(DICTS)) {
    assert.ok(d.settings.noPlan.trim().length > 0, code);
    if (code !== "en") assert.notEqual(d.settings.noPlan, en.settings.noPlan, code);
  }
});

test("plan panel pricing links keep the user's language", () => {
  for (const [name, src] of Object.entries({ PLAN_USAGE, OVERVIEW, SETTINGS })) {
    assert.ok(!src.includes('href="/pricing"'), name);
    assert.ok(!src.includes('href: "/pricing"'), name);
    assert.ok(src.includes('localizedHref(locale, "pricing")'), name);
  }
  assert.equal(localizedHref("en", "pricing"), "/pricing");
  // Read the Slovak value from the publish gate instead of hard-coding a slug.
  assert.equal(
    localizedHref("sk", "pricing"),
    isPublished("sk", "pricing") ? localizedPageIdToPath("sk", "pricing") : "/pricing",
  );
});

test("the receptionist pages' View plans link keeps the user's language", () => {
  for (const [name, src] of Object.entries({ ASSISTANTS, ASSISTANT })) {
    assert.ok(!src.includes('href="/pricing"'), name);
    assert.ok(src.includes('href={localizedHref(locale, "pricing")}'), name);
  }
});
