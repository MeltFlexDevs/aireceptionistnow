import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Source guard for the onboarding plan step: the repo has no component test
// runner, so this pins the two behaviors tsc cannot see.
const PLAN = readFileSync(
  new URL("../../app/(main)/onboarding/steps/PlanStep.tsx", import.meta.url),
  "utf8",
);

test("Go live stays clickable without the Terms tick", () => {
  // A disabled button gives touch and keyboard users no reason; choose() guards instead.
  assert.ok(PLAN.includes("disabled={loading !== null}"));
  assert.ok(!PLAN.includes("|| !accepted"));
  assert.ok(!PLAN.includes("title={!accepted"));
});

test("an unticked click shows an inline alert and focuses the Terms box", () => {
  assert.match(PLAN, /if \(!accepted\) \{[^}]*termsRef\.current\?\.focus\(\)/);
  assert.match(PLAN, /role="alert"[^>]*>\s*\{o\.termsRequired\}/);
  assert.match(PLAN, /aria-describedby=\{termsError \? termsErrorId : undefined\}/);
});

test("a 401 sends the visitor to the login home of the page language", () => {
  assert.match(PLAN, /loginHomePath\(\{ cookieLocale: document\.documentElement\.lang \}\)/);
  assert.ok(!PLAN.includes("`/?auth=login"), "the login redirect must not be hardcoded to the English home");
});

test("a 409 portal answer opens the Billing Portal with a localized error, before the generic check", () => {
  const i401 = PLAN.indexOf("if (res.status === 401) {");
  const i409 = PLAN.indexOf("if (res.status === 409 && data.portal === true) {");
  const iGeneric = PLAN.indexOf("if (!res.ok || !data.url)");
  assert.ok(i401 > -1 && i409 > i401 && iGeneric > i409, "order must be: 401, then 409 portal, then the generic check");
  assert.match(
    PLAN,
    /if \(res\.status === 409 && data\.portal === true\) \{[\s\S]*?await openBillingPortal\(\)\.catch\(\(\) => \{\s*throw new Error\(t\.settings\.manageBillingError\);\s*\}\);\s*return;/,
  );
});
