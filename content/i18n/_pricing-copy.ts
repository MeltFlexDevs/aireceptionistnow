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
  /**
   * SERP title, separate from h1 for the same reason as HomeCopy.metaTitle:
   * "Simple, transparent pricing" is a fine page headline and a worthless
   * search result, because it contains none of the words a buyer types. Emitted
   * as an ABSOLUTE title with no brand suffix appended - keep it <=60 chars and
   * lead with the head keyword for that market.
   */
  metaTitle: string;
  /**
   * Meta description for the SERP snippet and OG/Twitter cards. Previously the
   * localized pricing route reused `sub` for this; that is a page subheading
   * written for someone already on the page, not a snippet written to win the
   * click. Keep it <=160 characters.
   *
   * FACTUAL SCOPE: there is no free plan in lib/plans.ts, so do not write one
   * into a snippet here. Claims must be checkable against PLANS and `guarantee`.
   */
  metaDescription: string;
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
