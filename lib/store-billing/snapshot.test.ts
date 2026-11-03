import assert from "node:assert/strict";
import { test } from "node:test";

import type { BillingRecord } from "@/lib/billing";
import { shouldSkipProvisioning } from "@/lib/dashboard/onboarding-profile";
import { checkoutBlock, grantsPlan, isActiveStore, isLiveStripe, isStoreSandbox, providerOf, toSnapshot } from "./snapshot";

const NOW = new Date("2026-09-28T12:00:00Z");
const FUTURE = new Date(NOW.getTime() + 30 * 86_400_000).toISOString();
const PAST = new Date(NOW.getTime() - 86_400_000).toISOString();

const record = (over: Partial<BillingRecord>): BillingRecord => ({
  userId: "user-1",
  customerId: null,
  subscriptionId: null,
  plan: null,
  cycle: null,
  status: null,
  currentPeriodEnd: null,
  provider: null,
  providerRef: null,
  environment: null,
  cancelAtPeriodEnd: false,
  ...over,
});

test("no row: nothing granted", () => {
  assert.deepEqual(toSnapshot(null), {
    provider: null,
    plan: null,
    cycle: null,
    status: null,
    active: false,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    environment: null,
    providerRef: null,
  });
});

test("a legacy comp grant is reported as provider 'comp'", () => {
  const row = record({ customerId: "comp:user-1", providerRef: "comp:user-1", status: "active", plan: "solo", cycle: "annual" });
  assert.equal(providerOf(row), "comp");
  const snap = toSnapshot(row);
  assert.equal(snap.provider, "comp");
  assert.equal(snap.active, true);
  assert.equal(snap.providerRef, null);
});

test("a legacy Stripe row is provider 'stripe' and never exposes the customer id", () => {
  const snap = toSnapshot(
    record({ customerId: "cus_123", providerRef: "cus_123", subscriptionId: "sub_1", status: "active", plan: "team", cycle: "monthly", currentPeriodEnd: FUTURE }),
  );
  assert.equal(snap.provider, "stripe");
  assert.equal(snap.providerRef, null);
  assert.equal(snap.environment, null);
  assert.equal(snap.active, true);
  assert.equal(snap.plan, "team");
});

test("an App Store row carries its ref, environment and renewal flag", () => {
  const snap = toSnapshot(
    record({
      provider: "apple",
      providerRef: "2000000123456789",
      environment: "Sandbox",
      status: "active",
      plan: "solo",
      cycle: "monthly",
      currentPeriodEnd: FUTURE,
      cancelAtPeriodEnd: true,
    }),
    NOW,
  );
  assert.deepEqual(snap, {
    provider: "apple",
    plan: "solo",
    cycle: "monthly",
    status: "active",
    active: true,
    currentPeriodEnd: FUTURE,
    cancelAtPeriodEnd: true,
    environment: "Sandbox",
    providerRef: "2000000123456789",
  });
});

test("inactive rows grant nothing", () => {
  assert.equal(toSnapshot(record({ provider: "apple", status: "canceled" })).active, false);
  assert.equal(toSnapshot(record({ provider: "google", status: "past_due", plan: "solo" })).active, false);
  // A status without a plan is not a grant either (same rule as getPlanContext).
  assert.equal(toSnapshot(record({ provider: "stripe", status: "active" })).active, false);
});

test("LIVE STRIPE: Stripe is still collecting, so a store purchase must be refused", () => {
  for (const status of ["active", "trialing", "past_due", "unpaid", "incomplete"]) {
    assert.equal(isLiveStripe(record({ provider: "stripe", status }), NOW), true, status);
    assert.equal(isLiveStripe(record({ provider: "stripe", status, currentPeriodEnd: FUTURE }), NOW), true, status);
  }
  for (const status of ["canceled", "incomplete_expired", null]) {
    assert.equal(isLiveStripe(record({ provider: "stripe", status }), NOW), false, String(status));
  }
  // The period has ended: Stripe is not billing any more.
  assert.equal(isLiveStripe(record({ provider: "stripe", status: "active", currentPeriodEnd: PAST }), NOW), false);
  // Legacy row without the provider column still counts as Stripe.
  assert.equal(isLiveStripe(record({ customerId: "cus_1", status: "active" }), NOW), true);
  // Other billers are not Stripe.
  assert.equal(isLiveStripe(record({ provider: "apple", status: "active" }), NOW), false);
  assert.equal(isLiveStripe(record({ customerId: "comp:user-1", status: "active" }), NOW), false);
  assert.equal(isLiveStripe(null, NOW), false);
});

test("a sandbox entitlement is a store row bought in Sandbox", () => {
  assert.equal(isStoreSandbox(record({ provider: "apple", environment: "Sandbox" })), true);
  assert.equal(isStoreSandbox(record({ provider: "google", environment: "Sandbox" })), true);
  assert.equal(isStoreSandbox(record({ provider: "apple", environment: "Production" })), false);
  assert.equal(isStoreSandbox(record({ provider: "stripe", environment: "Sandbox" })), false);
  assert.equal(isStoreSandbox(null), false);
});

