// English source copy for the pricing page. This is what the live English page
// renders and the reference every translation is made from, so the two cannot
// drift. Strings are copied verbatim from PricingClient.tsx and lib/plans.ts.
//
// Prices, plan ids and Stripe price ids are NOT here - they stay in
// lib/plans.ts. Only display text lives in this file.

import type { PricingCopy } from "../../_pricing-copy";

export const enPricing: PricingCopy = {
  // Reference-only. The live English pricing route sets its own metadata in
  // app/(main)/pricing/page.tsx and never reads these two, so they exist to show
  // translators the intended shape: head keyword first, no brand suffix.
  metaTitle: "AI Receptionist Pricing: Solo and Team Plans",
  metaDescription:
    "AI receptionist pricing - Solo and Team plans, billed monthly or annually with 15% off. 30-day money-back guarantee, answering calls in 10 minutes.",
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
  // Every figure below is checkable against PLANS in lib/plans.ts. The "Team is
  // not the cheaper plan" answer is deliberate and arithmetically true: Solo at
  // €99 plus €0.09/min overage undercuts Team at every volume (3,000 min costs
  // €279 on Solo vs €299 on Team; 5,000 min costs €459 vs €479). Team is a
  // capacity purchase, not a discount, and saying otherwise on the money page
  // would be a claim a buyer can disprove with a calculator.
  details: {
    heading: "How the billing actually works",
    body: [
      "You pay a flat monthly fee that includes a bundle of talk minutes, and €0.09 for each minute beyond it. A minute is measured on connected call time - the seconds the AI is actually on the line with a caller. Ringing, voicemail drops, and calls nobody answers are not talk time and are not billed.",
      "Solo includes 1,000 minutes and Team includes 3,000. Both bill extra minutes at the same €0.09, so going over is a predictable cost rather than a penalty or a forced upgrade. Nothing stops working when you cross the bundle.",
      "Numbers are billed separately from minutes: Solo comes with one and Team with three, and further numbers are €7 a month each on either plan. Choosing annual billing takes 15% off the plan fee; the per-minute rate and the number fee do not change.",
      "Prices are in EUR and exclude VAT. There is a 30-day money-back guarantee, and you can cancel at any time from the dashboard without contacting anyone.",
    ],
    faqHeading: "Pricing questions, answered",
    faqs: [
      {
        q: "Is Team the cheaper plan once I make a lot of calls?",
        a: "No, and it is worth being straight about that. Because both plans bill overage at the same €0.09 a minute, Solo plus overage costs less than Team at every volume: 3,000 minutes is €279 on Solo against €299 on Team, and 5,000 minutes is €459 against €479. Pick Team for what it adds in capacity - three concurrent calls instead of none, three phone numbers instead of one, multiple users, your own SIP connection, and outbound calls and campaigns - not because it will lower your bill.",
      },
      {
        q: "What exactly counts as a billed minute?",
        a: "Connected talk time between a caller and the AI, measured per call. Time spent ringing before the call connects is not billed, and neither are calls that never connect. Your dashboard shows minutes used against your bundle so the invoice is never a surprise.",
      },
      {
        q: "What happens when I run out of included minutes?",
        a: "Nothing breaks. The AI keeps answering and additional minutes bill at €0.09 each on your next invoice. There is no hard cut-off, no automatic plan upgrade, and no premium rate for going over.",
      },
      {
        q: "Can I cancel, and what does the guarantee cover?",
        a: "You can cancel at any time from the dashboard and you keep the service until the end of the period you have paid for. The 30-day money-back guarantee covers the plan fee, so if it does not work for your business you are not committed to a year of it.",
      },
      {
        q: "How much do extra phone numbers cost?",
        a: "€7 per month per additional number, on either plan. Solo includes one number and Team includes three. Extra numbers are useful when you want a separate line per location, per language, or per campaign so you can tell at a glance where a call came from.",
      },
      {
        q: "Do I save anything by paying annually?",
        a: "Annual billing takes 15% off the plan fee. Minute overage and additional phone numbers bill at the same rate either way, so the saving applies to the fixed part of the bill and not the variable part.",
      },
      {
        q: "Which plan should I start on?",
        a: "Size it on call volume and on whether you need calls answered simultaneously. Solo suits roughly 1-20 calls a day and answers one call at a time. Team suits roughly 20-100 calls a day and answers three at once, which matters if your phone rings in bursts rather than evenly. If you are unsure, start on Solo: overage is cheap enough that guessing low costs very little, and you can move up whenever you want.",
      },
      {
        q: "Are there setup fees or per-call charges?",
        a: "No. There is no setup fee, no onboarding fee, and no per-call charge - the plan fee, the €0.09 per extra minute, and €7 per extra number are the whole price list. Setup is self-serve and takes about ten minutes.",
      },
    ],
  },
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
