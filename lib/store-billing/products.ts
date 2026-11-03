import type { BillingCycle, PlanId } from "@/lib/plans";

/**
 * The store product catalogue - the single place the App Store / Google Play
 * product identifiers are spelled out.
 *
 * iOS: one auto-renewable subscription per plan and cycle, verified from the
 * StoreKit JWS the app posts to /api/mobile/billing/apple/verify.
 * Android: RevenueCat identifies a Google Play base plan as
 * `<subscriptionId>:<basePlanId>`; the app buys through RevenueCat packages
 * (`solo_monthly` ...) and the server reads the subscriber back from the
 * RevenueCat REST API. Entitlements are named after the plan (`solo`, `team`).
 *
 * Pure module: no server imports, so it is unit-tested directly.
 */
export type StoreProvider = "apple" | "google";

export interface StoreProduct {
  plan: PlanId;
  cycle: BillingCycle;
}

export const STORE_PRODUCTS = {
  apple: {
    "com.aireceptionistnow.app.solo.monthly": { plan: "solo", cycle: "monthly" },
    "com.aireceptionistnow.app.solo.annual": { plan: "solo", cycle: "annual" },
    "com.aireceptionistnow.app.team.monthly": { plan: "team", cycle: "monthly" },
    "com.aireceptionistnow.app.team.annual": { plan: "team", cycle: "annual" },
  },
  google: {
    "solo:monthly": { plan: "solo", cycle: "monthly" },
    "solo:annual": { plan: "solo", cycle: "annual" },
    "team:monthly": { plan: "team", cycle: "monthly" },
    "team:annual": { plan: "team", cycle: "annual" },
  },
} as const satisfies Record<StoreProvider, Record<string, StoreProduct>>;

/** RevenueCat entitlement identifiers, one per plan. */
export const REVENUECAT_ENTITLEMENTS: readonly PlanId[] = ["team", "solo"];

/**
 * Marketing lines in lib/plans.ts that the product does not deliver yet: there
 * is no SIP trunk and no outbound campaign feature anywhere in the code base.
 * An in-app purchase must not advertise them (App Review checks that the paid
 * feature list matches what the app does), so the store copy drops them. The
 * web pricing page still shows them - flagged for the owner.
 */
export const NOT_YET_IN_PRODUCT: readonly string[] = [
  "Connect own SIP",
  "Outbound calls & Campaigns",
];

export interface StoreProductIds {
  ios: { monthly: string; annual: string };
  android: {
    monthly: string;
    annual: string;
    packageMonthly: string;
    packageAnnual: string;
  };
}

/** The store identifiers the app needs to buy a plan, per platform. */
export function storeProductIdsFor(planId: PlanId): StoreProductIds {
  return {
    ios: {
      monthly: `com.aireceptionistnow.app.${planId}.monthly`,
      annual: `com.aireceptionistnow.app.${planId}.annual`,
    },
    android: {
      monthly: `${planId}:monthly`,
      annual: `${planId}:annual`,
      packageMonthly: `${planId}_monthly`,
      packageAnnual: `${planId}_annual`,
    },
  };
}

/** The plan a store product id sells, or null for anything we do not sell. */
export function productToPlan(
  provider: StoreProvider,
  productId: string | null | undefined,
): StoreProduct | null {
  if (!productId) return null;
  const table: Record<string, StoreProduct> = STORE_PRODUCTS[provider];
  return table[productId] ?? null;
}
