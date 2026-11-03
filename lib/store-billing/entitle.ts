import "server-only";

import { revalidateTag } from "next/cache";
import { after } from "next/server";

import {
  getBilling,
  saveStoreSubscription,
  type BillingRecord,
  type StoreWrite,
} from "@/lib/billing";
import { planCacheTag } from "@/lib/dashboard/plan";
import { getOnboardingProfile, saveOnboardingConfig } from "@/lib/dashboard/onboarding-profile";
import { provisionOnboarding } from "@/lib/dashboard/provision";
import { TERMS_VERSION } from "@/lib/legal";
import type { StoreProvider } from "./products";
import { isActiveStatus } from "./snapshot";

/**
 * Why the app is calling: a new purchase from the funnel or the pricing screen
 * forms a contract and needs the Terms ticked; restoring purchases or
 * reconciling on launch only re-reads a contract that already exists.
 */
export type PurchaseContext = "onboarding" | "pricing" | "restore" | "reconcile";

export function purchaseContext(value: unknown): PurchaseContext {
  return value === "onboarding" || value === "restore" || value === "reconcile" ? value : "pricing";
}

export function requiresTerms(context: PurchaseContext): boolean {
  return context === "onboarding" || context === "pricing";
}

/**
 * The acceptance record, written the same way /api/checkout writes it and for
 * the same reason: a stored acceptance only means something if the purchase
 * could not be recorded without one. Best-effort - a persistence hiccup must
 * not lose a paying customer's entitlement.
 */
export async function recordTermsAcceptance(userId: string): Promise<void> {
  await saveOnboardingConfig(userId, {
    termsAcceptedAt: new Date().toISOString(),
    termsVersion: TERMS_VERSION,
  }).catch((err) => {
    console.error("[store-billing] terms acceptance not recorded", err);
  });
}

/**
 * The one write path for store entitlements - Apple verify, Google sync and
 * both webhooks land here.
 *
 * Persists through set_store_subscription (which enforces the provider
 * precedence rules and may throw StripeActiveError / OtherAccountError),
 * expires the dashboard's cached plan context so the next read sees the new
 * plan, and, when the purchase activates a plan for an account still in the
 * setup funnel, starts provisioning after the response exactly like the
 * Stripe webhook does. Existing web customers with an abandoned funnel draft
 * are safe: provisionOnboarding stands down when the account already owns
 * assistants.
 */
export async function applyStoreUpdate(
  userId: string,
  provider: StoreProvider,
  providerRef: string,
  update: StoreWrite,
): Promise<BillingRecord | null> {
  await saveStoreSubscription({ userId, provider, providerRef, update });

  // Two-argument form (Next 16); { expire: 0 } gives read-your-writes on the
  // next dashboard request instead of stale-while-revalidate.
  revalidateTag(planCacheTag(userId), { expire: 0 });

  if (isActiveStatus(update.status)) {
    const profile = await getOnboardingProfile(userId);
    if (profile && profile.status !== "done") {
      after(() =>
        provisionOnboarding(userId).catch((err) =>
          console.error(`[store-billing] onboarding provision failed: ${err}`),
        ),
      );
    }
  }

  return getBilling(userId);
}
