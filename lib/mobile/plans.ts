import { ANNUAL_DISCOUNT, EXTRA_MINUTE_EUR, PLANS, annualAmountCents } from "@/lib/plans";
import { NOT_YET_IN_PRODUCT, storeProductIdsFor } from "@/lib/store-billing/products";

/**
 * The plan catalogue, shaped for the app.
 *
 * `lib/plans.ts` is the single source of truth for price, limits and copy; this
 * only flattens it. The two things it adds are the annual figures, which the web
 * computes in the browser from `annualAmountCents` and the app would otherwise
 * have to re-derive - a second place for the 15% discount to drift.
 *
 * `limits.assistants` and `limits.users` are `Infinity` on the Team plan, which
 * `JSON.stringify` turns into `null`. They are deliberately not serialized:
 * the app renders the `included` copy, which already says "Assistants"/"Users"
 * in words.
 *
 * The `store*` fields exist because the app sells through the App Store and
 * Google Play, not Stripe: the store sets the price (in the user's storefront
 * currency), so copy that quotes a euro amount cannot be shown next to an
 * in-app purchase, and a feature the product does not deliver yet cannot be
 * sold in one.
 */

/**
 * `included` without the Stripe-only price suffixes: "1000 minutes - €0.09 per
 * extra minute" becomes "1000 minutes". A line that is only a price is dropped.
 */
export function storeIncludedLines(included: readonly string[]): string[] {
  return included
    .map((line) => line.split(" - €")[0].trim())
    .filter((line) => line !== "" && !line.startsWith("€"));
}

/** `features` minus what the code base does not deliver yet (see NOT_YET_IN_PRODUCT). */
export function storeFeatureLines(features: readonly string[]): string[] {
  return features.filter((f) => !NOT_YET_IN_PRODUCT.includes(f));
}

export function mobilePlans() {
  return PLANS.map((p) => {
    const annual = annualAmountCents(p.monthlyAmountCents);
    return {
      id: p.id,
      name: p.name,
      tagline: p.tagline,
      monthlyAmountCents: p.monthlyAmountCents,
      /** The full yearly charge, i.e. what Stripe bills once on the annual cycle. */
      annualAmountCents: annual,
      /** The per-month figure the annual price works out to, for the price row. */
      annualMonthlyCents: Math.round(annual / 12),
      currency: p.currency,
      highlight: p.highlight,
      included: p.included,
      features: p.features,
      /** App Store product ids / Google Play base plans + RevenueCat packages for this plan. */
      storeProductIds: storeProductIdsFor(p.id),
      storeIncluded: storeIncludedLines(p.included),
      storeFeatures: storeFeatureLines(p.features),
      minutesIncluded: p.limits.minutesIncluded,
      phoneNumbers: p.limits.phoneNumbers,
      concurrentCalls: p.limits.concurrentCalls,
      contacts: p.limits.contacts,
    };
  });
}

/** Catalogue-level numbers the pricing screen quotes outside any one plan. */
export function planTerms() {
  return {
    annualDiscount: ANNUAL_DISCOUNT,
    extraMinuteEur: EXTRA_MINUTE_EUR,
  };
}
