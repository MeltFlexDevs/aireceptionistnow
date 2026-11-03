import assert from "node:assert/strict";
import { test } from "node:test";

import {
  appleStateFromTransaction,
  appleUpdate,
  canceledUpdate,
  entitlementUpdate,
  updateFromRecord,
  type AppleTransaction,
  type BillingUpdate,
  type RcSubscriber,
  type RcSubscription,
} from "./status";

const NOW = new Date("2026-09-28T12:00:00Z");
const DAY = 86_400_000;
const FUTURE = NOW.getTime() + 30 * DAY;
const PAST = NOW.getTime() - DAY;
const iso = (ms: number) => new Date(ms).toISOString();

const SOLO_MONTHLY = "com.aireceptionistnow.app.solo.monthly";
const TEAM_ANNUAL = "com.aireceptionistnow.app.team.annual";

const tx = (over: Partial<AppleTransaction> = {}): AppleTransaction => ({
  productId: SOLO_MONTHLY,
  expiresDate: FUTURE,
  environment: "Production",
  ...over,
});

const ACTIVE_SOLO: BillingUpdate = {
  status: "active",
  plan: "solo",
  cycle: "monthly",
  currentPeriodEnd: iso(FUTURE),
  environment: "Production",
  cancelAtPeriodEnd: false,
};

// What we already hold for this subscription - deliberately different from the
// transaction so "unchanged" is observable.
const CURRENT: BillingUpdate = {
  status: "active",
  plan: "team",
  cycle: "annual",
  currentPeriodEnd: iso(FUTURE + 10 * DAY),
  environment: "Production",
  cancelAtPeriodEnd: false,
};

// ── Apple ───────────────────────────────────────────────────────────────────

test("SUBSCRIBED / DID_RENEW / OFFER_REDEEMED: active on the product until it expires", () => {
  for (const type of ["SUBSCRIBED", "DID_RENEW", "OFFER_REDEEMED"]) {
    assert.deepEqual(appleUpdate(type, "INITIAL_BUY", tx(), null, NOW, CURRENT), ACTIVE_SOLO, type);
  }
  assert.equal(
    appleUpdate("SUBSCRIBED", undefined, tx({ environment: "Sandbox" }), null, NOW)?.environment,
    "Sandbox",
  );
});

test("SUBSCRIBED / DID_RENEW / OFFER_REDEEMED delivered after the period ended never re-activate", () => {
  const expired = tx({ expiresDate: PAST });
  for (const type of ["SUBSCRIBED", "DID_RENEW", "OFFER_REDEEMED"]) {
    assert.deepEqual(appleUpdate(type, undefined, expired, null, NOW, CURRENT), canceledUpdate("Production"), type);
  }
  // Still in billing retry: past_due rather than canceled.
  assert.equal(
    appleUpdate("DID_RENEW", undefined, expired, { isInBillingRetryPeriod: true }, NOW)?.status,
    "past_due",
  );
  // A grace period keeps it active until the grace date.
  assert.equal(
    appleUpdate("DID_RENEW", undefined, expired, { gracePeriodExpiresDate: FUTURE }, NOW)?.currentPeriodEnd,
    iso(FUTURE),
  );
  // A late UPGRADE is the same story.
  assert.deepEqual(appleUpdate("DID_CHANGE_RENEWAL_PREF", "UPGRADE", expired, null, NOW), canceledUpdate("Production"));
  // No expiry at all (never the case for a subscription) is not "running".
  assert.equal(appleUpdate("SUBSCRIBED", undefined, tx({ expiresDate: undefined }), null, NOW)?.status, "canceled");
});

test("a product we do not sell never activates a plan", () => {
  assert.equal(appleUpdate("SUBSCRIBED", undefined, tx({ productId: "com.example.x" }), null, NOW), null);
  assert.equal(
    appleUpdate("SUBSCRIBED", undefined, tx({ productId: "com.example.x", expiresDate: PAST }), null, NOW),
    null,
  );
});

test("DID_CHANGE_RENEWAL_STATUS only flips cancel_at_period_end", () => {
  assert.deepEqual(appleUpdate("DID_CHANGE_RENEWAL_STATUS", "AUTO_RENEW_DISABLED", tx(), null, NOW, CURRENT), {
    ...CURRENT,
    cancelAtPeriodEnd: true,
  });
  assert.deepEqual(
    appleUpdate("DID_CHANGE_RENEWAL_STATUS", "AUTO_RENEW_ENABLED", tx(), null, NOW, {
      ...CURRENT,
      cancelAtPeriodEnd: true,
    }),
    CURRENT,
  );
  assert.equal(appleUpdate("DID_CHANGE_RENEWAL_STATUS", "OTHER", tx(), null, NOW, CURRENT), null);
});

