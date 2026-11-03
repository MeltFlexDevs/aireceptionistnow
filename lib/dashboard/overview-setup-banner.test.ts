import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Source guard: the repo has no component test runner. This pins that the
// setup-failed banner also renders when the overview data fails to load.
const OVERVIEW = readFileSync(new URL("../../app/(main)/dashboard/page.tsx", import.meta.url), "utf8");

test("the setup-failed banner renders in both the load-error and the normal return", () => {
  assert.ok(!OVERVIEW.includes("{setupFailed && ("));
  assert.ok(OVERVIEW.includes("const setupBanner = setupFailed ? ("));
  const banner = OVERVIEW.indexOf("const setupBanner = setupFailed ? (");
  const early = OVERVIEW.indexOf("if (!data) {");
  assert.ok(banner >= 0 && early > banner, "setupBanner is defined before the !data return");
  const earlyReturn = OVERVIEW.slice(early, OVERVIEW.indexOf("{o.loadError}", early));
  assert.ok(earlyReturn.includes("{setupBanner}"), "the !data return renders the banner");
  assert.equal(OVERVIEW.split("{setupBanner}").length - 1, 2, "both returns render the banner");
});
