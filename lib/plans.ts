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

/**
 * Hard limits enforced server-side per plan. The source of truth for "how many
 * X can this account have". Kept next to the price so the quotas a customer pays
 * for and the quotas the app enforces can never drift apart. `Infinity` means no
 * cap. Used by lib/dashboard/plan.ts and the create/assign server actions.
 */
export interface PlanLimits {
  /** Concurrent phone numbers assigned to the account's assistants. */
  phoneNumbers: number;
  /** Assistants the account may keep (the pricing lists these as uncapped). */
  assistants: number;
  /** Simultaneous live calls. */
  concurrentCalls: number;
  /** Included talk minutes per billing period (overage billed per-minute). */
  minutesIncluded: number;
  /** Stored contacts. */
  contacts: number;
  /** Seats. */
  users: number;
}

export type Plan = {
  /** Stable identifier used in checkout requests and stored on the customer. */
  id: PlanId;
  name: string;
  /** One-line audience description shown under the plan name. */
  tagline: string;
  /** Enforced quotas for this plan. */
  limits: PlanLimits;
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
    limits: {
      phoneNumbers: 1,
      assistants: Infinity,
      concurrentCalls: 1,
      minutesIncluded: 1000,
      contacts: 1000,
      users: 1,
    },
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
    limits: {
      phoneNumbers: 3,
      assistants: Infinity,
      concurrentCalls: 3,
      minutesIncluded: 3000,
      contacts: 3000,
      users: Infinity,
    },
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

/**
 * Limits applied when an account has no active paid plan. Matches the entry tier
 * (Solo) so the app stays usable without immediately wedging on a 0-quota; the
 * "no active subscription" state is signalled separately by the caller.
 */
export const FALLBACK_LIMITS: PlanLimits = PLANS[0].limits;

/** The enforced limits for a plan id (or the fallback when null/unknown). */
export function limitsFor(planId: PlanId | null | undefined): PlanLimits {
  const plan = planId ? getPlan(planId) : undefined;
  return plan ? plan.limits : FALLBACK_LIMITS;
}

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
