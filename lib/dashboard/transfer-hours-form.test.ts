import test from "node:test";
import assert from "node:assert/strict";

import { hasNoOpenDay } from "./transfer-hours-form";

test("schedule on with no day ticked is flagged", () => {
  assert.equal(hasNoOpenDay(true, Array(7).fill(false)), true);
});

test("schedule on with one day ticked is fine", () => {
  assert.equal(hasNoOpenDay(true, [false, false, true, false, false, false, false]), false);
});

test("schedule off with no day ticked is allowed", () => {
  assert.equal(hasNoOpenDay(false, Array(7).fill(false)), false);
});
