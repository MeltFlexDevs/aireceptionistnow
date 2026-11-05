import test from "node:test";
import assert from "node:assert/strict";

import { deviceRevokeOf, isDeviceId } from "./device-id";

const MINE = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";
const LOST = "9b2c1d4e-0000-4a5b-8c6d-112233445566";

const params = (query: string) => new URLSearchParams(query);

test("isDeviceId keeps the X-Device-Id rule", () => {
  assert.equal(isDeviceId(MINE), true);
  assert.equal(isDeviceId("short"), false);
  assert.equal(isDeviceId("x".repeat(65)), false);
  assert.equal(isDeviceId("has space1"), false);
  assert.equal(isDeviceId(42), false);
});

test("?others=1 keeps the caller's device", () => {
  assert.deepEqual(deviceRevokeOf(params("others=1"), MINE), { scope: "others", keepDeviceId: MINE });
});

test("?others=1 without a valid X-Device-Id is a bad request", () => {
  assert.equal(deviceRevokeOf(params("others=1"), ""), null);
  assert.equal(deviceRevokeOf(params("others=1"), "bad id"), null);
  // Never falls back to the single revoke.
  assert.equal(deviceRevokeOf(params(`others=1&deviceId=${LOST}`), ""), null);
});

test("?deviceId= still forgets one install", () => {
  assert.deepEqual(deviceRevokeOf(params(`deviceId=${LOST}`), MINE), { scope: "one", deviceId: LOST });
  assert.deepEqual(deviceRevokeOf(params(`deviceId=${LOST}`), ""), { scope: "one", deviceId: LOST });
  assert.equal(deviceRevokeOf(params("deviceId=bad"), MINE), null);
  assert.equal(deviceRevokeOf(params(""), MINE), null);
});
