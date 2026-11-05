import { test } from "node:test";
import assert from "node:assert/strict";

import { RETRY_FAILURE_CODES, retryBookingSync, retryResponseStatus } from "./booking-retry";

test("a booking that is gone or not yours answers 404, so the app stops retrying", () => {
  assert.equal(retryResponseStatus({ ok: false, notFound: true }), 404);
});

test("any other failed retry answers 502", () => {
  assert.equal(retryResponseStatus({ ok: false }), 502);
  assert.equal(retryResponseStatus({ ok: false, notFound: false }), 502);
});

test("a failure a retry cannot fix answers 409 for every code, so the app stops offering a retry", () => {
  for (const code of RETRY_FAILURE_CODES) {
    assert.equal(retryResponseStatus({ ok: false, code }), 409, code);
  }
});

test("not found wins over a code", () => {
  assert.equal(retryResponseStatus({ ok: false, notFound: true, code: "not_failed" }), 404);
});

test("the retry failure codes are the six the mobile route has text for", () => {
  assert.deepEqual(
    [...RETRY_FAILURE_CODES].sort(),
    ["no_calendar", "no_time", "not_connected", "not_failed", "past", "slot_taken"],
  );
});

test("a synced booking answers 200", () => {
  assert.equal(retryResponseStatus({ ok: true }), 200);
});

test("a malformed booking id is not found, before any database call", async () => {
  assert.deepEqual(await retryBookingSync("abc", "u1"), {
    ok: false,
    notFound: true,
    message: "booking not found",
  });
});
