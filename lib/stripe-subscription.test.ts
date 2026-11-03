import assert from "node:assert/strict";
import { test } from "node:test";
import {
  cancelsAtPeriodEnd,
  grantsPlanStatus,
  isLiveStatus,
  periodEndOf,
  pickLiveSibling,
  planFromSubscription,
  siblingToFollow,
  type SubscriptionFields,
} from "./stripe-subscription";

// Stands in for getPlanByPriceId, which reads price ids from the env.
const lookup = (priceId: string) =>
  priceId === "price_team_monthly"
    ? { plan: { id: "team" as const }, cycle: "monthly" as const }
    : undefined;

function sub(over: Partial<SubscriptionFields> = {}): SubscriptionFields {
  return {
    id: "sub_test",
    status: "active",
    metadata: {},
    items: { data: [{ price: { id: "price_team_monthly" } }] },
    ...over,
  };
}

const unmapped = { items: { data: [{ price: { id: "price_old" } }] } };

test("a mapped price decides the plan and cycle", (t) => {
  const err = t.mock.method(console, "error", () => {});
  assert.deepEqual(planFromSubscription(sub(), lookup), { plan: "team", cycle: "monthly" });
  assert.equal(err.mock.callCount(), 0);
});

test("an unmapped price is logged and valid metadata decides", (t) => {
  const err = t.mock.method(console, "error", () => {});
  const s = sub({ ...unmapped, metadata: { plan: "team", cycle: "annual" } });
  assert.deepEqual(planFromSubscription(s, lookup), { plan: "team", cycle: "annual" });
  assert.equal(err.mock.callCount(), 1);
  assert.deepEqual(err.mock.calls[0].arguments, [
    "[stripe] unmapped price",
    { price: "price_old", subscription: "sub_test" },
  ]);
});

test("metadata that names no real plan or cycle grants nothing", (t) => {
  const err = t.mock.method(console, "error", () => {});
  const s = sub({ ...unmapped, metadata: { plan: "gold", cycle: "weekly" } });
  assert.deepEqual(planFromSubscription(s, lookup), { plan: null, cycle: null });
  assert.equal(err.mock.callCount(), 1);
});

test("an inactive subscription grants nothing and logs nothing", (t) => {
  const err = t.mock.method(console, "error", () => {});
  assert.deepEqual(planFromSubscription(sub({ status: "canceled" }), lookup), {
    plan: null,
    cycle: null,
  });
  assert.equal(err.mock.callCount(), 0);
});

test("cancel_at_period_end decides when it is set", () => {
  assert.equal(cancelsAtPeriodEnd({ cancel_at_period_end: true, cancel_at: null }, 2000), true);
  assert.equal(cancelsAtPeriodEnd({ cancel_at_period_end: false, cancel_at: null }, 2000), false);
  assert.equal(cancelsAtPeriodEnd({}, 2000), false);
});

test("cancel_at alone counts only at or before the period end", () => {
  assert.equal(cancelsAtPeriodEnd({ cancel_at_period_end: false, cancel_at: 2000 }, 2000), true);
  assert.equal(cancelsAtPeriodEnd({ cancel_at_period_end: false, cancel_at: 1500 }, 2000), true);
  assert.equal(cancelsAtPeriodEnd({ cancel_at_period_end: false, cancel_at: 2001 }, 2000), false);
  assert.equal(cancelsAtPeriodEnd({ cancel_at_period_end: false, cancel_at: 2000 }, null), false);
});

// A subscription of the customer: its id, status and the period end on its item.
function live(id: string, status: string, end: number | null = 1000): SubscriptionFields {
  return sub({ id, status, items: { data: [{ current_period_end: end }] } });
}

test("pickLiveSibling: no other subscription gives null", () => {
  assert.equal(pickLiveSibling([], "sub_a"), null);
  assert.equal(pickLiveSibling([live("sub_a", "canceled")], "sub_a"), null);
});

