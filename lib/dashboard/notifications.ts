import "server-only";

import { getOwnedNumbers } from "./db";
import { serviceClient } from "./supabase";
import { fmtDuration } from "./calls/format";

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  at: string;
  href: string;
  // Raw fields for the native app, which localizes and formats its own rows
  // instead of parsing the web bell's English title/subtitle/href.
  /** The call this item is about. */
  callId: string | null;
  /** Caller's number as stored, "" when unknown. */
  from: string;
  /** Raw DB outcome (booked / message / ...), null when the call had none. */
  outcome: string | null;
  /** Raw DB status (completed / no-answer / in-progress ...). */
  status: string;
  durationSec: number;
}

interface CallRow {
  id: string;
  started_at: string;
  duration_seconds: number | null;
  status: string;
  outcome: string | null;
  from_number: string | null;
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function subtitleFor(c: CallRow): string {
  const label = capitalize(c.outcome ?? c.status ?? "Call");
  return `${label} · ${fmtDuration(c.duration_seconds ?? 0)}`;
}

// ownerId is required, not optional. This reads through serviceClient(), which
// bypasses RLS, so the phone_number_id filter is the only tenant boundary --
// an absent ownerId used to drop the filter and return every tenant's calls.
export async function getNotifications(
  ownerId: string,
  limit = 8,
): Promise<NotificationItem[]> {
  // Scope to the user's assistants' numbers. [] = owns none → no notifications.
  const numberIds = (await getOwnedNumbers(ownerId)).map((n) => n.id);
  if (numberIds.length === 0) return [];

  const { data, error } = await serviceClient()
    .from("calls")
    .select("id,started_at,duration_seconds,status,outcome,from_number")
    .in("phone_number_id", numberIds)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return ((data ?? []) as CallRow[]).map((c) => ({
    id: c.id,
    title: c.from_number || "Unknown caller",
    subtitle: subtitleFor(c),
    at: c.started_at,
    href: `/dashboard/calls/${c.id}`,
    callId: c.id || null,
    from: c.from_number ?? "",
    outcome: c.outcome || null,
    status: c.status ?? "",
    durationSec: Math.max(0, Math.round(c.duration_seconds ?? 0)),
  }));
}
