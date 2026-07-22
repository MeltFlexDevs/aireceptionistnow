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

// Per-instance layer over the Supabase row: a hot check_availability turn is
// otherwise a DB round trip even on a hit (~30-80ms). The DB row stays the
// cross-instance source of truth; this only shortcuts repeat reads on the same
// warm instance, and every entry is invalidated in clearSnapshot.
const MEM_TTL_MS = 30_000;
const memCache = new Map<string, { snap: BusySnapshot; cachedAt: number }>();

// Guards the window between clearSnapshot deleting a memCache entry and its DB
// delete committing: a concurrent readSnapshots that grabbed the pre-delete row
// must not re-pin it in memory for the full TTL. Longer than a DB delete.
const CLEAR_GUARD_MS = 5_000;
const clearedAt = new Map<string, number>();

// All helpers degrade to a cache miss on any DB error (including the
// availability_snapshots table not existing yet - migration 0003).
// skipMemory bypasses the per-instance layer (the booking guard reads DB-only
// so a clear on another instance is never masked by a stale local entry).
export async function readSnapshots(
  ids: string[],
  opts: { skipMemory?: boolean } = {},
): Promise<Map<string, BusySnapshot>> {
  const out = new Map<string, BusySnapshot>();
  if (ids.length === 0) return out;
  const now = Date.now();
  const misses: string[] = [];
  for (const id of ids) {
    const hit = opts.skipMemory ? undefined : memCache.get(id);
    if (hit && now - hit.cachedAt < MEM_TTL_MS) out.set(id, hit.snap);
    else misses.push(id);
  }
  if (misses.length === 0) return out;
  try {
    const { data, error } = await createAdminClient()
      .from("availability_snapshots")
      .select("integration_id, time_min, time_max, busy, fetched_at")
      .in("integration_id", misses);
    if (error || !data) return out;
    for (const row of data) {
      const id = String(row.integration_id);
      const snap: BusySnapshot = {
        busy: (row.busy as BusyInterval[]) ?? [],
        timeMin: String(row.time_min),
        timeMax: String(row.time_max),
        fetchedAt: Date.parse(String(row.fetched_at)),
      };
      out.set(id, snap);
      // Skip re-pinning a row that clearSnapshot is deleting right now, so a
      // concurrent read can't resurrect just-booked (stale-free) availability.
      if (now - (clearedAt.get(id) ?? 0) >= CLEAR_GUARD_MS) {
        memCache.set(id, { snap, cachedAt: now });
      }
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
  const fetchedAt = Date.now();
  memCache.set(integrationId, {
    snap: { busy: snap.busy, timeMin: snap.timeMin, timeMax: snap.timeMax, fetchedAt },
    cachedAt: fetchedAt,
  });
  if (memCache.size > 500) memCache.clear(); // crude bound; repopulates on demand
  try {
    await createAdminClient()
      .from("availability_snapshots")
      .upsert({
        integration_id: integrationId,
        time_min: snap.timeMin,
        time_max: snap.timeMax,
        busy: snap.busy,
        fetched_at: new Date(fetchedAt).toISOString(),
      });
  } catch {
    // best-effort cache
  }
}

export async function clearSnapshot(integrationId: string): Promise<void> {
  clearedAt.set(integrationId, Date.now());
  if (clearedAt.size > 500) clearedAt.clear(); // crude bound; tombstones are short-lived
  memCache.delete(integrationId);
  try {
    await createAdminClient()
      .from("availability_snapshots")
      .delete()
      .eq("integration_id", integrationId);
  } catch {
    // best-effort cache
  }
}
