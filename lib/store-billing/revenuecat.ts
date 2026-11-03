import "server-only";

import { BillingNotConfigured } from "@/lib/billing";
import type { RcSubscriber } from "./status";

export { entitlementUpdate, type RcSubscriber, type RcSubscription } from "./status";

/**
 * RevenueCat REST API v1 - the server-side read of a Google Play subscriber.
 *
 * The app configures RevenueCat with our Supabase user id as the app user id,
 * so `fetchSubscriber(userId)` is the whole lookup. Purchases are never taken
 * from the app's word: both /api/mobile/billing/google/sync and the RevenueCat
 * webhook read the subscriber here and feed it to `entitlementUpdate`.
 */

const API = "https://api.revenuecat.com/v1";

function secretKey(): string {
  const key = (process.env.REVENUECAT_SECRET_KEY ?? "").trim();
  if (!key) throw new BillingNotConfigured("REVENUECAT_SECRET_KEY");
  return key;
}

/** GET /subscribers/{id}. Null when RevenueCat has never seen the id. */
export async function fetchSubscriber(appUserId: string): Promise<RcSubscriber | null> {
  const key = secretKey();
  const res = await fetch(`${API}/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Platform": "android",
    },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`RevenueCat subscriber fetch failed: ${res.status}`);
  }
  const body = (await res.json()) as { subscriber?: RcSubscriber };
  return body.subscriber ?? null;
}