test("without a stored row, 'unchanged' is recomputed from the transaction", () => {
  assert.deepEqual(appleUpdate("DID_CHANGE_RENEWAL_STATUS", "AUTO_RENEW_DISABLED", tx(), null, NOW), {
    ...ACTIVE_SOLO,
    cancelAtPeriodEnd: true,
  });
});

test("DID_CHANGE_RENEWAL_PREF: an upgrade applies now, a downgrade waits for DID_RENEW", () => {
  assert.deepEqual(
    appleUpdate("DID_CHANGE_RENEWAL_PREF", "UPGRADE", tx({ productId: TEAM_ANNUAL }), null, NOW, CURRENT),
    { ...ACTIVE_SOLO, plan: "team", cycle: "annual" },
  );
  assert.equal(appleUpdate("DID_CHANGE_RENEWAL_PREF", "DOWNGRADE", tx(), null, NOW, CURRENT), null);
});

test("DID_FAIL_TO_RENEW with GRACE_PERIOD stays active until the grace date", () => {
  const grace = NOW.getTime() + 16 * DAY;
  assert.deepEqual(
    appleUpdate("DID_FAIL_TO_RENEW", "GRACE_PERIOD", tx(), { gracePeriodExpiresDate: grace }, NOW, CURRENT),
    { ...CURRENT, status: "active", currentPeriodEnd: iso(grace) },
  );
});

test("DID_FAIL_TO_RENEW without a grace period is past_due, everything else unchanged", () => {
  assert.deepEqual(appleUpdate("DID_FAIL_TO_RENEW", undefined, tx(), { isInBillingRetryPeriod: true }, NOW, CURRENT), {
    ...CURRENT,
    status: "past_due",
  });
});

test("EXPIRED / GRACE_PERIOD_EXPIRED / REFUND / REVOKE end the plan", () => {
  // The period the event is about has already ended (an on-time EXPIRED).
  const ended: BillingUpdate = { ...ACTIVE_SOLO, currentPeriodEnd: iso(PAST) };
  for (const type of ["EXPIRED", "GRACE_PERIOD_EXPIRED", "REFUND", "REVOKE"]) {
    // No stored row: nothing to compare with.
    assert.deepEqual(appleUpdate(type, "VOLUNTARY", tx(), null, NOW), canceledUpdate("Production"), type);
    // The stored row ends where the event's transaction ends: it is about the current period.
    assert.deepEqual(appleUpdate(type, "VOLUNTARY", tx(), null, NOW, ACTIVE_SOLO), canceledUpdate("Production"), type);
    assert.deepEqual(
      appleUpdate(type, "VOLUNTARY", tx({ expiresDate: PAST }), null, NOW, ended),
      canceledUpdate("Production"),
      type,
    );
  }
  assert.deepEqual(canceledUpdate(), {
    status: "canceled",
    plan: null,
    cycle: null,
    currentPeriodEnd: null,
    environment: null,
    cancelAtPeriodEnd: false,
  });
});

test("a late EXPIRED / GRACE_PERIOD_EXPIRED / REFUND / REVOKE for an older period keeps the renewed row", () => {
  // DID_RENEW already stored the next period (ends FUTURE). The event is about
  // the period that ended yesterday and arrives late: Apple does not promise order.
  for (const type of ["EXPIRED", "GRACE_PERIOD_EXPIRED", "REFUND", "REVOKE"]) {
    assert.equal(appleUpdate(type, "VOLUNTARY", tx({ expiresDate: PAST }), null, NOW, ACTIVE_SOLO), null, type);
  }
  // A refund or revoke of the newest transaction carries the stored end: it still cancels.
  const refunded = tx({ revocationDate: NOW.getTime() - 60_000 });
  assert.deepEqual(appleUpdate("REFUND", undefined, refunded, null, NOW, ACTIVE_SOLO), canceledUpdate("Production"));
  assert.deepEqual(appleUpdate("REVOKE", undefined, refunded, null, NOW, ACTIVE_SOLO), canceledUpdate("Production"));
  // The end of grace carries the stored grace date, so it cancels even when our
  // clock is a minute behind Apple's.
  const grace = NOW.getTime() + 60_000;
  const inGrace: BillingUpdate = { ...ACTIVE_SOLO, currentPeriodEnd: iso(grace) };
  assert.deepEqual(
    appleUpdate("GRACE_PERIOD_EXPIRED", undefined, tx({ expiresDate: PAST }), { gracePeriodExpiresDate: grace }, NOW, inGrace),
    canceledUpdate("Production"),
  );
  // Only an active stored row wins: the end of billing retry (past_due) still cancels.
  const retrying: BillingUpdate = { ...ACTIVE_SOLO, status: "past_due" };
  assert.deepEqual(
    appleUpdate("EXPIRED", "BILLING_RETRY", tx({ expiresDate: PAST }), null, NOW, retrying),
    canceledUpdate("Production"),
  );
  // No stored end: nothing shows the row is newer, so the event cancels.
  const noEnd: BillingUpdate = { ...ACTIVE_SOLO, currentPeriodEnd: null };
  assert.deepEqual(
    appleUpdate("EXPIRED", "VOLUNTARY", tx({ expiresDate: PAST }), null, NOW, noEnd),
    canceledUpdate("Production"),
  );
});

