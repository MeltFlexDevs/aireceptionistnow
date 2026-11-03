import test from "node:test";
import assert from "node:assert/strict";

import { TERMS_TICK_MAX_AGE_MS, encodeTermsTick, shouldResumeCheckout } from "./terms-resume";

const raw = encodeTermsTick("team", "annual", 1000);

test("no stored tick does not resume", () => {
  assert.equal(shouldResumeCheckout(null, "team", "annual", 1000), false);
});

test("a recent tick for the same plan and cycle resumes", () => {
  assert.equal(shouldResumeCheckout(raw, "team", "annual", 1000 + 60_000), true);
});

test("a different plan does not resume", () => {
  assert.equal(shouldResumeCheckout(raw, "solo", "annual", 1000 + 60_000), false);
});

test("a different cycle does not resume", () => {
  assert.equal(shouldResumeCheckout(raw, "team", "monthly", 1000 + 60_000), false);
});

test("a tick older than the max age does not resume", () => {
  assert.equal(shouldResumeCheckout(raw, "team", "annual", 1000 + TERMS_TICK_MAX_AGE_MS + 1), false);
});

test("a tick from the future does not resume", () => {
  assert.equal(shouldResumeCheckout(raw, "team", "annual", 0), false);
});

test("bad JSON or a bad shape does not resume", () => {
  assert.equal(shouldResumeCheckout("not json", "team", "annual", 2000), false);
  assert.equal(shouldResumeCheckout(JSON.stringify({ plan: "team" }), "team", "annual", 2000), false);
});
