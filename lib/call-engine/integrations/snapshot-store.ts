import { createAdminClient } from "../../supabase/admin";
import type { BusyInterval } from "./types";

// How long a stored snapshot may serve availability answers. Longer than a
// typical call, so mid-call checks stay on the call-start prefetch instead of
// paying a live provider round trip. The safety net is the pre-booking guard,
// which always reads live (fresh: true) and whose snapshot gets cleared after
// every booking write - but note the guard fails OPEN when its live read
// errors, so staleness here still widens the (small) window in which an
// externally-booked slot can be offered and then double-booked.
export const SNAPSHOT_FRESH_MS = 10 * 60_000;

export interface BusySnapshot {
  busy: BusyInterval[];
  timeMin: string;
  timeMax: string;
  fetchedAt: number;
}

// All helpers degrade to a cache miss on any DB error (including the
// availability_snapshots table not existing yet - migration 0003).
export async function readSnapshots(ids: string[]): Promise<Map<string, BusySnapshot>> {
  const out = new Map<string, BusySnapshot>();
  if (ids.length === 0) return out;
  try {
    const { data, error } = await createAdminClient()
      .from("availability_snapshots")
      .select("integration_id, time_min, time_max, busy, fetched_at")
      .in("integration_id", ids);
    if (error || !data) return out;
    for (const row of data) {
      out.set(String(row.integration_id), {
        busy: (row.busy as BusyInterval[]) ?? [],
        timeMin: String(row.time_min),
        timeMax: String(row.time_max),
        fetchedAt: Date.parse(String(row.fetched_at)),
      });
    }
  } catch {
    // treat as miss
  }
  return out;
}

export async function writeSnapshot(
  integrationId: string,
  snap: { timeMin: string; timeMax: string; busy: BusyInterval[] },
): Promise<void> {
  try {
    await createAdminClient()
      .from("availability_snapshots")
      .upsert({
        integration_id: integrationId,
        time_min: snap.timeMin,
        time_max: snap.timeMax,
        busy: snap.busy,
        fetched_at: new Date().toISOString(),
      });
  } catch {
    // best-effort cache
  }
}

export async function clearSnapshot(integrationId: string): Promise<void> {
  try {
    await createAdminClient()
      .from("availability_snapshots")
      .delete()
      .eq("integration_id", integrationId);
  } catch {
    // best-effort cache
  }
}
