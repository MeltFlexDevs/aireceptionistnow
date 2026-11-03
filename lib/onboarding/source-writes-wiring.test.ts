import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const ACTIONS = read("app/(main)/onboarding/actions.ts");
const ROUTE = read("app/api/mobile/onboarding/route.ts");
const between = (src: string, from: string, to: string) => src.slice(src.indexOf(from), src.indexOf(to, src.indexOf(from)));

test("web source adds and removes compare-and-swap", () => {
  const slices = [
    between(ACTIONS, "async function appendSource(", "export async function importPdfAction("),
    between(ACTIONS, "export async function removeSourceAction(", "export async function setNumberCountryAction("),
  ];
  for (const s of slices) {
    assert.ok(s.includes("updateOnboardingConfig("));
    assert.ok(!s.includes("getOnboardingProfile("));
  }
});

test("app source adds and removes compare-and-swap", () => {
  const s = between(ROUTE, 'if (action === "add-text")', 'if (action === "knowledge-done")');
  assert.equal(s.match(/updateOnboardingConfig\(/g)?.length, 2);
  assert.ok(s.includes(".slice(-MAX_SOURCES)"));
  assert.ok(!s.includes("getOnboardingProfile("));
});

test("no funnel write sends back a list it read", () => {
  assert.doesNotMatch(ACTIONS, /saveOnboardingConfig\(userId, \{ sources \}/);
  assert.doesNotMatch(ROUTE, /saveOnboardingConfig\(userId, \{ sources \}/);
});