test("an active store subscription blocks Stripe checkout", () => {
  assert.equal(isActiveStore(record({ provider: "google", status: "active", currentPeriodEnd: FUTURE }), NOW), true);
  assert.equal(isActiveStore(record({ provider: "apple", status: "active" }), NOW), true);
  assert.equal(isActiveStore(record({ provider: "apple", status: "active", currentPeriodEnd: PAST }), NOW), false);
  assert.equal(isActiveStore(record({ provider: "google", status: "canceled" }), NOW), false);
  assert.equal(isActiveStore(record({ provider: "stripe", status: "active" }), NOW), false);
});

// Lives here because lib/dashboard/provision.ts cannot be loaded under
// node:test (its import graph reaches `server-only`); the decision itself is
// a pure helper next to the onboarding profile types.
test("provisioning stands down for an account that already owns assistants", () => {
  assert.equal(shouldSkipProvisioning({}, 1), true);
  assert.equal(shouldSkipProvisioning({ orgId: "org" }, 3), true);
  // A checkpointed assistant is this run's own: a resumed partial run proceeds.
  assert.equal(shouldSkipProvisioning({ assistantId: "asst" }, 1), false);
  assert.equal(shouldSkipProvisioning({}, 0), false);
});

test("checkout guard: a live Stripe plan goes to the billing portal", () => {
  for (const status of ["active", "trialing", "past_due", "unpaid", "incomplete"]) {
    const live = record({ provider: "stripe", customerId: "cus_1", status, plan: "solo", currentPeriodEnd: FUTURE });
    assert.equal(checkoutBlock(live, NOW), "portal", status);
  }
  // A row written before 0011 has no provider: derived from the customer id.
  assert.equal(checkoutBlock(record({ customerId: "cus_1", status: "active", plan: "solo" }), NOW), "portal");
});

test("checkout guard: an active store plan is managed on the phone", () => {
  const store = record({ provider: "apple", providerRef: "otx-1", status: "active", plan: "solo", currentPeriodEnd: FUTURE });
  assert.equal(checkoutBlock(store, NOW), "store");
});

test("checkout guard: no live plan lets checkout go on", () => {
  assert.equal(checkoutBlock(null, NOW), null);
  assert.equal(checkoutBlock(record({ provider: "stripe", customerId: "cus_1", status: "canceled" }), NOW), null);
  assert.equal(checkoutBlock(record({ provider: "stripe", customerId: "cus_1", status: "incomplete_expired" }), NOW), null);
  assert.equal(
    checkoutBlock(record({ provider: "stripe", customerId: "cus_1", status: "active", plan: "solo", currentPeriodEnd: PAST }), NOW),
    null,
  );
  // A Stripe customer without a subscription (checkout was abandoned).
  assert.equal(checkoutBlock(record({ provider: "stripe", customerId: "cus_1" }), NOW), null);
  // A comp grant never reaches Stripe: the comp path in the route handles it.
  assert.equal(
    checkoutBlock(record({ provider: "comp", customerId: "comp:user-1", status: "active", plan: "team" }), NOW),
    null,
  );
});

test("a store row past its period end grants no plan", () => {
  const apple = (currentPeriodEnd: string | null) =>
    record({ provider: "apple", providerRef: "otx-1", status: "active", plan: "solo", currentPeriodEnd });
  // A missed expiry event must not keep the plan once the period has ended.
  assert.equal(toSnapshot(apple(PAST), NOW).active, false);
  assert.equal(toSnapshot(apple(FUTURE), NOW).active, true);
  // No end stored: open, the same rule as isActiveStore.
  assert.equal(toSnapshot(apple(null), NOW).active, true);
  const google = record({ provider: "google", providerRef: "rc-1", status: "active", plan: "team", currentPeriodEnd: PAST });
  assert.equal(toSnapshot(google, NOW).active, false);
  // Stripe rows keep the status rule: Stripe's webhook ends them.
  const stripe = record({ provider: "stripe", customerId: "cus_1", status: "active", plan: "solo", currentPeriodEnd: PAST });
  assert.equal(toSnapshot(stripe, NOW).active, true);
  // getPlanContext uses the same predicate.
  assert.equal(grantsPlan(apple(PAST), NOW), false);
  assert.equal(grantsPlan(apple(FUTURE), NOW), true);
  assert.equal(grantsPlan(google, NOW), false);
  assert.equal(grantsPlan(stripe, NOW), true);
  assert.equal(grantsPlan(record({ customerId: "comp:user-1", status: "active", plan: "team" }), NOW), true);
  assert.equal(grantsPlan(record({ provider: "apple", status: "active", currentPeriodEnd: FUTURE }), NOW), false);
  assert.equal(grantsPlan(null, NOW), false);
});
