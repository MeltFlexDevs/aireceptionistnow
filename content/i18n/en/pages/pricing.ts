// English source copy for the pricing page. This is what the live English page
// renders and the reference every translation is made from, so the two cannot
// drift. Strings are copied verbatim from PricingClient.tsx and lib/plans.ts.
//
// Prices, plan ids and Stripe price ids are NOT here - they stay in
// lib/plans.ts. Only display text lives in this file.

import type { PricingCopy } from "../../_pricing-copy";

export const enPricing: PricingCopy = {
  guarantee: "30-day money-back guarantee",
  h1: "Simple, transparent pricing",
  sub: "Pick a plan and your AI receptionist is answering calls in minutes. Cancel anytime.",
  monthly: "Monthly",
  annually: "Annually",
  perMonth: "/ month",
  billedMonthly: "billed monthly",
  billedYearlyTemplate: "{total} billed yearly",
  includedLabel: "Included",
  featuresLabel: "Features",
  cta: "Start now",
  ctaBusy: "Starting…",
  checkoutError: "Could not start checkout.",
  vatNote: "Prices in EUR, excl. VAT. Extra minutes billed at €0.09/min.",
  plans: {
    solo: {
      name: "Solo",
      tagline: "Suitable for 1-20 calls/day",
      included: [
        "1000 minutes - €0.09 per extra minute",
        "1,000 contacts",
        "No parallel calls",
        "1 phone number - €7/mo per additional",
        "Assistants",
        "1 user",
      ],
      features: ["20+ voices", "25+ languages", "Scheduler"],
    },
    team: {
      name: "Team",
      tagline: "Suitable for 20-100 calls/day",
      included: [
        "3000 minutes - €0.09 per extra minute",
        "3,000 contacts",
        "3 concurrent calls",
        "3 phone numbers - €7/mo per additional",
        "Assistants",
        "Users",
      ],
      features: [
        "Everything in Solo",
        "Connect own SIP",
        "Outbound calls & Campaigns",
      ],
    },
  },
};
