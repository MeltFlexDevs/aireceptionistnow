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

export async function getCustomerId(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("get_billing", { p_user: userId });
  if (error) throw new Error(`get_billing failed: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  return (row?.stripe_customer_id as string | undefined) ?? null;
}

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

export async function claimEvent(eventId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_stripe_event", {
    p_event_id: eventId,
  });
  if (error) throw new Error(`claim_stripe_event failed: ${error.message}`);
  return data === true;
}

export async function releaseEvent(eventId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("release_stripe_event", {
    p_event_id: eventId,
  });
  if (error)
    console.error(`[billing] release_stripe_event failed: ${error.message}`);
}
