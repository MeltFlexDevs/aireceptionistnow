import "server-only";

import { getBilling } from "@/lib/billing";
import { getPlan, limitsFor, type PlanId, type PlanLimits } from "@/lib/plans";
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
}

function isActive(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
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

export const getPlanContextCached = (ownerId?: string | null): Promise<PlanContext> =>
  unstable_cache(() => getPlanContext(ownerId), ["dash-plan", ownerId ?? "anon"], {
    revalidate: 30,
    tags: ["dashboard-data"],
  })();

export async function canAssignNumber(
  ownerId?: string | null,
  opts?: { countPending?: boolean; reassign?: boolean },
): Promise<{ ok: boolean; reason?: string }> {
  if (!ownerId) return { ok: true };
  let ctx: PlanContext;
  let pending = 0;
  try {
    ctx = await getPlanContext(ownerId, { strict: true });
    if (opts?.countPending) pending = await countFreeNumbers();
  } catch {
    return { ok: false, reason: "Couldn't verify your plan usage. Please try again." };
  }
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
