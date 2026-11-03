import type { BillingCycle, PlanId } from "@/lib/plans";
import { REVENUECAT_ENTITLEMENTS, productToPlan } from "./products";
import type { StoreEnvironment } from "./snapshot";

/**
 * Store events -> the user_billing row they should produce.
 *
 * Pure functions over the decoded (already signature-verified) payloads, so
 * the whole status table is unit tested without Apple or RevenueCat. The
 * routes only verify, resolve the user, and hand the result to
 * applyStoreUpdate; the precedence rules between providers live in SQL.
 */

/** The columns a store write sets. */
export interface BillingUpdate {
  status: "active" | "past_due" | "canceled" | "paused";
  plan: PlanId | null;
  cycle: BillingCycle | null;
  /** ISO instant, or null when nothing is running. */
  currentPeriodEnd: string | null;
  environment: StoreEnvironment | null;
  cancelAtPeriodEnd: boolean;
}

/** The fields of a decoded StoreKit / notification transaction we read. */
export interface AppleTransaction {
  productId?: string;
  /** Milliseconds since epoch (Apple's unit). */
  expiresDate?: number;
  revocationDate?: number;
  environment?: string;
}

/** The fields of a decoded renewal info we read. */
export interface AppleRenewalInfo {
  /** 0 = off (the user turned auto-renew off), 1 = on. */
  autoRenewStatus?: number;
  isInBillingRetryPeriod?: boolean;
  /** Milliseconds since epoch. */
  gracePeriodExpiresDate?: number;
}

function iso(ms: number | null | undefined): string | null {
  return typeof ms === "number" && Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}

function appleEnvironment(tx: AppleTransaction): StoreEnvironment {
  // The verifier only ever accepts Production and Sandbox, so anything that is
  // not Production was verified as Sandbox.
  return tx.environment === "Production" ? "Production" : "Sandbox";
}

/**
 * The stored row as an update, for the "unchanged" rows of the Apple table. A
 * status this module never writes (none today) is normalised by the web's
 * active/trialing rule so the result is always one we can write back.
 */
export function updateFromRecord(record: {
  status: string | null;
  plan: PlanId | null;
  cycle: BillingCycle | null;
  currentPeriodEnd: string | null;
  environment: StoreEnvironment | null;
  cancelAtPeriodEnd: boolean;
}): BillingUpdate {
  const known: BillingUpdate["status"][] = ["active", "past_due", "canceled", "paused"];
  const status = known.find((s) => s === record.status);
  return {
    status: status ?? (record.status === "trialing" ? "active" : "canceled"),
    plan: record.plan,
    cycle: record.cycle,
    currentPeriodEnd: record.currentPeriodEnd,
    environment: record.environment,
    cancelAtPeriodEnd: record.cancelAtPeriodEnd,
  };
}

/** The row for an ended subscription: plan gone, nothing running. */
export function canceledUpdate(environment: StoreEnvironment | null = null): BillingUpdate {
  return {
    status: "canceled",
    plan: null,
    cycle: null,
    currentPeriodEnd: null,
    environment,
    cancelAtPeriodEnd: false,
  };
}

/** Active on the transaction's product until it expires; null for a product we do not sell. */
function activeFromTransaction(tx: AppleTransaction): BillingUpdate | null {
  const product = productToPlan("apple", tx.productId);
  if (!product) return null;
  return {
    status: "active",
    plan: product.plan,
    cycle: product.cycle,
    currentPeriodEnd: iso(tx.expiresDate),
    environment: appleEnvironment(tx),
    cancelAtPeriodEnd: false,
  };
}

/**
 * activeFromTransaction while the period still runs, otherwise what the
 * transaction says on its own (grace, billing retry or canceled). Apple retries
 * a notification for up to three days, so a SUBSCRIBED / DID_RENEW can land
 * after the period ended - even after the EXPIRED that followed it - and must
 * not re-activate the plan with a period end in the past.
 */
function activeWhileRunning(tx: AppleTransaction, renewal: AppleRenewalInfo | null, now: Date): BillingUpdate | null {
  const active = activeFromTransaction(tx);
  if (!active) return null;
  return tx.expiresDate != null && tx.expiresDate > now.getTime()
    ? active
    : appleStateFromTransaction(tx, renewal, now);
}

/**
 * The row a transaction + renewal info implies on its own, with no memory of
 * what we stored: active while the period (or a grace period) runs, past_due
 * while Apple retries billing, canceled otherwise. Used for REFUND_REVERSED and
 * as the base of the "unchanged" rows when we hold no current row.
 */
