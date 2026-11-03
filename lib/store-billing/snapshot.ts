import type { BillingProvider, BillingRecord } from "@/lib/billing";
import type { BillingCycle, PlanId } from "@/lib/plans";

/**
 * Pure views over a user_billing row: the snapshot the app reads, and the two
 * predicates the precedence rules hinge on. No server imports so they are unit
 * tested directly (lib/billing.ts re-exports the predicates for server code).
 */

export type StoreEnvironment = "Production" | "Sandbox";

/** What /api/mobile/billing serves - the app's usePaywall reads exactly this. */
export interface BillingSnapshot {
  provider: BillingProvider | null;
  plan: PlanId | null;
  cycle: BillingCycle | null;
  status: string | null;
  active: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  environment: StoreEnvironment | null;
  /** Apple originalTransactionId / RevenueCat app user id. Never a Stripe id. */
  providerRef: string | null;
}

/** The web's gate: active or trialing. grantsPlan adds the plan and store period checks. */
export function isActiveStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

/**
 * The provider of a row, deriving it for rows written before migration 0011
 * set the column: a comp grant carries the synthetic 'comp:' customer id, and
 * anything else with a customer id came from Stripe.
 */
export function providerOf(
  record: Pick<BillingRecord, "provider" | "customerId"> | null | undefined,
): BillingProvider | null {
  if (!record) return null;
  if (record.provider) return record.provider;
  if (!record.customerId) return null;
  return record.customerId.startsWith("comp:") ? "comp" : "stripe";
}

function periodOpen(currentPeriodEnd: string | null, now: Date): boolean {
  if (!currentPeriodEnd) return true;
  const end = Date.parse(currentPeriodEnd);
  return !Number.isFinite(end) || end > now.getTime();
}

/**
 * LIVE STRIPE rule: Stripe is still the biller of this account. Shared word
 * for word with set_store_subscription (0011) and the app's usePaywall, so a
 * store purchase is refused (409 stripe_active) exactly when Stripe would keep
 * charging. past_due / unpaid / incomplete count as live because Stripe is
 * still trying to collect; canceled and incomplete_expired do not.
 */
export function isLiveStripe(
  record: BillingRecord | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!record || providerOf(record) !== "stripe") return false;
  const status = record.status ?? "";
  if (!["active", "trialing", "past_due", "unpaid", "incomplete"].includes(status)) return false;
  return periodOpen(record.currentPeriodEnd, now);
}

/** A store entitlement bought in Apple's / Google's sandbox (App Review, TestFlight). */
export function isStoreSandbox(record: BillingRecord | null | undefined): boolean {
  if (!record) return false;
  const provider = providerOf(record);
  return (provider === "apple" || provider === "google") && record.environment === "Sandbox";
}

/** A store entitlement that currently grants a plan. */
export function isActiveStore(
  record: BillingRecord | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!record) return false;
  const provider = providerOf(record);
  if (provider !== "apple" && provider !== "google") return false;
  return isActiveStatus(record.status) && periodOpen(record.currentPeriodEnd, now);
}

/**
 * Whether a row grants its plan: the one rule the app (toSnapshot) and the
 * dashboard (getPlanContext) share. Active or trialing with a plan set, and an
 * App Store / Play row only while its period runs, so a missed expiry event
 * (a dropped notification, a RevenueCat outage) does not keep paid features
 * on. Stripe rows keep the status rule (Stripe's webhook ends them), and comp
 * grants do not expire.
 */
export function grantsPlan(
  record: BillingRecord | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!record || !isActiveStatus(record.status) || !record.plan) return false;
  const provider = providerOf(record);
  if (provider !== "apple" && provider !== "google") return true;
  return periodOpen(record.currentPeriodEnd, now);
}

/**
 * Stripe checkout guard, one biller per account. 'store': an App Store / Play
 * subscription grants the plan and is managed on the phone. 'portal': Stripe
 * still bills this account (LIVE STRIPE rule), so a plan change goes through
 * the Billing Portal; a second checkout would start a second subscription next
 * to the first. null: checkout may go on.
 */
export function checkoutBlock(
  record: BillingRecord | null | undefined,
  now: Date = new Date(),
): "store" | "portal" | null {
  if (isActiveStore(record, now)) return "store";
  if (isLiveStripe(record, now)) return "portal";
  return null;
}

export function toSnapshot(record: BillingRecord | null | undefined, now: Date = new Date()): BillingSnapshot {
  if (!record) {
    return {
      provider: null,
      plan: null,
      cycle: null,
      status: null,
      active: false,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      environment: null,
      providerRef: null,
    };
  }
  const provider = providerOf(record);
  const store = provider === "apple" || provider === "google";
  return {
    provider,
    plan: record.plan,
    cycle: record.cycle,
    status: record.status,
    // Same rule as getPlanContext (grantsPlan): no plan, or a store period
    // that has ended, grants nothing.
    active: grantsPlan(record, now),
    currentPeriodEnd: record.currentPeriodEnd,
    cancelAtPeriodEnd: record.cancelAtPeriodEnd,
    environment: store ? record.environment : null,
    providerRef: store ? record.providerRef : null,
  };
}
