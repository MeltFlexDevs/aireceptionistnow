import test from "node:test";
import assert from "node:assert/strict";

import { canAddAssistant, FALLBACK_LIMITS } from "./plans";

const limit = (assistants: number) => ({ ...FALLBACK_LIMITS, assistants });

test("a plan with room left allows another receptionist", () => {
  assert.equal(canAddAssistant(0, limit(1)), true);
});

test("a plan at its receptionist limit blocks another one", () => {
  assert.equal(canAddAssistant(1, limit(1)), false);
  assert.equal(canAddAssistant(2, limit(1)), false);
});

test("an unlimited plan always allows another receptionist", () => {
  assert.equal(canAddAssistant(50, limit(Infinity)), true);
});