export function appleStateFromTransaction(
  tx: AppleTransaction,
  renewal: AppleRenewalInfo | null,
  now: Date,
): BillingUpdate {
  const environment = appleEnvironment(tx);
  const product = productToPlan("apple", tx.productId);
  if (!product || tx.revocationDate != null) return canceledUpdate(environment);
  const t = now.getTime();
  const expires = tx.expiresDate ?? null;
  const base = {
    plan: product.plan,
    cycle: product.cycle,
    environment,
    cancelAtPeriodEnd: renewal?.autoRenewStatus === 0,
  };
  if (expires != null && expires > t) {
    return { ...base, status: "active", currentPeriodEnd: iso(expires) };
  }
  const grace = renewal?.gracePeriodExpiresDate ?? null;
  if (grace != null && grace > t) {
    return { ...base, status: "active", currentPeriodEnd: iso(grace) };
  }
  if (renewal?.isInBillingRetryPeriod) {
    return { ...base, status: "past_due", currentPeriodEnd: iso(expires) };
  }
  return canceledUpdate(environment);
}

/**
 * Apple does not promise order and retries a notification for up to three
 * days, so the EXPIRED of an old period can land after the DID_RENEW (or
 * SUBSCRIBED) that started the next one. The stored row is newer when it is
 * active and runs past both now and the end the event is about (its
 * transaction's expiry or grace date). A refund or revoke of the newest
 * transaction, or the end of grace, carries the stored end and still cancels.
 */
function outlivesEvent(
  current: BillingUpdate | null,
  tx: AppleTransaction,
  renewal: AppleRenewalInfo | null,
  now: Date,
): boolean {
  if (!current || current.status !== "active" || !current.currentPeriodEnd) return false;
  const eventEnd = Math.max(tx.expiresDate ?? 0, renewal?.gracePeriodExpiresDate ?? 0);
  return Date.parse(current.currentPeriodEnd) > Math.max(now.getTime(), eventEnd);
}

/**
 * App Store Server Notification v2 -> row update. Returns null when the
 * notification changes nothing we store (TEST, a downgrade that only applies
 * at the next renewal, price-increase consent, a late EXPIRED or REFUND for a
 * period the stored row already moved past, ...).
 *
 * `current` is the row this subscription already owns (same provider and
 * originalTransactionId), when we hold one: the "unchanged" rows of the table
 * keep it verbatim and only flip the flag the notification is about. Without
 * it the unchanged values are recomputed from the transaction, which carries
 * the same product and period Apple last billed.
 */
export function appleUpdate(
  notificationType: string | undefined,
  subtype: string | undefined,
  tx: AppleTransaction,
  renewal: AppleRenewalInfo | null,
  now: Date,
  current: BillingUpdate | null = null,
): BillingUpdate | null {
  const unchanged = (): BillingUpdate => current ?? appleStateFromTransaction(tx, renewal, now);

  switch (notificationType) {
    case "SUBSCRIBED":
    case "DID_RENEW":
    case "OFFER_REDEEMED":
      return activeWhileRunning(tx, renewal, now);

    case "DID_CHANGE_RENEWAL_STATUS":
      if (subtype === "AUTO_RENEW_DISABLED") return { ...unchanged(), cancelAtPeriodEnd: true };
      if (subtype === "AUTO_RENEW_ENABLED") return { ...unchanged(), cancelAtPeriodEnd: false };
      return null;

    case "DID_CHANGE_RENEWAL_PREF":
      // An upgrade takes effect immediately and the transaction already carries
      // the new product; a downgrade only applies at the next DID_RENEW.
      return subtype === "UPGRADE" ? activeWhileRunning(tx, renewal, now) : null;

    case "DID_FAIL_TO_RENEW": {
      const base = unchanged();
      if (subtype === "GRACE_PERIOD") {
        // Apple keeps the service running until the grace period ends.
        return {
          ...base,
          status: "active",
          currentPeriodEnd: iso(renewal?.gracePeriodExpiresDate) ?? base.currentPeriodEnd,
        };
      }
      return { ...base, status: "past_due" };
    }

    case "EXPIRED":
    case "GRACE_PERIOD_EXPIRED":
    case "REFUND":
    case "REVOKE":
      // A late event about a period the stored row already moved past changes nothing.
      if (outlivesEvent(current, tx, renewal, now)) return null;
      return canceledUpdate(appleEnvironment(tx));

    case "REFUND_REVERSED":
    case "RENEWAL_EXTENDED":
      // Apple reinstated (or extended) the subscription: whatever the
      // transaction says now is the truth.
      return appleStateFromTransaction(tx, renewal, now);

    case "TEST":
    default:
      return null;
  }
}

// ── RevenueCat (Google Play) ────────────────────────────────────────────────
// Events are never applied from the webhook payload: both the webhook and
// /api/mobile/billing/google/sync re-fetch the subscriber and run the same
// function, so one code path decides what a Play subscriber is entitled to.

/** GET /v1/subscribers/{id} -> subscriber.subscriptions[productId] (the fields we read). */
export interface RcSubscription {
  store?: string;
  /** ISO instants, null when not applicable. */
  expires_date?: string | null;
  grace_period_expires_date?: string | null;
  billing_issues_detected_at?: string | null;
  unsubscribe_detected_at?: string | null;
  refunded_at?: string | null;
  auto_resume_date?: string | null;
  is_sandbox?: boolean;
  /** Google Play base plan, when the product id does not carry it. */
  product_plan_identifier?: string;
}

