import { authConfigured, devDashboardBypass } from "@/lib/supabase/config";

/**
 * The one tenant check for a row that carries an `owner_id`.
 *
 * Strict: the row must name this user. A row with no owner is NOT everybody's -
 * the old `!row.owner_id || row.owner_id === userId` rule let any signed-in
 * account read and edit legacy null-owner assistants and businesses, which is
 * the SEC-1 finding. Such rows now belong to nobody until they are assigned.
 *
 * Dev mode is the one exception: with auth off (no Supabase env) or the
 * DEV_DASHBOARD preview (NODE_ENV=development only - see devDashboardBypass),
 * there is no user id to compare, so a null owner or a null user is allowed and
 * the local dashboard keeps working. Two different real ids never match.
 */
export function isOwnedBy(
  rowOwnerId: string | null | undefined,
  userId: string | null | undefined,
): boolean {
  if (rowOwnerId && userId) return rowOwnerId === userId;
  return !authConfigured() || devDashboardBypass();
}
