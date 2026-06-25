import "server-only";

import Stripe from "stripe";

/**
 * Server-side Stripe client. The secret key (`sk_test_…` while testing,
 * `sk_live_…`/`rk_live_…` in production) is read from the environment and must
 * NEVER reach the browser, so this module is server-only.
 *
 * The API version is intentionally left unset so the SDK uses the version its
 * TypeScript types were generated against; pin it here only if you also pin it
 * in the Stripe dashboard.
 */
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  cached = new Stripe(key, {
    // Reused across invocations on the same warm function instance.
    appInfo: { name: "AI Receptionist", url: "https://aireceptionistnow.com" },
  });
  return cached;
}
