import { test } from "node:test";
import assert from "node:assert/strict";

import { retryBookingSync, retryResponseStatus } from "./booking-retry";

test("a booking that is gone or not yours answers 404, so the app stops retrying", () => {
  assert.equal(retryResponseStatus({ ok: false, notFound: true }), 404);
});

test("any other failed retry answers 502", () => {
  assert.equal(retryResponseStatus({ ok: false }), 502);
  assert.equal(retryResponseStatus({ ok: false, notFound: false }), 502);
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
