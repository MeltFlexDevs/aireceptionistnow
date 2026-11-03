import { BillingNotConfigured, OtherAccountError, StripeActiveError } from "@/lib/billing";
import { mobileAuth } from "@/lib/mobile/auth";
import {
  applyStoreUpdate,
  purchaseContext,
  recordTermsAcceptance,
  requiresTerms,
} from "@/lib/store-billing/entitle";
import { entitlementUpdate, fetchSubscriber } from "@/lib/store-billing/revenuecat";
import { toSnapshot } from "@/lib/store-billing/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Records a Google Play subscription for the signed-in account.
 *
 * The app buys through RevenueCat (configured with our user id as its app user
 * id) and then calls this; nothing from the app is trusted. The server reads
 * the subscriber from the RevenueCat REST API and derives the entitlement
 * itself - the same code the RevenueCat webhook runs, so the two can never
 * disagree. `debugProductId` in the body is a dev-mode hint and is ignored.
 *
 * Error bodies are `{ error, code? }`; the app's ApiError reads `code`.
 */

const STRIPE_ACTIVE =
  "Your plan is billed through your web account, so a Google Play subscription cannot be added to it.";
const OTHER_ACCOUNT =
  "This subscription belongs to another account. Sign in with the account you used to subscribe, or contact support.";

interface Body {
  acceptedTerms?: unknown;
  context?: unknown;
  debugProductId?: unknown;
}

const json = (body: Record<string, unknown>, status: number) => Response.json(body, { status });

export async function POST(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "billing:google");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return json({ error: "Not signed in." }, 401);

  // Every field is optional, so an empty body is a valid request.
  const body = (await req.json().catch(() => ({}))) as Body;
  const context = purchaseContext(body?.context);
  if (requiresTerms(context) && body?.acceptedTerms !== true) {
    return json({ error: "Please accept the Terms of Service to continue." }, 400);
  }

  try {
    let subscriber;
    try {
      subscriber = await fetchSubscriber(userId);
    } catch (err) {
      if (err instanceof BillingNotConfigured) {
        console.error(`[mobile:billing:google] ${err.message}`);
        return json({ error: "Billing is not configured yet. Please try again later." }, 503);
      }
      throw err;
    }

    const update = subscriber ? entitlementUpdate(subscriber, new Date()) : null;
    if (!update || update.status !== "active") {
      return json({ error: "No active subscription found on Google Play." }, 402);
    }

    if (requiresTerms(context)) await recordTermsAcceptance(userId);

    let record;
    try {
      record = await applyStoreUpdate(userId, "google", userId, update);
    } catch (err) {
      if (err instanceof StripeActiveError) return json({ error: STRIPE_ACTIVE, code: "stripe_active" }, 409);
      if (err instanceof OtherAccountError) return json({ error: OTHER_ACCOUNT, code: "other_account" }, 409);
      throw err;
    }
    return Response.json(toSnapshot(record));
  } catch (err) {
    console.error("[mobile:billing:google]", err);
    return json({ error: "Something went wrong." }, 500);
  }
}
