import {
  BillingNotConfigured,
  OtherAccountError,
  StripeActiveError,
  claimBillingEvent,
  claimConflictResponse,
  getBilling,
  getUserIdByProviderRef,
  markBillingEventProcessed,
  releaseBillingEvent,
  userExists,
} from "@/lib/billing";
import {
  VerificationException,
  VerificationStatus,
  isCompactJws,
  verifyNotification,
} from "@/lib/store-billing/apple";
import { applyStoreUpdate } from "@/lib/store-billing/entitle";
import { providerOf } from "@/lib/store-billing/snapshot";
import { appleUpdate, updateFromRecord } from "@/lib/store-billing/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * App Store Server Notifications v2 - renewals, expiry, refunds, billing
 * retries, auto-renew toggles.
 *
 * One URL serves Production and Sandbox (App Store Connect takes the same
 * address for both); the verifier tells them apart. No auth header exists for
 * this endpoint: the signature on `signedPayload`, checked against Apple's
 * root certificates, is the authentication. It sits outside the proxy
 * matcher (which only guards /dashboard), like /api/stripe/webhook.
 *
 * Apple retries on anything but a 2xx, so the answer is 200 for everything we
 * decided not to act on (TEST, duplicates, unknown users, a refused write) and
 * 500 only when a retry could succeed.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status });

export async function POST(req: Request): Promise<Response> {
  let signedPayload = "";
  try {
    const body = (await req.json()) as { signedPayload?: unknown };
    if (typeof body?.signedPayload === "string") signedPayload = body.signedPayload.trim();
  } catch {
    return json({ error: "Bad request." }, 400);
  }
  if (!signedPayload) return json({ error: "Bad request." }, 400);
  if (!isCompactJws(signedPayload)) return json({ error: "Invalid signature." }, 400);

  let verified;
  try {
    verified = await verifyNotification(signedPayload);
  } catch (err) {
    if (err instanceof BillingNotConfigured) {
      console.error(`[asn] ${err.message}`);
      return json({ error: "Not configured." }, 503);
    }
    if (err instanceof VerificationException) {
      if (err.status === VerificationStatus.RETRYABLE_VERIFICATION_FAILURE) {
        // OCSP unreachable: nothing is known to be wrong with the payload, so
        // 500 and let Apple's retry verify it.
        console.error("[asn] verification could not complete", err.cause ?? err);
        return json({ error: "Verification error." }, 500);
      }
      console.warn(`[asn] signature verification failed (status ${err.status})`);
      return json({ error: "Invalid signature." }, 400);
    }
    console.error("[asn] verification error", err);
    return json({ error: "Verification error." }, 500);
  }

  const { payload, tx, renewal } = verified;
  const type = payload.notificationType;
  if (type === "TEST") return Response.json({ received: true });

  const id = payload.notificationUUID;
  if (!id) return json({ error: "Bad request." }, 400);

  const claim = await claimBillingEvent("asn", id).catch((err) => {
    console.error(`[asn] claim failed: ${err}`);
    return null;
  });
  if (claim === null) return json({ error: "Claim failed." }, 500);
  // Processed: 200 duplicate. Busy (another run holds the claim): 409, so Apple retries later.
  const early = claimConflictResponse(claim);
  if (early) return early;

  // A 2xx means the delivery is handled: mark the claim processed so a later
  // retry of the same id is skipped (0014). A failure releases it below.
  const done = async (body: Record<string, unknown>) => {
    await markBillingEventProcessed("asn", id);
    return Response.json(body);
  };

  try {
    const originalTransactionId = tx?.originalTransactionId;
    if (!tx || !originalTransactionId) {
      // Summary-only notifications (RENEWAL_EXTENSION summaries etc.) carry no
      // transaction to act on.
      console.log(`[asn] ${type} ${id}: no transaction, ignored`);
      return done({ received: true });
    }

    const userId = await resolveUser(tx.appAccountToken, originalTransactionId);
    if (!userId) {
      console.error(`[asn] ${type} ${id}: no account for originalTransactionId ${originalTransactionId}`);
      return done({ received: true, unknown: true });
    }

    // The "unchanged" rows of the status table keep what this subscription
    // already wrote; anything another biller wrote is not ours to carry over.
    const current = await getBilling(userId);
    const own =
      current && providerOf(current) === "apple" && current.providerRef === originalTransactionId
        ? updateFromRecord(current)
        : null;
    const update = appleUpdate(type, payload.subtype, tx, renewal, new Date(), own);
    if (!update) return done({ received: true });

    try {
      await applyStoreUpdate(userId, "apple", originalTransactionId, update);
    } catch (err) {
      // Neither can be fixed by Apple retrying: the account is billed by
      // Stripe (needs a manual refund), or the subscription is bound elsewhere.
      if (err instanceof StripeActiveError) {
        console.error(`[asn] ${type} ${id} ignored: user ${userId} has a live Stripe subscription`);
        return done({ received: true, ignored: "stripe_active" });
      }
      if (err instanceof OtherAccountError) {
        console.error(`[asn] ${type} ${id} ignored: originalTransactionId ${originalTransactionId} belongs to another account`);
        return done({ received: true, ignored: "other_account" });
      }
      throw err;
    }
    return done({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Handler error.";
    console.error(`[asn] ${type} ${id} failed: ${message}`);
    // Release the claim so Apple's retry reprocesses, then 500 so it does.
    await releaseBillingEvent("asn", id);
    return json({ error: "Handler error." }, 500);
  }
}

/** The account: StoreKit's appAccountToken (our user id) when it names a real user, else the bound row. */
async function resolveUser(
  appAccountToken: string | undefined,
  originalTransactionId: string,
): Promise<string | null> {
  const token = appAccountToken?.toLowerCase();
  if (token && UUID_RE.test(token) && (await userExists(token))) return token;
  return getUserIdByProviderRef("apple", originalTransactionId);
}
