import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { dictionaries } from "../i18n/dictionaries";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const ACTIONS = read("app/(main)/onboarding/actions.ts");
const ROUTE = read("app/api/mobile/onboarding/route.ts");
const PAGE = read("app/(main)/onboarding/page.tsx");
const PROVISION = read("lib/dashboard/provision.ts");

test("the web basics step checks the website", () => {
  assert.ok(ACTIONS.includes("normalizeWebsite(companyWebsite)"));
  assert.ok((ACTIONS + PAGE).includes("websiteInvalid"));
  assert.doesNotMatch(ACTIONS, /toStep\(\d, \(err as Error\)\.message\)/);
  assert.ok(PAGE.includes('case "website"'));
});

test("the app basics step answers 400 before it writes", () => {
  const body = ROUTE.slice(ROUTE.indexOf('if (action === "basics")'));
  const check = body.indexOf("normalizeWebsite(str(body.companyWebsite))");
  assert.ok(check > 0);
  assert.ok(check < body.indexOf("saveOnboardingConfig("));
  assert.ok(body.includes("Enter a website like example.com, or leave it empty."));
  assert.ok(!ROUTE.includes("companyWebsite: str(body.companyWebsite)"));
});

test("both step 1 gates count only a valid website", () => {
  assert.match(PAGE, /cfg\.companyName \|\| normalizeWebsite\(cfg\.companyWebsite/);
  const gate = ROUTE.slice(
    ROUTE.indexOf("function firstIncompleteStep("),
    ROUTE.indexOf("export async function GET("),
  );
  assert.ok(gate.includes("normalizeWebsite(cfg.companyWebsite)"));
});

test("the provisioner ignores words saved as a website", () => {
  assert.ok(PROVISION.includes('normalizeWebsite(cfg.companyWebsite ?? "") ?? ""'));
  assert.ok(!PROVISION.includes('(cfg.companyWebsite ?? "").trim()'));
});

test("every locale has the website error", () => {
  for (const [locale, dict] of Object.entries(dictionaries)) {
    const text = dict.onboarding.websiteInvalid;
    assert.equal(typeof text, "string", locale);
    assert.ok(text.length > 0, locale);
    if (locale !== "en") {
      assert.notEqual(text, dictionaries.en.onboarding.websiteInvalid, locale);
    }
  }
});
