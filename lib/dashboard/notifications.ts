import "server-only";

import { ensureBusinessId, getOwnedNumbers } from "./db";
import { serviceClient } from "./supabase";

// Notification feed for the top-bar bell: the account's most recent calls, newest
// first. Scoped to the signed-in user's numbers (auth on) or the whole business
// (auth off). "Unread" is tracked client-side against the newest item's time, so
// no read-state column is needed — see components/NotificationsBell.tsx.

export interface NotificationItem {
  /** Call id (also the dedupe key and link target). */
  id: string;
  /** Caller's number, or "Unknown caller". */
  title: string;
  /** Short outcome/status line, e.g. "Booked · 2m 14s". */
  subtitle: string;
  /** ISO timestamp the call started — drives ordering and unread comparison. */
  at: string;
  /** Link to the call's detail page. */
  href: string;
}

interface CallRow {
  id: string;
  started_at: string;
  duration_seconds: number | null;
  status: string;
  outcome: string | null;
  from_number: string | null;
}

function fmtDuration(sec: number | null): string {
  const s = Math.max(0, Math.round(sec ?? 0));
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function subtitleFor(c: CallRow): string {
  const label = capitalize(c.outcome ?? c.status ?? "Call");
  return `${label} · ${fmtDuration(c.duration_seconds)}`;
}

/**
 * Recent calls as notification items for `ownerId` (pass null when auth is off to
 * fall back to the whole business). Returns at most `limit`, newest first.
 */
export async function getNotifications(
  ownerId?: string | null,
  limit = 8,
): Promise<NotificationItem[]> {
  const businessId = await ensureBusinessId();

  // Scope to the user's assistants' numbers. [] = owns none → no notifications.
  let numberIds: string[] | undefined;
  if (ownerId) {
    numberIds = (await getOwnedNumbers(ownerId)).map((n) => n.id);
    if (numberIds.length === 0) return [];
  }

  let query = serviceClient()
    .from("calls")
    .select("id,started_at,duration_seconds,status,outcome,from_number")
    .eq("business_id", businessId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (numberIds) query = query.in("phone_number_id", numberIds);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as CallRow[]).map((c) => ({
    id: c.id,
    title: c.from_number || "Unknown caller",
    subtitle: subtitleFor(c),
    at: c.started_at,
    href: `/dashboard/calls/${c.id}`,
  }));
}
