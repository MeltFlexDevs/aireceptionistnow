import "server-only";

import { getBilling, isStoreSandbox } from "@/lib/billing";
import { getPlan, limitsFor, type PlanId, type PlanLimits } from "@/lib/plans";
import { grantsPlan } from "@/lib/store-billing/snapshot";
import type { PlanBilling } from "./billing-panel";
import { unstable_cache } from "next/cache";
import { countFreeNumbers, getOwnedNumbers, listAssistants, listNumbers } from "./db";

export interface PlanUsage {
  numbers: number;
  assistants: number;
}

export interface PlanContext {
  planId: PlanId | null;
  planName: string;
  active: boolean;
  enforced: boolean;
  limits: PlanLimits;
  usage: PlanUsage;
  canAddNumber: boolean;
  /** The plan comes from a store sandbox purchase (App Review, TestFlight). */
  sandbox: boolean;
  /** Who bills the active plan and its period (settings plan panel). Null without an active plan. */
  billing: PlanBilling | null;
}

/**
 * Cache tag of one user's plan context. Billing writers (Stripe webhook, store
 * verify/sync/webhooks) expire it so a fresh subscription shows up on the next
 * dashboard read instead of after the 30s window.
 */
export function planCacheTag(userId: string): string {
  return `plan:${userId}`;
}

/** Sandbox entitlements never buy a live number unless explicitly allowed for a test stack. */
export function sandboxNumbersAllowed(): boolean {
  return process.env.STORE_SANDBOX_PROVISION_NUMBERS === "1";
}

export async function getPlanContext(
  ownerId?: string | null,
  opts?: { strict?: boolean },
): Promise<PlanContext> {
  const soft = <T>(p: Promise<T[]>): Promise<T[]> =>
    opts?.strict ? p : p.catch(() => []);
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
      sandbox: false,
      billing: null,
    };
  }

  const billing = await getBilling(ownerId).catch(() => null);
  // The app's billing snapshot uses the same rule: a store period that has
  // ended grants nothing, even when the expiry event never arrived.
  const active = grantsPlan(billing);
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
    sandbox: active && isStoreSandbox(billing),
    billing:
      active && billing
        ? {
            provider: billing.provider,
            cycle: billing.cycle,
            currentPeriodEnd: billing.currentPeriodEnd,
            cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
          }
        : null,
  };
}

export const getPlanContextCached = (ownerId?: string | null): Promise<PlanContext> =>
  unstable_cache(() => getPlanContext(ownerId), ["dash-plan", ownerId ?? "anon"], {
    revalidate: 30,
    tags: ownerId ? [planCacheTag(ownerId)] : [],
  })();

export type AssignNumberRefusal = "plan_required" | "limit_reached" | "sandbox" | "unverified";

export async function canAssignNumber(
  ownerId?: string | null,
  opts?: { countPending?: boolean; reassign?: boolean },
): Promise<{
  ok: boolean;
  reason?: string;
  code?: AssignNumberRefusal;
  /** When ok: the plan's number limit; null when there is no finite limit. */
  limit?: number | null;
  /** The limit_reached sentence, for a reservation refused for the limit (number-assign.ts). */
  limitReason?: string;
}> {
  if (!ownerId) return { ok: true };
  let ctx: PlanContext;
  let pending = 0;
  try {
    ctx = await getPlanContext(ownerId, { strict: true });
    if (opts?.countPending) pending = await countFreeNumbers();
  } catch {
    return {
      ok: false,
      code: "unverified",
      reason: "Couldn't verify your plan usage. Please try again.",
    };
  }
  if (ctx.enforced && !ctx.active && !opts?.reassign) {
    return { ok: false, code: "plan_required", reason: "Subscribe to a plan to add a phone number." };
  }
  // A sandbox purchase (App Review, TestFlight) is recorded like a real one but
  // must never spend money on a Twilio number.
  if (ctx.sandbox && !sandboxNumbersAllowed()) {
    return {
      ok: false,
      code: "sandbox",
      reason: "Test purchases (App Review, TestFlight) do not include a live phone number.",
    };
  }
  const limit = ctx.limits.phoneNumbers;
  const limitReason = `Your ${ctx.planName} plan includes ${limit} phone number${limit === 1 ? "" : "s"}. Upgrade to add more.`;
  if (ctx.usage.numbers + pending < limit) {
    return { ok: true, limit: Number.isFinite(limit) ? limit : null, limitReason };
  }
  return { ok: false, code: "limit_reached", reason: limitReason };
}
