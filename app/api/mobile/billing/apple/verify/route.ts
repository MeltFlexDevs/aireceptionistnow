import {
  BillingNotConfigured,
  OtherAccountError,
  StripeActiveError,
  getUserIdByProviderRef,
} from "@/lib/billing";
import { mobileAuth } from "@/lib/mobile/auth";
import {
  VerificationException,
  appleBundleId,
  isCompactJws,
  verifyTransaction,
} from "@/lib/store-billing/apple";
import { NOT_CONFIGURED, verificationFailure } from "@/lib/store-billing/apple-verify-errors";
import {
  applyStoreUpdate,
  purchaseContext,
  recordTermsAcceptance,
  requiresTerms,
} from "@/lib/store-billing/entitle";
import { productToPlan } from "@/lib/store-billing/products";
import { toSnapshot } from "@/lib/store-billing/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Records an App Store subscription for the signed-in account.
 *
 * The app posts the StoreKit 2 signed transaction (`jws`) after a purchase,
 * a restore, or on launch to reconcile. Nothing in it is trusted until Apple's
 * library has verified the chain and signature; then the transaction is bound
 * to the account: StoreKit's `appAccountToken` (the app sets it to the user id
 * at purchase) must be this user, and a transaction without one must not
 * already belong to a different account. Idempotent - the same
 * originalTransactionId for the same user just refreshes the row.
 *
 * Error bodies are `{ error, code? }`; the app's ApiError reads `code`.
 */

const OTHER_ACCOUNT =
  "This subscription belongs to another account. Sign in with the account you used to subscribe, or contact support.";
const STRIPE_ACTIVE =
  "Your plan is billed through your web account, so an App Store subscription cannot be added to it.";

interface Body {
  jws?: unknown;
  acceptedTerms?: unknown;
  context?: unknown;
}

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status });

export async function POST(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "billing:apple");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return json({ error: "Not signed in." }, 401);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "Bad request." }, 400);
  }
  const jws = typeof body?.jws === "string" ? body.jws.trim() : "";
  if (!jws) return json({ error: "Bad request." }, 400);
  if (!isCompactJws(jws)) return json({ error: "We could not verify this purchase." }, 400);

  const context = purchaseContext(body?.context);
  if (requiresTerms(context) && body?.acceptedTerms !== true) {
    return json({ error: "Please accept the Terms of Service to continue." }, 400);
  }

  try {
    let verified;
    try {
      verified = await verifyTransaction(jws);
    } catch (err) {
      if (err instanceof BillingNotConfigured) {
        console.error(`[mobile:billing:apple] ${err.message}`);
        return json({ error: "Billing is not configured yet. Please try again later." }, 503);
      }
      if (err instanceof VerificationException) {
        const failure = verificationFailure(err.status);
        if (failure.status === 503) {
          // Not the purchase's fault (OCSP could not complete, or the bundle id
          // does not match APPLE_BUNDLE_ID), so keep the app on its 5xx retry
          // path: a 400 would make it finish the transaction as rejected.
          console.error(`[mobile:billing:apple] verification could not complete (status ${err.status})`, err.cause ?? err);
        } else {
          console.warn(`[mobile:billing:apple] verification rejected (status ${err.status})`);
        }
        return json(failure.body, failure.status);
      }
      throw err;
    }
    const { tx, environment } = verified;

    // The verifier already checked the bundle id; this is belt and braces.
    if (tx.bundleId !== appleBundleId() || !tx.originalTransactionId) {
      return json({ error: "We could not verify this purchase." }, 400);
    }
    const product = tx.type === "Auto-Renewable Subscription" ? productToPlan("apple", tx.productId) : null;
    if (!product) {
      // Live in App Store Connect but missing from the catalog: a server setup
      // error. A 503 keeps the transaction for StoreKit to send again.
      console.error(`[mobile:billing:apple] no plan for product ${tx.productId} (${tx.type})`);
      return json(NOT_CONFIGURED.body, NOT_CONFIGURED.status);
    }
    if (tx.revocationDate != null) return json({ error: "This purchase was refunded." }, 400);
    if (typeof tx.expiresDate !== "number" || tx.expiresDate <= Date.now()) {
      return json({ error: "This subscription has expired." }, 400);
    }

    // Binding. StoreKit and Postgres may differ in UUID casing.
    const token = tx.appAccountToken?.toLowerCase();
    if (token) {
      if (token !== userId.toLowerCase()) return json({ error: OTHER_ACCOUNT, code: "other_account" }, 409);
    } else {
      const owner = await getUserIdByProviderRef("apple", tx.originalTransactionId);
      if (owner && owner.toLowerCase() !== userId.toLowerCase()) {
        return json({ error: OTHER_ACCOUNT, code: "other_account" }, 409);
      }
    }

    if (requiresTerms(context)) await recordTermsAcceptance(userId);

    let record;
    try {
      record = await applyStoreUpdate(userId, "apple", tx.originalTransactionId, {
        status: "active",
        plan: product.plan,
        cycle: product.cycle,
        currentPeriodEnd: new Date(tx.expiresDate).toISOString(),
        environment,
        // null keeps the flag an App Store notification stored: a signed
        // transaction carries no auto-renew state (0014).
        cancelAtPeriodEnd: null,
      });
    } catch (err) {
      if (err instanceof StripeActiveError) return json({ error: STRIPE_ACTIVE, code: "stripe_active" }, 409);
      if (err instanceof OtherAccountError) return json({ error: OTHER_ACCOUNT, code: "other_account" }, 409);
      throw err;
    }
    return Response.json(toSnapshot(record));
  } catch (err) {
    console.error("[mobile:billing:apple]", err);
    return json({ error: "Something went wrong." }, 500);
  }
}
