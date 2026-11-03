import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BillingCycle, PlanId } from "@/lib/plans";
import type { BillingUpdate } from "@/lib/store-billing/status";
import type { StoreProvider } from "@/lib/store-billing/products";
import { providerOf, type StoreEnvironment } from "@/lib/store-billing/snapshot";
import { toClaimState, type ClaimState } from "@/lib/billing-claim";

export { checkoutBlock, isLiveStripe, isStoreSandbox } from "@/lib/store-billing/snapshot";
export { claimConflictResponse } from "@/lib/billing-claim";

export type BillingProvider = "stripe" | "apple" | "google" | "comp";

export type BillingRecord = {
  userId: string;
  customerId: string | null;
  subscriptionId: string | null;
  plan: PlanId | null;
  cycle: BillingCycle | null;
  status: string | null;
  currentPeriodEnd: string | null;
  /** Who bills this row. Derived for rows older than migration 0011. */
  provider: BillingProvider | null;
  /** Apple originalTransactionId / RevenueCat app user id / Stripe customer id. */
  providerRef: string | null;
  /** Store purchases only: 'Sandbox' for App Review / TestFlight / test tracks. */
  environment: StoreEnvironment | null;
  cancelAtPeriodEnd: boolean;
};

/** A Postgres error from a billing RPC, with the SQLSTATE preserved. */
export class BillingRpcError extends Error {
  constructor(
    message: string,
    readonly code: string | undefined,
  ) {
    super(message);
    this.name = "BillingRpcError";
  }
}

/** A store write was refused because Stripe still bills this account. */
export class StripeActiveError extends Error {
  constructor() {
    super("stripe_active");
    this.name = "StripeActiveError";
  }
}

/** A Stripe write was refused because an App Store / Play subscription is active. */
export class StoreActiveError extends Error {
  constructor() {
    super("store_active");
    this.name = "StoreActiveError";
  }
}

/** The store subscription is already bound to a different account. */
export class OtherAccountError extends Error {
  constructor() {
    super("other_account");
    this.name = "OtherAccountError";
  }
}

/** Apple / RevenueCat credentials are missing on this deployment. */
export class BillingNotConfigured extends Error {
  constructor(what: string) {
    super(`Store billing is not configured: ${what}`);
    this.name = "BillingNotConfigured";
  }
}

type Row = Record<string, unknown>;

function rowToRecord(userId: string, row: Row): BillingRecord {
  const partial = {
    provider: (row.provider as BillingProvider | null) ?? null,
    customerId: (row.stripe_customer_id as string | null) ?? null,
  };
  const environment = row.environment;
  return {
    userId,
    customerId: partial.customerId,
    subscriptionId: (row.stripe_subscription_id as string | null) ?? null,
    plan: (row.plan as PlanId | null) ?? null,
    cycle: (row.billing_cycle as BillingCycle | null) ?? null,
    status: (row.status as string | null) ?? null,
    currentPeriodEnd: (row.current_period_end as string | null) ?? null,
    provider: providerOf(partial),
    providerRef: (row.provider_ref as string | null) ?? partial.customerId,
    environment: environment === "Production" || environment === "Sandbox" ? environment : null,
    cancelAtPeriodEnd: row.cancel_at_period_end === true,
  };
}

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
  return rowToRecord(userId, row as Row);
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

