import "server-only";

import { getBilling } from "@/lib/billing";
import { getPlan, limitsFor, type PlanId, type PlanLimits } from "@/lib/plans";
import { unstable_cache } from "next/cache";
import { countFreeNumbers, getOwnedNumbers, listAssistants, listNumbers } from "./db";

// Plan + live usage for the dashboard and the create/assign server actions.
// The plan comes from Supabase (user_billing, via get_billing) so the browser
// can never grant itself a higher tier; usage is counted from the same tables
// that back the dashboard. This is the single gate the assign paths consult.

export interface PlanUsage {
  numbers: number;
  assistants: number;
  // ponytail: talk minutes are not metered - limits.minutesIncluded is
  // display-only. To meter: sum calls.duration_seconds over the owner's numbers
  // for the current billing period (anchor on user_billing's period) and
  // surface it here + in PlanUsage.tsx.
}

export interface PlanContext {
  /** Active paid plan id, or null when there's no active subscription. */
  planId: PlanId | null;
  /** Display name ("Solo" / "Team" / "No plan"). */
  planName: string;
  /** True when a paid subscription is active or trialing. */
  active: boolean;
  /** True when auth is on, so limits are actually enforced for this caller. */
  enforced: boolean;
  limits: PlanLimits;
  usage: PlanUsage;
  /** Whether another phone number can be assigned under the plan's quota. */
  canAddNumber: boolean;
}

function isActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

/**
 * Resolve the plan, its enforced limits, and current usage for an owner. Pass the
 * signed-in user id (from currentUserId()); pass null when auth is off, in which
 * case limits are not enforced (single-tenant/dev) but usage is still reported.
 *
 * Display callers tolerate a flaky DB (usage queries fall back to empty, the
 * page still renders). The enforcement path (canAssignNumber) passes `strict`
 * so a DB error propagates instead of zeroing usage - otherwise a transient
 * Supabase failure would silently waive the number limit.
 */
export async function getPlanContext(
  ownerId?: string | null,
  opts?: { strict?: boolean },
): Promise<PlanContext> {
  const soft = <T>(p: Promise<T[]>): Promise<T[]> =>
    opts?.strict ? p : p.catch(() => []);
  // Usage: numbers assigned to this owner's assistants + assistant count.
  // Without an owner (auth off) fall back to the whole workspace.
  const [assistants, numbers] = await Promise.all([
    soft(listAssistants(ownerId ?? undefined)),
    ownerId
      ? soft(getOwnedNumbers(ownerId))
      : soft(listNumbers().then((rows) => rows.filter((n) => n.assistant_id))),
  ]);
  const usage: PlanUsage = { numbers: numbers.length, assistants: assistants.length };

  // No auth → no enforcement, but still surface the entry-tier limits for display.
  if (!ownerId) {
    return {
      planId: null,
      planName: "No plan",
      active: false,
      enforced: false,
      limits: limitsFor(null),
      usage,
      canAddNumber: true,
    };
  }

  const billing = await getBilling(ownerId).catch(() => null);
  const active = isActive(billing?.status) && Boolean(billing?.plan);
  const planId = active ? (billing?.plan ?? null) : null;
  const limits = limitsFor(planId);

  return {
    planId,
    planName: planId ? getPlan(planId)?.name ?? planId : "No plan",
    active,
    enforced: true,
    limits,
    usage,
    canAddNumber: usage.numbers < limits.phoneNumbers,
  };
}

// Cross-request cached plan/usage for the dashboard shell - same 30s SWR window
// as the analytics caches so a language switch or quick nav is instant.
export const getPlanContextCached = (ownerId?: string | null): Promise<PlanContext> =>
  unstable_cache(() => getPlanContext(ownerId), ["dash-plan", ownerId ?? "anon"], {
    revalidate: 30,
    tags: ["dashboard-data"],
  })();

/**
 * Guard for the assign/buy paths: may this owner attach one more phone number?
 * Returns a reason when blocked (for surfacing in the redirect/notice). Auth-off
 * callers are always allowed.
 *
 * Pass `countPending` on the BUY/CONNECT paths: those create a brand-new billed
 * line that starts UNASSIGNED, so it never shows up in usage.numbers (which
 * counts only assistant-linked numbers). Without counting pending numbers a
 * subscribed user could pass the quota on every buy and provision unlimited
 * Twilio lines. Assign paths leave it off - re-pointing an existing number
 * doesn't add a line.
 */
export async function canAssignNumber(
  ownerId?: string | null,
  opts?: { countPending?: boolean; reassign?: boolean },
): Promise<{ ok: boolean; reason?: string }> {
  if (!ownerId) return { ok: true };
  let ctx: PlanContext;
  let pending = 0;
  try {
    ctx = await getPlanContext(ownerId, { strict: true });
    // ponytail: countFreeNumbers is business-wide (no owner column on unassigned
    // rows), so in a shared-business multi-tenant deploy this over-counts one
    // buyer's ceiling against the whole pool - add a purchased_by column on
    // phone_numbers to scope pending numbers precisely.
    if (opts?.countPending) pending = await countFreeNumbers();
  } catch {
    // Fail closed: if usage can't be counted, don't hand out a number on
    // fabricated zero usage. Returned (not thrown) so callers keep their
    // friendly redirect instead of an error page.
    return { ok: false, reason: "Couldn't verify your plan usage. Please try again." };
  }
  // No active subscription → no paid number. The Solo-sized fallback limits
  // exist so the dashboard renders, not to hand Twilio numbers (real monthly
  // charges) to accounts that never checked out.
  // No active subscription → can't acquire a NEW paid number. But re-pointing a
  // number that already exists (reassign - e.g. after unassigning it) creates no
  // new Twilio line, so it must NOT demand a subscription; it only counts against
  // quota below. Without this, unassign → re-assign your own number wrongly errors
  // "Subscribe to a plan".
  if (ctx.enforced && !ctx.active && !opts?.reassign) {
    return { ok: false, reason: "Subscribe to a plan to add a phone number." };
  }
  if (ctx.usage.numbers + pending < ctx.limits.phoneNumbers) return { ok: true };
  const limit = ctx.limits.phoneNumbers;
  return {
    ok: false,
    reason: `Your ${ctx.planName} plan includes ${limit} phone number${limit === 1 ? "" : "s"}. Upgrade to add more.`,
  };
}
