import "server-only";

import { getBilling } from "@/lib/billing";
import { getPlan, limitsFor, type PlanId, type PlanLimits } from "@/lib/plans";
import { getOwnedNumbers, listAssistants, listNumbers } from "./db";

// Plan + live usage for the dashboard and the create/assign server actions.
// The plan comes from Supabase (user_billing, via get_billing) so the browser
// can never grant itself a higher tier; usage is counted from the same tables
// that back the dashboard. This is the single gate the assign paths consult.

export interface PlanUsage {
  numbers: number;
  assistants: number;
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
 */
export async function getPlanContext(
  ownerId?: string | null,
): Promise<PlanContext> {
  // Usage: numbers assigned to this owner's assistants + assistant count.
  // Without an owner (auth off) fall back to the whole workspace.
  const [assistants, numbers] = await Promise.all([
    listAssistants(ownerId ?? undefined).catch(() => []),
    ownerId
      ? getOwnedNumbers(ownerId).catch(() => [])
      : listNumbers()
          .then((rows) => rows.filter((n) => n.assistant_id))
          .catch(() => []),
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

/**
 * Guard for the assign/buy paths: may this owner attach one more phone number?
 * Returns a reason when blocked (for surfacing in the redirect/notice). Auth-off
 * callers are always allowed.
 */
export async function canAssignNumber(
  ownerId?: string | null,
): Promise<{ ok: boolean; reason?: string }> {
  if (!ownerId) return { ok: true };
  const ctx = await getPlanContext(ownerId);
  if (ctx.canAddNumber) return { ok: true };
  const limit = ctx.limits.phoneNumbers;
  return {
    ok: false,
    reason: `Your ${ctx.planName} plan includes ${limit} phone number${limit === 1 ? "" : "s"}. Upgrade to add more.`,
  };
}