/** The account a store subscription is bound to (Apple originalTransactionId / RC app user id). */
export async function getUserIdByProviderRef(
  provider: StoreProvider,
  ref: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("get_user_by_provider_ref", {
    p_provider: provider,
    p_ref: ref,
  });
  if (error) throw new Error(`get_user_by_provider_ref failed: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  const id = row?.user_id ?? data;
  return typeof id === "string" && id ? id : null;
}

/**
 * Whether an auth user with this id exists. Webhooks resolve users from ids
 * the store hands back (appAccountToken, RevenueCat app user id), which may
 * belong to a deleted account or be garbage.
 */
export async function userExists(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) {
    if (error.status === 404 || /not found/i.test(error.message)) return false;
    throw new Error(`getUserById failed: ${error.message}`);
  }
  return Boolean(data?.user);
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
  /** Stripe's cancel-at-period-end state (see cancelsAtPeriodEnd). Omitted means false. */
  cancelAtPeriodEnd?: boolean;
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
    p_cancel_at_period_end: params.cancelAtPeriodEnd ?? false,
  });
  if (error) {
    // Raised by the SQL guard: an active App Store / Play row is never
    // overwritten by Stripe.
    if (error.message === "store_active") throw new StoreActiveError();
    throw new BillingRpcError(`set_subscription failed: ${error.message}`, error.code);
  }
}

/**
 * A store write. cancelAtPeriodEnd null keeps the stored flag when the row is
 * the same store subscription (same provider and provider_ref), else false
 * (0014). The Apple verify route passes null: a signed transaction carries no
 * auto-renew state.
 */
export type StoreWrite = Omit<BillingUpdate, "cancelAtPeriodEnd"> & {
  cancelAtPeriodEnd: boolean | null;
};

/** Upsert a store entitlement. See set_store_subscription (0011) for the precedence rules. */
export async function saveStoreSubscription(params: {
  userId: string;
  provider: StoreProvider;
  providerRef: string;
  update: StoreWrite;
}): Promise<void> {
  const admin = createAdminClient();
  const { update } = params;
  const { error } = await admin.rpc("set_store_subscription", {
    p_user: params.userId,
    p_provider: params.provider,
    p_provider_ref: params.providerRef,
    p_plan: update.plan,
    p_cycle: update.cycle,
    p_status: update.status,
    p_current_period_end: update.currentPeriodEnd,
    p_environment: update.environment,
    p_cancel_at_period_end: update.cancelAtPeriodEnd,
  });
  if (error) {
    if (error.message === "stripe_active") throw new StripeActiveError();
    if (error.message === "other_account") throw new OtherAccountError();
    throw new BillingRpcError(`set_store_subscription failed: ${error.message}`, error.code);
  }
}

/** Idempotency claim for a Stripe event (0014): 'claimed', 'processed' or 'busy'. */
export async function claimEvent(eventId: string): Promise<ClaimState> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_stripe_event", {
    p_event_id: eventId,
  });
  if (error) throw new Error(`claim_stripe_event failed: ${error.message}`);
  return toClaimState(data, "claim_stripe_event");
}

export async function releaseEvent(eventId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("release_stripe_event", {
    p_event_id: eventId,
  });
  if (error)
    console.error(`[billing] release_stripe_event failed: ${error.message}`);
}

/** Mark a claimed Stripe event as handled, so retries skip it (0014). Logs and never throws. */
export async function markStripeEventProcessed(eventId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("mark_stripe_event_processed", {
    p_event_id: eventId,
  });
  if (error)
    console.error(`[billing] mark_stripe_event_processed failed: ${error.message}`);
}

export type BillingEventSource = "asn" | "rc";

/**
 * Idempotency claim for a store webhook delivery (0014): 'claimed',
 * 'processed', or 'busy' when another run claimed it in the last 5 minutes.
 */
export async function claimBillingEvent(
  source: BillingEventSource,
  id: string,
): Promise<ClaimState> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_billing_event", {
    p_source: source,
    p_id: id,
  });
  if (error) throw new Error(`claim_billing_event failed: ${error.message}`);
  return toClaimState(data, "claim_billing_event");
}

export async function releaseBillingEvent(
  source: BillingEventSource,
  id: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("release_billing_event", {
    p_source: source,
    p_id: id,
  });
  if (error)
    console.error(`[billing] release_billing_event failed: ${error.message}`);
}

/** Mark a claimed store webhook delivery as handled, so retries skip it (0014). Logs and never throws. */
export async function markBillingEventProcessed(
  source: BillingEventSource,
  id: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("mark_billing_event_processed", {
    p_source: source,
    p_id: id,
  });
  if (error)
    console.error(`[billing] mark_billing_event_processed failed: ${error.message}`);
}
