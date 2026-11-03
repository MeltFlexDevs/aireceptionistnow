import test from "node:test";
import assert from "node:assert/strict";

import { maskEmail, maskPhone } from "./log-mask";

test("maskPhone keeps only the last 4 digits", () => {
  assert.equal(maskPhone("+1 900 555 0100"), "***0100");
  assert.equal(maskPhone(null), "(none)");
  assert.equal(maskPhone("12"), "***");
});

test("maskEmail keeps the first letter and the domain", () => {
  assert.equal(maskEmail("user@example.com"), "u***@example.com");
  assert.equal(maskEmail("bad"), "***");
  assert.equal(maskEmail(undefined), "(none)");
});
