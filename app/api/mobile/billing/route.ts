import { getBilling } from "@/lib/billing";
import { mobileRoute } from "@/lib/mobile/auth";
import { toSnapshot } from "@/lib/store-billing/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The account's subscription as the app sees it, whoever bills it (Stripe on
 * the web, the App Store, Google Play, or a comp grant).
 *
 * Read straight from user_billing on every call - never through the 30s plan
 * cache - because the app polls this right after a purchase and must see the
 * row the verify/sync route just wrote. A Stripe customer id is never exposed;
 * `providerRef` is only the store-side handle.
 */
export const GET = mobileRoute(async (userId) => toSnapshot(await getBilling(userId)), "billing");
