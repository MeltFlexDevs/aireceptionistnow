import { VerificationStatus } from "@apple/app-store-server-library";

/**
 * How POST /api/mobile/billing/apple/verify answers a purchase it cannot
 * record. The app finishes the StoreKit transaction on a 400 (rejected for
 * good) and keeps it for StoreKit to send again on a 5xx. So a cause on the
 * server's side must answer 503, or the user pays and gets no plan.
 *
 * No `server-only` import (unlike ./apple), so node:test can load it.
 */
export interface VerifyFailure {
  status: 400 | 503;
  body: { error: string; code?: string };
}

/**
 * The server cannot record this purchase yet: its product is missing from
 * the catalog (./products), or APPLE_BUNDLE_ID does not match the app.
 */
export const NOT_CONFIGURED: VerifyFailure = {
  status: 503,
  body: { error: "We could not add this purchase right now. Please try again later.", code: "not_configured" },
};

/** The answer for a VerificationException from verifyTransaction, by its status. */
export function verificationFailure(status: VerificationStatus): VerifyFailure {
  // The OCSP check could not complete (responder down, network). The payload
  // may well be fine.
  if (status === VerificationStatus.RETRYABLE_VERIFICATION_FAILURE) {
    return { status: 503, body: { error: "We could not verify this purchase right now. Please try again." } };
  }
  // Apple signed it for another bundle id than APPLE_BUNDLE_ID, in Production
  // and in Sandbox (withVerifier in ./apple tries both). For the app's own
  // transactions that means the server's setup is wrong.
  if (status === VerificationStatus.INVALID_APP_IDENTIFIER) return NOT_CONFIGURED;
  return { status: 400, body: { error: "We could not verify this purchase." } };
}
