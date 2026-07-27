// The model behind /missed-call-calculator.
//
// Kept as a pure module rather than living inside the client component for the
// usual reason - it is the part with actual logic, so it is the part that needs
// tests (see ./missed-call.test.ts).
//
// HONESTY IS THE DESIGN CONSTRAINT HERE. Every "missed call" calculator on the
// internet inflates its number, usually by treating all inbound calls as new
// customers and assuming every missed caller was a guaranteed sale. That
// produces six-figure losses for a hair salon, which anyone can see is nonsense,
// and a page nobody trusts earns no links and converts nobody. This model
// deliberately discounts the number three times before it reaches the screen:
//
//   1. newCustomerPct  - most inbound calls are existing customers, suppliers or
//                        spam, and those are not lost revenue when missed.
//   2. noCallbackPct   - some share of missed callers do ring back. Only the
//                        ones who never return are genuinely lost.
//   3. bookingRate     - even answered, a prospect only sometimes buys.
//
// Every one of those is an input the visitor can see and change, and the page
// shows the chain rather than only the total. The point is a figure the reader
// believes, not the biggest figure available.

import { EXTRA_MINUTE_EUR, PLANS } from "@/lib/plans";

/**
 * Assumed average call length, used only to size a plan for the payback
 * comparison. Not user-facing input: it is a second-order detail next to the
 * revenue inputs, and one more slider costs more comprehension than it buys.
 * Stated in the page's assumptions block so the estimate stays auditable.
 */
export const AVG_CALL_MINUTES = 4;

export interface MissedCallInputs {
  /** Total inbound calls a month, answered and missed. */
  callsPerMonth: number;
  /** Share of those calls that go unanswered, 0-100. */
  missedPct: number;
  /** Share of inbound calls that are prospective NEW customers, 0-100. */
  newCustomerPct: number;
  /** Share of answered new-customer calls that become customers, 0-100. */
  bookingRate: number;
  /** What one new customer is worth, in EUR. */
  avgCustomerValue: number;
  /** Share of missed callers who never ring back, 0-100. */
  noCallbackPct: number;
  /** Share of currently-missed calls an AI receptionist actually converts, 0-100. */
  recoveryRate: number;
}

export interface MissedCallResult {
  /** Calls that go unanswered each month. */
  missedCalls: number;
  /** Of those, the ones that were prospective new customers. */
  missedNewCustomerCalls: number;
  /** Of those, the ones who never ring back - the genuinely lost opportunities. */
  lostForever: number;
  /** Of those, the ones who would have bought. */
  lostCustomers: number;
  monthlyLoss: number;
  annualLoss: number;
  /** Cheapest plan that covers this call volume, and its monthly cost. */
  planName: string;
  planMonthlyCost: number;
  /** Customers recovered a month at `recoveryRate`, and what they are worth. */
  recoveredCustomers: number;
  recoveredRevenue: number;
  /** Recovered revenue net of the plan. Negative means it does not pay for itself. */
  netMonthlyGain: number;
  /**
   * Customers a month needed just to cover the plan. The most honest number on
   * the page: it does not depend on any of the loss assumptions above, only on
   * the plan price and what a customer is worth.
   */
  breakEvenCustomers: number;
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function clampPositive(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

/**
 * The plan that FITS `minutes` - the smallest one whose included allowance
 * covers the volume, or the largest plus overage if none does.
 *
 * Deliberately NOT "cheapest by price", which is what CompareCalculator does and
 * what this function did first. At the current rates that selection is
 * degenerate: above Solo's allowance the two cost 9 + 0.09m and 29 + 0.09m, so
 * Solo undercuts Team by a flat EUR 20 at EVERY volume and a price-based pick
 * returns Solo for a business doing 800 calls a month. That is bad advice, not a
 * bargain - Solo carries 1 concurrent call, 1 number and 1 user, so a business
 * at that volume would be dropping callers to save EUR 20. Sizing by allowance
 * matches how the pricing table is meant to be read.
 */
export function planFor(minutes: number): { name: string; cost: number } {
  const billed = clampPositive(minutes);
  const bySize = [...PLANS].sort(
    (a, b) => a.limits.minutesIncluded - b.limits.minutesIncluded,
  );

  const fits = bySize.find((plan) => billed <= plan.limits.minutesIncluded);
  if (fits) return { name: fits.name, cost: fits.monthlyAmountCents / 100 };

  // Past every allowance: the largest plan, plus overage on the excess.
  const largest = bySize[bySize.length - 1];
  if (!largest) return { name: "Solo", cost: 0 };
  return {
    name: largest.name,
    cost:
      largest.monthlyAmountCents / 100 +
      (billed - largest.limits.minutesIncluded) * EXTRA_MINUTE_EUR,
  };
}

export function calculateMissedCallLoss(input: MissedCallInputs): MissedCallResult {
  const callsPerMonth = clampPositive(input.callsPerMonth);
  const missedPct = clampPct(input.missedPct);
  const newCustomerPct = clampPct(input.newCustomerPct);
  const bookingRate = clampPct(input.bookingRate);
  const avgCustomerValue = clampPositive(input.avgCustomerValue);
  const noCallbackPct = clampPct(input.noCallbackPct);
  const recoveryRate = clampPct(input.recoveryRate);

  const missedCalls = callsPerMonth * (missedPct / 100);
  const missedNewCustomerCalls = missedCalls * (newCustomerPct / 100);
  const lostForever = missedNewCustomerCalls * (noCallbackPct / 100);
  const lostCustomers = lostForever * (bookingRate / 100);

  const monthlyLoss = lostCustomers * avgCustomerValue;

  // Plan is sized on TOTAL calls, not just the missed ones: the AI answers
  // everything once it is on the line, so that is what gets metered.
  const { name: planName, cost: planMonthlyCost } = planFor(
    callsPerMonth * AVG_CALL_MINUTES,
  );

  const recoveredCustomers = lostCustomers * (recoveryRate / 100);
  const recoveredRevenue = recoveredCustomers * avgCustomerValue;

  return {
    missedCalls,
    missedNewCustomerCalls,
    lostForever,
    lostCustomers,
    monthlyLoss,
    annualLoss: monthlyLoss * 12,
    planName,
    planMonthlyCost,
    recoveredCustomers,
    recoveredRevenue,
    netMonthlyGain: recoveredRevenue - planMonthlyCost,
    // A customer worth nothing can never pay for a plan; Infinity would render
    // as garbage, so the page treats 0 as "not answerable" and hides the line.
    breakEvenCustomers:
      avgCustomerValue > 0 ? Math.ceil(planMonthlyCost / avgCustomerValue) : 0,
  };
}

/**
 * Defaults the page loads with. Chosen to be defensible for a typical
 * appointment-based local business rather than flattering:
 * - 40% new-customer share, because most inbound volume is not new business
 * - 65% never ring back, the commonly cited figure for missed business calls
 * - 70% AI recovery, not 100% - an AI answers every call but does not close
 *   every one a human would have
 */
export const MISSED_CALL_DEFAULTS: MissedCallInputs = {
  callsPerMonth: 200,
  missedPct: 25,
  newCustomerPct: 40,
  bookingRate: 35,
  avgCustomerValue: 400,
  noCallbackPct: 65,
  recoveryRate: 70,
};