test("REFUND_REVERSED recomputes from the transaction", () => {
  assert.deepEqual(appleUpdate("REFUND_REVERSED", undefined, tx(), null, NOW), ACTIVE_SOLO);
  assert.deepEqual(
    appleUpdate("REFUND_REVERSED", undefined, tx({ expiresDate: PAST }), null, NOW),
    canceledUpdate("Production"),
  );
});

test("TEST and notifications we do not model are no-ops", () => {
  assert.equal(appleUpdate("TEST", undefined, tx(), null, NOW, CURRENT), null);
  assert.equal(appleUpdate("PRICE_INCREASE", "PENDING", tx(), null, NOW, CURRENT), null);
  assert.equal(appleUpdate(undefined, undefined, tx(), null, NOW, CURRENT), null);
});

test("appleStateFromTransaction: revoked, grace, billing retry and auto-renew off", () => {
  assert.deepEqual(appleStateFromTransaction(tx({ revocationDate: PAST }), null, NOW), canceledUpdate("Production"));
  const grace = NOW.getTime() + 5 * DAY;
  assert.deepEqual(
    appleStateFromTransaction(tx({ expiresDate: PAST }), { gracePeriodExpiresDate: grace }, NOW),
    { ...ACTIVE_SOLO, currentPeriodEnd: iso(grace) },
  );
  assert.deepEqual(
    appleStateFromTransaction(tx({ expiresDate: PAST }), { isInBillingRetryPeriod: true }, NOW),
    { ...ACTIVE_SOLO, status: "past_due", currentPeriodEnd: iso(PAST) },
  );
  assert.deepEqual(appleStateFromTransaction(tx(), { autoRenewStatus: 0 }, NOW), {
    ...ACTIVE_SOLO,
    cancelAtPeriodEnd: true,
  });
  assert.deepEqual(appleStateFromTransaction(tx({ expiresDate: PAST }), null, NOW), canceledUpdate("Production"));
});

test("updateFromRecord carries a stored row over and normalises foreign statuses", () => {
  const row = {
    status: "active",
    plan: "team" as const,
    cycle: "annual" as const,
    currentPeriodEnd: iso(FUTURE),
    environment: "Sandbox" as const,
    cancelAtPeriodEnd: true,
  };
  assert.deepEqual(updateFromRecord(row), row);
  assert.equal(updateFromRecord({ ...row, status: "trialing" }).status, "active");
  assert.equal(updateFromRecord({ ...row, status: "incomplete_expired" }).status, "canceled");
});

// ── RevenueCat (Google Play) ────────────────────────────────────────────────

const play = (over: Partial<RcSubscription> = {}): RcSubscription => ({
  store: "play_store",
  expires_date: iso(FUTURE),
  is_sandbox: false,
  ...over,
});

const subscriber = (
  entries: Array<{ entitlement: "solo" | "team"; product: string; sub: RcSubscription }>,
): RcSubscriber => ({
  entitlements: Object.fromEntries(
    entries.map((e) => [e.entitlement, { product_identifier: e.product, expires_date: e.sub.expires_date }]),
  ),
  subscriptions: Object.fromEntries(entries.map((e) => [e.product, e.sub])),
});

const solo = (sub: RcSubscription) => subscriber([{ entitlement: "solo", product: "solo:monthly", sub }]);

