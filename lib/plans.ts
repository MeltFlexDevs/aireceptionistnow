/**
 * Subscription plans for AI Receptionist. Shared by the pricing page, the
 * checkout route and the Stripe webhook so the displayed price, the Stripe
 * Price billed, and the plan recorded on the customer can never drift apart.
 *
 * Two tiers, each billable monthly or annually. Annual is billed once per year
 * at a 15% discount (≈10.2 months for the price of 12). The per-plan Stripe
 * Price ids come from the environment so the same code runs against test prices
 * locally and live prices in production — create them once with
 * `node scripts/setup-stripe.mjs` and paste the ids into the env.
 */
export type PlanId = "solo" | "team";
export type BillingCycle = "monthly" | "annual";

/** Fraction off the equivalent 12× monthly price when billing annually. */
export const ANNUAL_DISCOUNT = 0.15;

/** Total yearly amount (cents) for a monthly price, with the annual discount. */
export function annualAmountCents(monthlyCents: number): number {
  return Math.round(monthlyCents * 12 * (1 - ANNUAL_DISCOUNT));
}

export type Plan = {
  /** Stable identifier used in checkout requests and stored on the customer. */
  id: PlanId;
  name: string;
  /** One-line audience description shown under the plan name. */
  tagline: string;
  /** Integer per-month price in cents when billed monthly (also the headline
   *  price on the pricing card). Used to create the Stripe Price and as a
   *  server-side sanity check. */
  monthlyAmountCents: number;
  currency: "eur";
  highlight: boolean;
  /** "Included" column on the pricing card (quotas, seats, numbers). */
  included: string[];
  /** "Features" column on the pricing card (capabilities). */
  features: string[];
  /** Stripe Price ids (`price_…`), read from the env so test/live stay
   *  separate. Empty until `scripts/setup-stripe.mjs` has been run. */
  priceIds: {
    monthly: string;
    annual: string;
  };
};

export const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    tagline: "Suitable for 1–20 calls/day",
    monthlyAmountCents: 9900,
    currency: "eur",
    highlight: false,
    included: [
      "1000 minutes — €0.09 per extra minute",
      "1,000 contacts",
      "No parallel calls",
      "1 phone number — €7/mo per additional",
      "Assistants",
      "1 user",
    ],
    features: ["20+ voices", "25+ languages", "Scheduler"],
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO_MONTHLY ?? "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO_ANNUAL ?? "",
    },
  },
  {
    id: "team",
    name: "Team",
    tagline: "Suitable for 20–100 calls/day",
    monthlyAmountCents: 29900,
    currency: "eur",
    highlight: true,
    included: [
      "3000 minutes — €0.09 per extra minute",
      "3,000 contacts",
      "3 concurrent calls",
      "3 phone numbers — €7/mo per additional",
      "Assistants",
      "Users",
    ],
    features: [
      "Everything in Solo",
      "Connect own SIP",
      "Outbound calls & Campaigns",
    ],
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY ?? "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_ANNUAL ?? "",
    },
  },
];

/** Look a plan up by its stable id. */
export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** The Stripe Price id for a plan + billing cycle. */
export function priceIdFor(plan: Plan, cycle: BillingCycle): string {
  return cycle === "annual" ? plan.priceIds.annual : plan.priceIds.monthly;
}

/** Resolve the plan + cycle a Stripe Price id belongs to (used by the webhook). */
export function getPlanByPriceId(
  priceId: string,
): { plan: Plan; cycle: BillingCycle } | undefined {
  for (const plan of PLANS) {
    if (plan.priceIds.monthly && plan.priceIds.monthly === priceId) {
      return { plan, cycle: "monthly" };
    }
    if (plan.priceIds.annual && plan.priceIds.annual === priceId) {
      return { plan, cycle: "annual" };
    }
  }
  return undefined;
}
