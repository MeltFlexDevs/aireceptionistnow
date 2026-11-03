import assert from "node:assert/strict";
import { test } from "node:test";
import { authErrorKey } from "./auth-error-key";

test("a wrong or expired code maps to invalidCode", () => {
  // GoTrue answers otp_expired (403) for a wrong code and for an expired one.
  assert.equal(authErrorKey({ code: "otp_expired", status: 403 }), "invalidCode");
});

test("rate limits map to rateLimited, by code or by HTTP 429", () => {
  assert.equal(authErrorKey({ code: "over_email_send_rate_limit", status: 429 }), "rateLimited");
  assert.equal(authErrorKey({ code: "over_request_rate_limit", status: 429 }), "rateLimited");
  assert.equal(authErrorKey({ status: 429 }), "rateLimited");
});

test("a rejected email address maps to invalidEmail", () => {
  assert.equal(authErrorKey({ code: "email_address_invalid", status: 400 }), "invalidEmail");
});

test("a disabled provider maps to notConfigured", () => {
  assert.equal(authErrorKey({ code: "provider_disabled", status: 400 }), "notConfigured");
  assert.equal(authErrorKey({ code: "email_provider_disabled", status: 400 }), "notConfigured");
});

test("the code decides before the status", () => {
  assert.equal(authErrorKey({ code: "otp_expired", status: 429 }), "invalidCode");
});

test("anything else maps to generic", () => {
  assert.equal(authErrorKey({ code: "validation_failed", status: 400 }), "generic");
  assert.equal(authErrorKey({ code: "unexpected_failure", status: 500 }), "generic");
  assert.equal(authErrorKey({ code: "constructor" }), "generic");
  assert.equal(authErrorKey({ code: "__proto__" }), "generic");
  assert.equal(authErrorKey({}), "generic");
  assert.equal(authErrorKey(null), "generic");
  assert.equal(authErrorKey(undefined), "generic");
});
