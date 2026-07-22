// Visible prose of the pricing page, extracted so it can be translated.
//
// SCOPE NOTE: prices, plan ids and billing amounts stay in lib/plans.ts, which
// is the single source of truth and also feeds the pricing JSON-LD and
// llms.txt. Only the DISPLAY text of a plan is translatable here, keyed by plan
// id, so a translator can never change what a plan costs or which Stripe price
// it maps to.

export interface PricingPlanCopy {
  /** Plan display name. Often left as-is ("Solo", "Team") - they are product names. */
  name: string;
  tagline: string;
  included: string[];
  features: string[];
}

export interface PricingCopy {
  guarantee: string;
  h1: string;
  sub: string;
  /** Billing-cycle toggle. */
  monthly: string;
  annually: string;
  /** Suffix after the price, e.g. "/ month". */
  perMonth: string;
  /** "billed monthly" and the "{total} billed yearly" template. */
  billedMonthly: string;
  /** {total} is substituted with the formatted annual amount. */
  billedYearlyTemplate: string;
  /** Section labels on each plan card. */
  includedLabel: string;
  featuresLabel: string;
  /** Plan CTA button, idle and busy. */
  cta: string;
  ctaBusy: string;
  checkoutError: string;
  /** Fine print under the plan grid. */
  vatNote: string;
  /** Keyed by plan id from lib/plans.ts. */
  plans: Record<string, PricingPlanCopy>;
}
