import assert from "node:assert/strict";
import { test } from "node:test";

import { EXTRA_MINUTE_EUR, PLANS } from "@/lib/plans";
import {
  AVG_CALL_MINUTES,
  MISSED_CALL_DEFAULTS,
  calculateMissedCallLoss,
  planFor,
} from "./missed-call";

// The calculator is a public, linkable claim about someone's revenue. If the
// arithmetic is wrong the page is worse than useless, so the chain is asserted
// step by step rather than only on the headline total.

test("the discount chain is applied in order, not skipped", () => {
  const r = calculateMissedCallLoss({
    callsPerMonth: 1000,
    missedPct: 50, // 500 missed
    newCustomerPct: 50, // 250 of them are new business
    noCallbackPct: 50, // 125 never ring back
    bookingRate: 50, // 62.5 would have bought
    avgCustomerValue: 100,
    recoveryRate: 100,
  });

  assert.equal(r.missedCalls, 500);
  assert.equal(r.missedNewCustomerCalls, 250);
  assert.equal(r.lostForever, 125);
  assert.equal(r.lostCustomers, 62.5);
  assert.equal(r.monthlyLoss, 6250);
  assert.equal(r.annualLoss, 75000);
});

test("annual loss is exactly twelve months, never rounded up", () => {
  const r = calculateMissedCallLoss(MISSED_CALL_DEFAULTS);
  assert.equal(r.annualLoss, r.monthlyLoss * 12);
});

test("missing nothing costs nothing", () => {
  const r = calculateMissedCallLoss({ ...MISSED_CALL_DEFAULTS, missedPct: 0 });
  assert.equal(r.missedCalls, 0);
  assert.equal(r.monthlyLoss, 0);
  assert.equal(r.annualLoss, 0);
});

test("calls that are never new business are never lost revenue", () => {
  // The discount that most competing calculators omit entirely.
  const r = calculateMissedCallLoss({ ...MISSED_CALL_DEFAULTS, newCustomerPct: 0 });
  assert.ok(r.missedCalls > 0, "calls are still missed");
  assert.equal(r.monthlyLoss, 0, "but none of them were revenue");
});

test("callers who always ring back are not lost", () => {
  const r = calculateMissedCallLoss({ ...MISSED_CALL_DEFAULTS, noCallbackPct: 0 });
  assert.equal(r.lostForever, 0);
  assert.equal(r.monthlyLoss, 0);
});

test("recovery rate scales recovered revenue and never exceeds the loss", () => {
  const half = calculateMissedCallLoss({ ...MISSED_CALL_DEFAULTS, recoveryRate: 50 });
  const full = calculateMissedCallLoss({ ...MISSED_CALL_DEFAULTS, recoveryRate: 100 });

  assert.equal(full.recoveredRevenue, full.monthlyLoss, "100% recovers the whole loss");
  assert.ok(
    Math.abs(half.recoveredRevenue - full.recoveredRevenue / 2) < 1e-9,
    "50% recovers half",
  );
  assert.ok(
    half.recoveredRevenue <= half.monthlyLoss,
    "recovery can never exceed what was lost",
  );
});

test("percentages are clamped, so a nonsense input cannot inflate the total", () => {
  const absurd = calculateMissedCallLoss({
    ...MISSED_CALL_DEFAULTS,
    missedPct: 400,
    newCustomerPct: 999,
    bookingRate: 500,
    noCallbackPct: 200,
    recoveryRate: 1000,
  });
  const capped = calculateMissedCallLoss({
    ...MISSED_CALL_DEFAULTS,
    missedPct: 100,
    newCustomerPct: 100,
    bookingRate: 100,
    noCallbackPct: 100,
    recoveryRate: 100,
  });
  assert.equal(absurd.monthlyLoss, capped.monthlyLoss);
  assert.equal(absurd.missedCalls, MISSED_CALL_DEFAULTS.callsPerMonth);
});