test("pickLiveSibling: the one live sibling is picked", () => {
  const b = live("sub_b", "active");
  assert.equal(pickLiveSibling([live("sub_a", "canceled"), b], "sub_a"), b);
});

test("pickLiveSibling: ended siblings and the ended id itself are never picked", () => {
  const ended = ["canceled", "incomplete_expired", "paused"].map((s, i) => live(`sub_${i}`, s));
  assert.equal(pickLiveSibling(ended, "sub_a"), null);
  // Even when Stripe still lists the ended id with a live status.
  assert.equal(pickLiveSibling([live("sub_a", "active")], "sub_a"), null);
});

test("pickLiveSibling: among live ones the latest period end wins, then the first", () => {
  const c = live("sub_c", "active", 3000);
  const subs = [live("sub_b", "active", 1000), c, live("sub_d", "trialing", 2000)];
  assert.equal(pickLiveSibling(subs, "sub_a"), c);
  const first = live("sub_f", "active", 3000);
  assert.equal(pickLiveSibling([first, live("sub_g", "active", 3000)], "sub_a"), first);
});

test("pickLiveSibling: a status that grants a plan wins over one Stripe still collects for", () => {
  const active = live("sub_c", "active", 1000);
  assert.equal(pickLiveSibling([live("sub_b", "past_due", 5000), active], "sub_a"), active);
  const unpaid = live("sub_d", "unpaid", 4000);
  assert.equal(pickLiveSibling([live("sub_e", "incomplete", 2000), unpaid], "sub_a"), unpaid);
});

test("siblingToFollow: a subscription that grants a plan keeps the row", () => {
  const b = live("sub_b", "active");
  for (const status of ["active", "trialing"]) {
    assert.equal(siblingToFollow([b], { id: "sub_a", status }), null, status);
  }
});

test("siblingToFollow: past_due, unpaid or incomplete gives way only to a sibling that grants a plan", () => {
  const active = live("sub_b", "active");
  const trialing = live("sub_c", "trialing");
  const collecting = [live("sub_d", "past_due"), live("sub_e", "unpaid")];
  for (const status of ["past_due", "unpaid", "incomplete"]) {
    assert.equal(siblingToFollow([active], { id: "sub_a", status }), active, status);
    assert.equal(siblingToFollow([trialing], { id: "sub_a", status }), trialing, status);
    assert.equal(siblingToFollow(collecting, { id: "sub_a", status }), null, status);
  }
});

test("siblingToFollow: an ended subscription gives way to any live sibling", () => {
  const unpaid = live("sub_b", "unpaid");
  for (const status of ["canceled", "incomplete_expired", "paused"]) {
    assert.equal(siblingToFollow([unpaid], { id: "sub_a", status }), unpaid, status);
  }
  // The ended id itself is never followed, whatever Stripe lists for it.
  assert.equal(siblingToFollow([live("sub_a", "active")], { id: "sub_a", status: "canceled" }), null);
});

test("grantsPlanStatus: only active and trialing grant the plan", () => {
  for (const s of ["active", "trialing"]) {
    assert.equal(grantsPlanStatus(s), true, s);
  }
  for (const s of ["past_due", "unpaid", "incomplete", "canceled", "incomplete_expired", "paused", ""]) {
    assert.equal(grantsPlanStatus(s), false, s);
  }
});

test("periodEndOf reads the subscription field, then the first item, else null", () => {
  const item = { data: [{ current_period_end: 7 }] };
  assert.equal(periodEndOf({ current_period_end: 5, items: item }), 5);
  assert.equal(periodEndOf({ items: item }), 7);
  assert.equal(periodEndOf({ items: { data: [] } }), null);
  assert.equal(periodEndOf({}), null);
});

test("isLiveStatus follows the LIVE STRIPE rule", () => {
  for (const s of ["active", "trialing", "past_due", "unpaid", "incomplete"]) {
    assert.equal(isLiveStatus(s), true, s);
  }
  for (const s of ["canceled", "incomplete_expired", "paused", ""]) {
    assert.equal(isLiveStatus(s), false, s);
  }
});
