import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Source guard for the onboarding server actions: next.config.ts caches dynamic
// pages on the client for 30s (staleTimes.dynamic), so a redirect to the same
// /onboarding URL shows the old step unless the action revalidates first.
const ACTIONS = readFileSync(
  new URL("../../app/(main)/onboarding/actions.ts", import.meta.url),
  "utf8",
);

const TO_STEP = ACTIONS.slice(
  ACTIONS.indexOf("function toStep("),
  ACTIONS.indexOf("async function unlockStep("),
);

test("toStep revalidates /onboarding before it redirects", () => {
  const revalidate = TO_STEP.indexOf('revalidatePath("/onboarding")');
  assert.ok(revalidate > 0, 'toStep calls revalidatePath("/onboarding")');
  assert.ok(revalidate < TO_STEP.indexOf("redirect("), "revalidatePath runs before redirect");
});

test("every redirect back into the funnel goes through toStep", () => {
  assert.equal(ACTIONS.match(/redirect\(\s*`\/onboarding/g)?.length, 1);
  assert.match(TO_STEP, /redirect\(`\/onboarding\$\{query\}`\)/);
});
