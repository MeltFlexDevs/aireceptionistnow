import { canAddAssistant } from "@/lib/plans";

import type { PlanContext } from "./plan";

/**
 * The one receptionist-cap check for every create path: the web action and
 * POST /api/mobile/assistants. `loadPlan` is `getPlanContext` in the app and
 * a stub in tests. Fails open: a missing plan or a failed plan read must not
 * block creating a receptionist.
 */
export async function mayAddAssistant(
  ownerId: string,
  loadPlan: (ownerId: string) => Promise<Pick<PlanContext, "usage" | "limits"> | null>,
): Promise<boolean> {
  const plan = await loadPlan(ownerId).catch(() => null);
  return !plan || canAddAssistant(plan.usage.assistants, plan.limits);
}