const RC_ACTIVE_SOLO: BillingUpdate = {
  status: "active",
  plan: "solo",
  cycle: "monthly",
  currentPeriodEnd: iso(FUTURE),
  environment: "Production",
  cancelAtPeriodEnd: false,
};

test("RC INITIAL_PURCHASE / RENEWAL / UNCANCELLATION / PRODUCT_CHANGE: active on the product until it expires", () => {
  assert.deepEqual(entitlementUpdate(solo(play()), NOW), RC_ACTIVE_SOLO);
  assert.equal(entitlementUpdate(solo(play({ is_sandbox: true })), NOW)?.environment, "Sandbox");
  const changed = subscriber([{ entitlement: "team", product: "team:annual", sub: play() }]);
  assert.deepEqual(entitlementUpdate(changed, NOW), { ...RC_ACTIVE_SOLO, plan: "team", cycle: "annual" });
});

test("RC CANCELLATION while the period runs: active with cancel_at_period_end", () => {
  assert.deepEqual(entitlementUpdate(solo(play({ unsubscribe_detected_at: iso(PAST) })), NOW), {
    ...RC_ACTIVE_SOLO,
    cancelAtPeriodEnd: true,
  });
});

test("RC BILLING_ISSUE: active until the grace date, past_due once it is gone", () => {
  const grace = NOW.getTime() + 7 * DAY;
  assert.deepEqual(
    entitlementUpdate(
      solo(play({ billing_issues_detected_at: iso(PAST), expires_date: iso(PAST), grace_period_expires_date: iso(grace) })),
      NOW,
    ),
    { ...RC_ACTIVE_SOLO, currentPeriodEnd: iso(grace) },
  );
  assert.deepEqual(
    entitlementUpdate(solo(play({ billing_issues_detected_at: iso(PAST), expires_date: iso(PAST) })), NOW),
    { ...RC_ACTIVE_SOLO, status: "past_due", currentPeriodEnd: iso(PAST) },
  );
});

test("RC EXPIRATION and a refund leave no entitlement (the caller records canceled)", () => {
  assert.equal(entitlementUpdate(solo(play({ expires_date: iso(PAST) })), NOW), null);
  assert.equal(entitlementUpdate(solo(play({ refunded_at: iso(PAST) })), NOW), null);
  assert.equal(entitlementUpdate({}, NOW), null);
});

test("RC SUBSCRIPTION_PAUSED: paused until the resume date", () => {
  const resume = NOW.getTime() + 20 * DAY;
  assert.deepEqual(entitlementUpdate(solo(play({ expires_date: iso(PAST), auto_resume_date: iso(resume) })), NOW), {
    ...RC_ACTIVE_SOLO,
    status: "paused",
    currentPeriodEnd: iso(resume),
  });
});

test("only Play Store subscriptions on products we sell count", () => {
  assert.equal(entitlementUpdate(solo(play({ store: "app_store" })), NOW), null);
  const unknown = subscriber([{ entitlement: "solo", product: "legacy:plan", sub: play() }]);
  assert.equal(entitlementUpdate(unknown, NOW), null);
});

test("with two entitlements the active, later-running one wins", () => {
  const both = subscriber([
    { entitlement: "solo", product: "solo:monthly", sub: play({ expires_date: iso(PAST) }) },
    { entitlement: "team", product: "team:monthly", sub: play() },
  ]);
  assert.equal(entitlementUpdate(both, NOW)?.plan, "team");
});

test("RC subscribers that split a Play product into subscription id and base plan count too", () => {
  // GET /v1/subscribers reports a base-plan product as product_identifier
  // `solo` plus product_plan_identifier `monthly`, keyed `solo` or `solo:monthly`.
  for (const key of ["solo", "solo:monthly"]) {
    const split: RcSubscriber = {
      entitlements: { solo: { product_identifier: "solo", product_plan_identifier: "monthly", expires_date: iso(FUTURE) } },
      subscriptions: { [key]: play() },
    };
    assert.deepEqual(entitlementUpdate(split, NOW), RC_ACTIVE_SOLO);
  }
  const planOnSub: RcSubscriber = {
    entitlements: { team: { product_identifier: "team", expires_date: iso(FUTURE) } },
    subscriptions: { team: play({ product_plan_identifier: "annual" }) },
  };
  assert.deepEqual(entitlementUpdate(planOnSub, NOW), { ...RC_ACTIVE_SOLO, plan: "team", cycle: "annual" });
});
