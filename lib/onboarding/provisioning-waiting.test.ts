import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Source guard: the repo has no component test runner.
const SRC = readFileSync(
  new URL("../../app/(main)/onboarding/steps/ProvisioningView.tsx", import.meta.url),
  "utf8",
);

test("the slow payment-waiting state offers a poll now and a support link", () => {
  const start = SRC.indexOf("{waiting && slow && (");
  assert.ok(start > 0, "slow waiting block exists");
  const block = SRC.slice(start, start + 1500);
  assert.match(block, /onClick=\{checkAgain\}/);
  assert.match(block, /href="\/support"/);
  assert.match(block, /\{o\.errorSupport\}/);
  assert.ok(!block.includes("step=plan"), "no way back to paying again");
});

test("checking again keeps the first start time so the slow block stays", () => {
  assert.match(SRC, /function checkAgain\(\) \{\s*setAttempt\(\(a\) => a \+ 1\);\s*\}/);
});
