export type PlanId = "solo" | "team";
export type BillingCycle = "monthly" | "annual";

export const ANNUAL_DISCOUNT = 0.15;

export function annualAmountCents(monthlyCents: number): number {
  return Math.round(monthlyCents * 12 * (1 - ANNUAL_DISCOUNT));
}

export interface PlanLimits {
  phoneNumbers: number;
  assistants: number;
  concurrentCalls: number;
  minutesIncluded: number;
  contacts: number;
  users: number;
}

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  limits: PlanLimits;
  monthlyAmountCents: number;
  currency: "eur";
  highlight: boolean;
  included: string[];
  features: string[];
  priceIds: {
    monthly: string;
    annual: string;
  };
};

export const PLANS: Plan[] = [
  {
    id: "solo",
    name: "Solo",
    tagline: "Suitable for 1-20 calls/day",
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
      "1000 minutes - €0.09 per extra minute",
      "1,000 contacts",
      "No parallel calls",
      "1 phone number - €7/mo per additional",
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
    tagline: "Suitable for 20-100 calls/day",
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
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY ?? "",
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM_ANNUAL ?? "",
    },
  },
];

export const FALLBACK_LIMITS: PlanLimits = PLANS[0].limits;

export function limitsFor(planId: PlanId | null | undefined): PlanLimits {
  const plan = planId ? getPlan(planId) : undefined;
  return plan ? plan.limits : FALLBACK_LIMITS;
}

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function priceIdFor(plan: Plan, cycle: BillingCycle): string {
  return cycle === "annual" ? plan.priceIds.annual : plan.priceIds.monthly;
}

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
