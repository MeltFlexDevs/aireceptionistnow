import test from "node:test";
import assert from "node:assert/strict";

import { connectErrorCode, connectErrorKey } from "./connect-error";

test("connectErrorCode returns null for empty input", () => {
  assert.equal(connectErrorCode(null), null);
  assert.equal(connectErrorCode(undefined), null);
  assert.equal(connectErrorCode(""), null);
});

test("connectErrorCode maps provider and known codes", () => {
  assert.equal(connectErrorCode("access_denied"), "denied");
  assert.equal(connectErrorCode("denied"), "denied");
  assert.equal(connectErrorCode("not_configured"), "not_configured");
  assert.equal(connectErrorCode("expired"), "expired");
  assert.equal(connectErrorCode("sign_in"), "sign_in");
  assert.equal(connectErrorCode("failed"), "failed");
});

test("connectErrorCode turns free text into failed", () => {
  assert.equal(connectErrorCode("Your card was declined. Call +1 900 555 0100 now"), "failed");
  assert.equal(connectErrorCode("google login is not configured"), "failed");
});

test("connectErrorKey picks the locale key", () => {
  assert.equal(connectErrorKey("denied"), "connectErrorDenied");
  assert.equal(connectErrorKey("not_configured"), "connectErrorNotConfigured");
  assert.equal(connectErrorKey("failed"), "connectErrorFailed");
  assert.equal(connectErrorKey("expired"), "connectErrorFailed");
  assert.equal(connectErrorKey("sign_in"), "connectErrorFailed");
});
