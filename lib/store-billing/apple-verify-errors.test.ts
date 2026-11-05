import assert from "node:assert/strict";
import { test } from "node:test";

import { VerificationStatus } from "@apple/app-store-server-library";

import { NOT_CONFIGURED, verificationFailure } from "./apple-verify-errors";

// The app finishes a StoreKit transaction on a 400 and keeps it on a 5xx, so a
// cause on the server's side must be a 503 or the user pays and gets no plan.
test("a bundle id that does not match APPLE_BUNDLE_ID is a 503 not_configured", () => {
  assert.deepEqual(verificationFailure(VerificationStatus.INVALID_APP_IDENTIFIER), NOT_CONFIGURED);
  assert.deepEqual(NOT_CONFIGURED, {
    status: 503,
    body: { error: "We could not add this purchase right now. Please try again later.", code: "not_configured" },
  });
});

test("an OCSP check that could not complete stays a 503 without a code", () => {
  assert.deepEqual(verificationFailure(VerificationStatus.RETRYABLE_VERIFICATION_FAILURE), {
    status: 503,
    body: { error: "We could not verify this purchase right now. Please try again." },
  });
});

test("every other verification failure rejects the purchase with a 400", () => {
  for (const status of [
    VerificationStatus.VERIFICATION_FAILURE,
    VerificationStatus.INVALID_ENVIRONMENT,
    VerificationStatus.INVALID_CHAIN_LENGTH,
    VerificationStatus.INVALID_CERTIFICATE,
    VerificationStatus.FAILURE,
  ]) {
    assert.deepEqual(verificationFailure(status), {
      status: 400,
      body: { error: "We could not verify this purchase." },
    });
  }
});
