import { getPlan, getPlanByPriceId, type BillingCycle, type PlanId } from "@/lib/plans";

/**
 * The Stripe.Subscription fields the webhook reads. Structural, so tests can
 * pass plain objects instead of Stripe SDK objects.
 */
export interface SubscriptionFields {
  id: string;
  status: string;
  metadata?: Record<string, string> | null;
  items?: {
    data?: Array<{
      price?: { id?: string } | null;
      current_period_end?: number | null;
    }>;
  } | null;
  cancel_at_period_end?: boolean | null;
  cancel_at?: number | null;
  /** Older Stripe API versions put the period end here, newer ones on the items. */
  current_period_end?: number | null;
}

type PriceLookup = (
  priceId: string,
) => { plan: { id: PlanId }; cycle: BillingCycle } | undefined;

const CYCLES: readonly BillingCycle[] = ["monthly", "annual"];

/**
 * The plan and cycle a Stripe subscription grants: both null unless it is
 * active or trialing. The price id decides. A price that no plan maps (an old
 * price, a wrong env value) is logged. Then the checkout metadata decides,
 * but only a real plan id and cycle count (cr-billing-09).
 */
export function planFromSubscription(
  sub: SubscriptionFields,
  lookup: PriceLookup = getPlanByPriceId,
): { plan: PlanId | null; cycle: BillingCycle | null } {
  if (sub.status !== "active" && sub.status !== "trialing") {
    return { plan: null, cycle: null };
  }
  const priceId = sub.items?.data?.[0]?.price?.id;
  const match = priceId ? lookup(priceId) : undefined;
  if (match) return { plan: match.plan.id, cycle: match.cycle };

  console.error("[stripe] unmapped price", {
    price: priceId ?? null,
    subscription: sub.id,
  });
  const metaCycle = sub.metadata?.cycle;
  return {
    plan: getPlan(sub.metadata?.plan ?? "")?.id ?? null,
    cycle: CYCLES.find((c) => c === metaCycle) ?? null,
  };
}

/**
 * True when the subscription ends at the close of the current period instead
 * of renewing (cr-billing-07). A portal cancel sets cancel_at_period_end.
 * Since API 2025-05-28 (basil) a cancel can also come as cancel_at alone: it
 * counts when it falls at or before the period end.
 */
export function cancelsAtPeriodEnd(
  sub: Pick<SubscriptionFields, "cancel_at_period_end" | "cancel_at">,
  periodEnd: number | null,
): boolean {
  if (sub.cancel_at_period_end === true) return true;
  return sub.cancel_at != null && periodEnd != null && sub.cancel_at <= periodEnd;
}

/**
 * The end of the current period, in Unix seconds. Newer Stripe API versions
 * put it on the subscription items, older ones on the subscription.
 */
export function periodEndOf(
  sub: Pick<SubscriptionFields, "current_period_end" | "items">,
): number | null {
  return sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? null;
}

// The LIVE STRIPE statuses: Stripe still bills, or still tries to collect.
// The same list as isLiveStripe (lib/store-billing/snapshot.ts) and the
// other-subscription guard in set_subscription (0013).
const LIVE_STATUSES: readonly string[] = [
  "active",
  "trialing",
  "past_due",
  "unpaid",
  "incomplete",
];

/** True when Stripe still bills, or still tries to collect, in this status. */
export function isLiveStatus(status: string): boolean {
  return LIVE_STATUSES.includes(status);
}

/** True when a subscription in this status grants the plan (active, trialing). */
export function grantsPlanStatus(status: string): boolean {
  return status === "active" || status === "trialing";
}

/**
 * The subscription the row should follow after the tracked one stopped
 * billing: another live subscription of the same customer, or null.
 * set_subscription ignores a second subscription's events while the tracked
 * one is live (0013), and Stripe sends nothing new for it until it renews.
 * A status that grants a plan (active, trialing) wins over one that Stripe is
 * still collecting for. Then the latest period end wins, then the first in
 * the list (Stripe lists the newest first).
 */
export function pickLiveSibling<T extends SubscriptionFields>(
  subs: readonly T[],
  endedId: string,
): T | null {
  let best: T | null = null;
  let bestRank = -1;
  let bestEnd = -Infinity;
  for (const s of subs) {
    if (s.id === endedId || !isLiveStatus(s.status)) continue;
    const rank = s.status === "active" || s.status === "trialing" ? 1 : 0;
    const end = periodEndOf(s) ?? 0;
    if (rank > bestRank || (rank === bestRank && end > bestEnd)) {
      best = s;
      bestRank = rank;
      bestEnd = end;
    }
  }
  return best;
}

/**
 * The subscription the row should follow after an event of `from`, or null.
 * `from` stopped billing: any live sibling (pickLiveSibling). `from` is still
 * live but grants no plan (past_due, unpaid, incomplete): only a sibling that
 * grants one, the one case in which set_subscription (0013) lets another
 * subscription replace a live tracked one. `from` grants a plan: null.
 */
export function siblingToFollow<T extends SubscriptionFields>(
  subs: readonly T[],
  from: Pick<SubscriptionFields, "id" | "status">,
): T | null {
  if (grantsPlanStatus(from.status)) return null;
  const live = pickLiveSibling(subs, from.id);
  if (!live) return null;
  if (isLiveStatus(from.status) && !grantsPlanStatus(live.status)) return null;
  return live;
}