test("negative and non-finite inputs degrade to zero rather than NaN", () => {
  const r = calculateMissedCallLoss({
    ...MISSED_CALL_DEFAULTS,
    callsPerMonth: -50,
    avgCustomerValue: Number.NaN,
  });
  assert.equal(r.missedCalls, 0);
  assert.equal(r.monthlyLoss, 0);
  assert.ok(Number.isFinite(r.annualLoss));
  assert.equal(r.breakEvenCustomers, 0, "a worthless customer cannot pay for a plan");
});

test("break-even depends only on plan price and customer value", () => {
  // Deliberately independent of every loss assumption - that is what makes it
  // the number a sceptical reader can check.
  const base = { ...MISSED_CALL_DEFAULTS, avgCustomerValue: 500 };
  const a = calculateMissedCallLoss(base);
  const b = calculateMissedCallLoss({ ...base, missedPct: 90, bookingRate: 5 });
  assert.equal(a.breakEvenCustomers, b.breakEvenCustomers);
  assert.equal(a.breakEvenCustomers, Math.ceil(a.planMonthlyCost / 500));
});

test("plan sizing reads lib/plans.ts and picks the plan that FITS", () => {
  const solo = PLANS.find((p) => p.id === "solo")!;
  const team = PLANS.find((p) => p.id === "team")!;

  // Inside Solo's allowance: Solo, at exactly its list price.
  const light = planFor(solo.limits.minutesIncluded - 100);
  assert.equal(light.name, solo.name);
  assert.equal(light.cost, solo.monthlyAmountCents / 100);

  // Exactly at the boundary still fits Solo.
  assert.equal(planFor(solo.limits.minutesIncluded).name, solo.name);

  // One minute past it moves up to Team, even though Solo-plus-overage would be
  // cheaper - see the note on planFor. Sizing follows capacity, not price.
  const overSolo = planFor(solo.limits.minutesIncluded + 1);
  assert.equal(overSolo.name, team.name);
  assert.equal(overSolo.cost, team.monthlyAmountCents / 100);

  // Past every allowance: largest plan plus overage on the excess only.
  const heavy = planFor(team.limits.minutesIncluded + 500);
  assert.equal(heavy.name, team.name);
  assert.equal(heavy.cost, team.monthlyAmountCents / 100 + 500 * EXTRA_MINUTE_EUR);
});

test("price-based plan selection would be degenerate, which is why it is not used", () => {
  // Documents the pricing quirk that forced planFor to size by capacity: above
  // Solo's allowance the two plans differ by a constant, so "cheapest" is always
  // Solo no matter the volume. If this ever stops being true, planFor could
  // reasonably go back to picking on price.
  const solo = PLANS.find((p) => p.id === "solo")!;
  const team = PLANS.find((p) => p.id === "team")!;
  const cost = (plan: typeof solo, m: number) =>
    plan.monthlyAmountCents / 100 +
    Math.max(0, m - plan.limits.minutesIncluded) * EXTRA_MINUTE_EUR;

  for (const minutes of [3001, 4000, 10_000]) {
    assert.ok(
      cost(solo, minutes) < cost(team, minutes),
      `Solo should undercut Team at ${minutes} minutes`,
    );
  }
});

test("the plan is sized on total calls, not just the missed ones", () => {
  // The AI answers everything once it is live, so metering follows total volume.
  const r = calculateMissedCallLoss({ ...MISSED_CALL_DEFAULTS, callsPerMonth: 500 });
  assert.equal(r.planMonthlyCost, planFor(500 * AVG_CALL_MINUTES).cost);
});

test("the shipped defaults produce a believable figure, not a fantasy", () => {
  // Guards the calibration itself: 200 calls a month for a business where a
  // customer is worth EUR 400 must not claim a six-figure annual loss.
  const r = calculateMissedCallLoss(MISSED_CALL_DEFAULTS);
  assert.ok(r.annualLoss > 0, "the default state must show a real number");
  assert.ok(
    r.annualLoss < 100_000,
    `defaults claim an implausible EUR ${Math.round(r.annualLoss)}/yr`,
  );
  assert.ok(
    r.lostCustomers < MISSED_CALL_DEFAULTS.callsPerMonth * 0.1,
    "lost customers must stay a small fraction of total call volume",
  );
});
