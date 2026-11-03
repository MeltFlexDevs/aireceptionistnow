// Cache tags of the per-user dashboard reads. No imports, so node:test can load
// it; lib/dashboard/plan.ts (planCacheTag) imports "server-only".

/**
 * Cache tag of one user's overview, assistant stats and analytics entries
 * (lib/dashboard/analytics.ts). Expire it after a write that changes what those
 * reads show, so other users' entries stay cached.
 */
export function dashboardCacheTag(userId: string): string {
  return `dashboard:${userId}`;
}

/**
 * True when a profile save changes the account time zone. An unknown stored row
 * (the read failed) counts as a change, so a new zone never waits out the TTL.
 */
export function timezoneChanged(
  before: { timezone?: string | null } | null | undefined,
  saved: string,
): boolean {
  return !before || (before.timezone ?? "") !== saved;
}