/** subscriber.entitlements[id] (the fields we read). */
export interface RcEntitlement {
  /** `solo:monthly`, or the bare subscription id `solo` with the base plan below. */
  product_identifier?: string;
  product_plan_identifier?: string;
  expires_date?: string | null;
}

export interface RcSubscriber {
  entitlements?: Record<string, RcEntitlement | undefined>;
  subscriptions?: Record<string, RcSubscription | undefined>;
}

function ms(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

function isoOf(value: string | null | undefined): string | null {
  const t = ms(value);
  return t == null ? null : new Date(t).toISOString();
}

/**
 * The `<subscriptionId>:<basePlanId>` an entitlement was bought with. The
 * subscriber endpoint can report the two halves apart (`solo` and `monthly`),
 * so join them when the id has no base plan of its own.
 */
function playProductId(id: string, basePlan: string | undefined): string {
  return basePlan && !id.includes(":") ? `${id}:${basePlan}` : id;
}

/**
 * The update a RevenueCat subscriber implies for a Play Store entitlement, or
 * null when no `solo`/`team` entitlement is backed by a Play subscription at
 * all (never bought, or long expired). Callers decide what null means: the
 * sync route answers 402, the webhook records canceled.
 *
 * Rows of the table, in subscriber terms:
 *   INITIAL_PURCHASE / RENEWAL / UNCANCELLATION / PRODUCT_CHANGE
 *     expires_date in the future                       -> active, cancel false
 *   CANCELLATION (still in period)
 *     unsubscribe_detected_at set, period running      -> active, cancel true
 *   BILLING_ISSUE
 *     grace_period_expires_date in the future          -> active until the grace date
 *     otherwise                                        -> past_due
 *   EXPIRATION / refund (CANCELLATION reason CUSTOMER_SUPPORT)
 *     period over, or refunded_at set                  -> null (= canceled)
 *   SUBSCRIPTION_PAUSED
 *     period over, auto_resume_date in the future      -> paused until the resume date
 */
export function entitlementUpdate(subscriber: RcSubscriber, now: Date): BillingUpdate | null {
  const t = now.getTime();
  const candidates: BillingUpdate[] = [];
  const consider = (candidate: BillingUpdate) => candidates.push(candidate);

  for (const id of REVENUECAT_ENTITLEMENTS) {
    const ent = subscriber.entitlements?.[id];
    const productId = ent?.product_identifier;
    if (!productId) continue;
    const subs = subscriber.subscriptions ?? {};
    const sub = subs[productId] ?? subs[playProductId(productId, ent.product_plan_identifier)];
    if (!sub || sub.store !== "play_store") continue;
    const product = productToPlan(
      "google",
      playProductId(productId, ent.product_plan_identifier ?? sub.product_plan_identifier),
    );
    if (!product) continue;
    if (sub.refunded_at) continue;

    const base = {
      plan: product.plan,
      cycle: product.cycle,
      environment: (sub.is_sandbox ? "Sandbox" : "Production") as StoreEnvironment,
      cancelAtPeriodEnd: Boolean(sub.unsubscribe_detected_at),
    };
    const expires = ms(sub.expires_date);
    const running = expires == null || expires > t;

    if (sub.billing_issues_detected_at) {
      const grace = ms(sub.grace_period_expires_date);
      if (grace != null && grace > t) {
        consider({ ...base, status: "active", currentPeriodEnd: isoOf(sub.grace_period_expires_date) });
      } else if (running) {
        consider({ ...base, status: "active", currentPeriodEnd: isoOf(sub.expires_date) });
      } else {
        consider({ ...base, status: "past_due", currentPeriodEnd: isoOf(sub.expires_date) });
      }
      continue;
    }

    if (running) {
      consider({ ...base, status: "active", currentPeriodEnd: isoOf(sub.expires_date) });
      continue;
    }

    const resume = ms(sub.auto_resume_date);
    if (resume != null && resume > t) {
      consider({ ...base, status: "paused", currentPeriodEnd: isoOf(sub.auto_resume_date), cancelAtPeriodEnd: false });
    }
  }

  // Both entitlements can briefly coexist around a plan change: an active one
  // beats a lapsed one, and the later-running one wins among equals.
  const rank = (u: BillingUpdate) => (u.status === "active" ? 2 : 1);
  return candidates.reduce<BillingUpdate | null>((best, candidate) => {
    if (!best) return candidate;
    const later = (ms(candidate.currentPeriodEnd) ?? 0) > (ms(best.currentPeriodEnd) ?? 0);
    return rank(candidate) > rank(best) || (rank(candidate) === rank(best) && later) ? candidate : best;
  }, null);
}
