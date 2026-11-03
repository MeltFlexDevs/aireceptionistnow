import test from "node:test";
import assert from "node:assert/strict";

import { checkMobileAuth } from "./auth-check";

const req = () => new Request("https://example.com/api/mobile/calls/x");

test("checkMobileAuth answers 503 JSON when the token check throws", async (t) => {
  const log = t.mock.method(console, "error", () => {});
  const res = await checkMobileAuth(req(), "call-detail", async () => {
    throw new Error("GoTrue down");
  });
  assert.ok(res instanceof Response);
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: "Can't check your sign-in right now. Try again." });
  assert.equal(log.mock.callCount(), 1);
  assert.equal(log.mock.calls[0].arguments[0], "[mobile:call-detail] auth check failed");
});

test("checkMobileAuth passes a rejected token through as null", async () => {
  assert.equal(await checkMobileAuth(req(), "call-detail", async () => null), null);
});

test("checkMobileAuth returns the user id", async () => {
  assert.equal(await checkMobileAuth(req(), "call-detail", async () => "u1"), "u1");
});
