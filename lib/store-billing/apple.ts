import "server-only";

import {
  Environment,
  SignedDataVerifier,
  VerificationException,
  VerificationStatus,
  type JWSRenewalInfoDecodedPayload,
  type JWSTransactionDecodedPayload,
  type ResponseBodyV2DecodedPayload,
} from "@apple/app-store-server-library";

import { BillingNotConfigured } from "@/lib/billing";
import { appleRootCertificates } from "./apple-root-certs";
import type { StoreEnvironment } from "./snapshot";

/**
 * Server-side verification of Apple-signed payloads: the StoreKit 2 JWS the
 * app posts after a purchase, and App Store Server Notifications v2.
 *
 * Verification is the whole point - a JWS is only trusted once Apple's
 * library has checked the certificate chain (against the embedded roots, with
 * online OCSP checks), the signature, the bundle id and the environment. The
 * app can decode a JWS itself but is never believed.
 *
 * One verifier per environment. Apple signs Sandbox and Production with the
 * same chain and only the `environment` claim differs, so a payload is tried
 * against Production first and, on an environment mismatch, against Sandbox.
 * That keeps one URL for both environments in App Store Connect and lets
 * App Review (which buys in Sandbox) exercise the real production server.
 */

export { VerificationException, VerificationStatus };

/**
 * A compact JWS: three base64url segments. Checked before touching the
 * verifier so garbage is a 400 whether or not Apple credentials are set.
 */
export function isCompactJws(value: string): boolean {
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);
}

function config(): { bundleId: string; appAppleId: number | undefined } {
  const bundleId = (process.env.APPLE_BUNDLE_ID ?? "").trim();
  if (!bundleId) throw new BillingNotConfigured("APPLE_BUNDLE_ID");
  const raw = (process.env.APPLE_APP_APPLE_ID ?? "").trim();
  const appAppleId = raw ? Number(raw) : undefined;
  if (raw && !Number.isFinite(appAppleId)) throw new BillingNotConfigured("APPLE_APP_APPLE_ID is not a number");
  return { bundleId, appAppleId };
}

/** The bundle id the verifiers are built with - trimmed, so callers compare against the same value. */
export function appleBundleId(): string {
  return config().bundleId;
}

const verifiers: Partial<Record<StoreEnvironment, SignedDataVerifier>> = {};

function verifier(environment: StoreEnvironment): SignedDataVerifier {
  const cached = verifiers[environment];
  if (cached) return cached;
  const { bundleId, appAppleId } = config();
  // Apple requires the numeric app id to verify Production payloads; Sandbox
  // payloads carry none.
  if (environment === "Production" && appAppleId === undefined) {
    throw new BillingNotConfigured("APPLE_APP_APPLE_ID");
  }
  const created = new SignedDataVerifier(
    appleRootCertificates(),
    true,
    environment === "Production" ? Environment.PRODUCTION : Environment.SANDBOX,
    bundleId,
    environment === "Production" ? appAppleId : undefined,
  );
  verifiers[environment] = created;
  return created;
}

function isEnvironmentMismatch(err: unknown): boolean {
  return (
    err instanceof VerificationException &&
    (err.status === VerificationStatus.INVALID_ENVIRONMENT ||
      // Production checks the app id before the environment, so a Sandbox
      // payload can surface as this when it carries no appAppleId.
      err.status === VerificationStatus.INVALID_APP_IDENTIFIER)
  );
}

/** Run `fn` against Production, then Sandbox when the payload is not a Production one. */
async function withVerifier<T>(
  fn: (v: SignedDataVerifier) => Promise<T>,
): Promise<{ value: T; environment: StoreEnvironment }> {
  const { appAppleId } = config();
  // Without the app id only Sandbox can be verified; a Production payload then
  // fails as "not configured" rather than as a bad signature.
  const order: StoreEnvironment[] = appAppleId === undefined ? ["Sandbox"] : ["Production", "Sandbox"];
  let last: unknown;
  for (const environment of order) {
    try {
      return { value: await fn(verifier(environment)), environment };
    } catch (err) {
      if (!isEnvironmentMismatch(err)) throw err;
      last = err;
    }
  }
  if (appAppleId === undefined) throw new BillingNotConfigured("APPLE_APP_APPLE_ID");
  throw last;
}

export interface VerifiedTransaction {
  tx: JWSTransactionDecodedPayload;
  environment: StoreEnvironment;
}

/** Verify a StoreKit 2 signed transaction (the `jws` the app posts). */
export async function verifyTransaction(jws: string): Promise<VerifiedTransaction> {
  const { value, environment } = await withVerifier((v) => v.verifyAndDecodeTransaction(jws));
  return { tx: value, environment };
}

export interface VerifiedNotification {
  payload: ResponseBodyV2DecodedPayload;
  tx: JWSTransactionDecodedPayload | null;
  renewal: JWSRenewalInfoDecodedPayload | null;
  environment: StoreEnvironment;
}

/** Verify an App Store Server Notification v2 and decode its signed transaction + renewal info. */
export async function verifyNotification(signedPayload: string): Promise<VerifiedNotification> {
  const { value: payload, environment } = await withVerifier((v) =>
    v.verifyAndDecodeNotification(signedPayload),
  );
  const v = verifier(environment);
  const data = payload.data;
  const tx = data?.signedTransactionInfo
    ? await v.verifyAndDecodeTransaction(data.signedTransactionInfo)
    : null;
  const renewal = data?.signedRenewalInfo
    ? await v.verifyAndDecodeRenewalInfo(data.signedRenewalInfo)
    : null;
  return { payload, tx, renewal, environment };
}
