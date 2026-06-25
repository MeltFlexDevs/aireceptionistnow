/**
 * Server-side billing operations: the bridge between Stripe and Supabase. Every
 * write goes through Postgres SECURITY DEFINER functions invoked with the
 * service-role key, so the browser can never grant itself a subscription or
 * tamper with its billing state.
 *
 * The user id is always derived from a trusted source — the Supabase user
 * recorded on the Stripe customer / subscription metadata — never from the
 * browser.
 */
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BillingCycle, PlanId } from "@/lib/plans";

export type BillingRecord = {
  userId: string;
  customerId: string | null;
  subscriptionId: string | null;
  plan: PlanId | null;
  cycle: BillingCycle | null;
  status: string | null;
  currentPeriodEnd: string | null;
};

/**
 * The Stripe customer id stored for a user, or null if they have never started
 * checkout. Used so a returning subscriber reuses the same customer instead of
 * creating a duplicate.
 */
export async function getCustomerId(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("get_billing", { p_user: userId });
  if (error) throw new Error(`get_billing failed: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  return (row?.stripe_customer_id as string | undefined) ?? null;
}

/** Read a user's full billing row (returns null if none). */
export async function getBilling(userId: string): Promise<BillingRecord | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("get_billing", { p_user: userId });
  if (error) throw new Error(`get_billing failed: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    userId,
    customerId: (row.stripe_customer_id as string | null) ?? null,
    subscriptionId: (row.stripe_subscription_id as string | null) ?? null,
    plan: (row.plan as PlanId | null) ?? null,
    cycle: (row.billing_cycle as BillingCycle | null) ?? null,
    status: (row.status as string | null) ?? null,
    currentPeriodEnd: (row.current_period_end as string | null) ?? null,
  };
}

/** Map a Stripe customer back to the Supabase user that owns it. */
export async function getUserIdByCustomer(
  customerId: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("get_user_by_customer", {
    p_customer: customerId,
  });
  if (error) throw new Error(`get_user_by_customer failed: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  const id = row?.user_id ?? data;
  return typeof id === "string" && id ? id : null;
}

/** Persist the Stripe customer id for a user (called when checkout starts). */
export async function saveCustomerId(
  userId: string,
  customerId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("set_customer", {
    p_user: userId,
    p_customer: customerId,
  });
  if (error) throw new Error(`set_customer failed: ${error.message}`);
}

/** Record the user's current subscription state (plan, cycle, status, ids). */
export async function saveSubscription(params: {
  userId: string;
  customerId: string;
  subscriptionId: string | null;
  plan: PlanId | null;
  cycle: BillingCycle | null;
  status: string;
  currentPeriodEnd: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("set_subscription", {
    p_user: params.userId,
    p_customer: params.customerId,
    p_subscription: params.subscriptionId,
    p_plan: params.plan,
    p_cycle: params.cycle,
    p_status: params.status,
    p_current_period_end: params.currentPeriodEnd,
  });
  if (error) throw new Error(`set_subscription failed: ${error.message}`);
}

/**
 * Idempotency guard for webhook events. Returns true the first time an event id
 * is seen and false on every retry, so a subscription change is never applied
 * twice even if Stripe redelivers the event. Backed by a unique insert.
 */
export async function claimEvent(eventId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_stripe_event", {
    p_event_id: eventId,
  });
  if (error) throw new Error(`claim_stripe_event failed: ${error.message}`);
  return data === true;
}

/**
 * Release a previously-claimed event so a later Stripe retry can reprocess it.
 * Called when handling failed after the claim. Best-effort: a failure here is
 * only logged.
 */
export async function releaseEvent(eventId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("release_stripe_event", {
    p_event_id: eventId,
  });
  if (error)
    console.error(`[billing] release_stripe_event failed: ${error.message}`);
}
