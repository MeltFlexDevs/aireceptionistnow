import test from "node:test";
import assert from "node:assert/strict";

import { statusBandState } from "./status-band";

test("no receptionist or no number is offline, whatever the enabled flag says", () => {
  assert.equal(statusBandState(false, true, true), "offline");
  assert.equal(statusBandState(true, false, true), "offline");
  assert.equal(statusBandState(false, false, false), "offline");
});

test("an enabled receptionist with a number is live", () => {
  assert.equal(statusBandState(true, true, true), "live");
});

test("a disabled receptionist with a number is paused", () => {
  assert.equal(statusBandState(true, true, false), "paused");
});
