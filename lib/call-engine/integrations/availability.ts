import { INTEGRATION_TIMEOUT_MS, withDeadline } from "../net";
import type { ResolvedCalendar } from "./registry";
import {
  SNAPSHOT_FRESH_MS,
  readSnapshots,
  writeSnapshot,
  type BusySnapshot,
} from "./snapshot-store";
import type { BusyInterval } from "./types";

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const SLOT_STEP_MIN = 30;
const SEARCH_DAYS = 3;
// A check needs start..start+SEARCH_DAYS covered; prefetching only 7 days made
// any question more than ~4 days out a guaranteed live read. 14 covers the
// common booking horizon (busy-window payloads are small).
const PREFETCH_DAYS = 14;
const MAX_ALTERNATIVES = 3;

export interface AvailabilityAnswer {
  ok: boolean;
  requestedFree: boolean;
  alternatives: string[];
  error?: string;
}

function overlaps(start: number, end: number, busy: BusyInterval[]): boolean {
  return busy.some((b) => {
    const bs = Date.parse(b.start);
    const be = Date.parse(b.end);
    return Number.isFinite(bs) && Number.isFinite(be) && start < be && end > bs;
  });
}

function requestOffsetMin(iso: string, ms: number): number {
  if (/[zZ]$/.test(iso)) return 0;
  const m = iso.match(/([+-])(\d{2}):?(\d{2})$/);
  if (m) return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
  return -new Date(ms).getTimezoneOffset();
}

function withinHours(startMs: number, endMs: number, offsetMin: number): boolean {
  // Shift onto the request's wall clock, then read it as UTC.
  const shift = offsetMin * 60 * 1000;
  const s = new Date(startMs + shift);
  const e = new Date(endMs + shift);
  // Keep a slot inside the offered window and on the same calendar day.
  return (
    s.getUTCHours() >= DAY_START_HOUR &&
    (e.getUTCHours() < DAY_END_HOUR ||
      (e.getUTCHours() === DAY_END_HOUR && e.getUTCMinutes() === 0)) &&
    s.toISOString().slice(0, 10) === new Date(endMs - 1 + shift).toISOString().slice(0, 10)
  );
}

function formatSlot(ms: number, offsetMin: number): string {
  const shifted = new Date(ms + offsetMin * 60 * 1000);
  const spoken = shifted.toLocaleString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const sign = offsetMin < 0 ? "-" : "+";
  const abs = Math.abs(offsetMin);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  const offset = offsetMin === 0 ? "Z" : `${sign}${hh}:${mm}`;
  return `${spoken} (${shifted.toISOString().slice(0, 19)}${offset})`;
}

export async function checkAvailability(
  calendars: ResolvedCalendar[],
  startIso: string,
  endIso: string,
  opts: { fresh?: boolean; maxSnapshotAgeMs?: number } = {},
): Promise<AvailabilityAnswer> {
  const startMs = Date.parse(startIso);
  const endMs = Date.parse(endIso);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return { ok: false, requestedFree: false, alternatives: [], error: "invalid time range" };
  }
  const durationMs = endMs - startMs;

  const readable = calendars.filter((c) => typeof c.provider.getBusy === "function");
  if (readable.length === 0) {
    const why =
      calendars.length === 0
        ? "no calendar granted read access"
        : "granted calendars cannot be read (provider has no availability support)";
    console.error(`[availability] ${why}`);
    return { ok: false, requestedFree: false, alternatives: [], error: why };
  }

  const timeMin = new Date(Math.min(startMs, Date.now())).toISOString();
  const timeMax = new Date(startMs + SEARCH_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Snapshots prefetched at call start (or written by a check seconds ago)
  // answer without a live provider round trip; anything uncovered reads live.
  // A "guard read" is the pre-booking double-book guard:
  //   - opts.fresh: never touch snapshots, always read live (legacy behavior).
  //   - opts.maxSnapshotAgeMs: trust a covering snapshot only if it is at most
  //     that many ms old (the check-then-book flow makes a seconds-old snapshot
  //     the common case), else read live. Reads DB-only (skipMemory) so a book
  //     on another instance, which clears the DB row, isn't hidden by a stale
  //     per-instance memory entry - the provider's own conflict rejection stays
  //     the final backstop either way.
  const guardRead = opts.fresh === true || opts.maxSnapshotAgeMs !== undefined;
  const snapshots = opts.fresh
    ? new Map<string, BusySnapshot>()
    : await withDeadline(
        readSnapshots(readable.map((c) => c.integrationId), {
          skipMemory: opts.maxSnapshotAgeMs !== undefined,
        }),
        1500,
        new Map<string, BusySnapshot>(),
      );
  const now = Date.now();
  const maxSnapshotAge = Math.min(opts.maxSnapshotAgeMs ?? SNAPSHOT_FRESH_MS, SNAPSHOT_FRESH_MS);
  const covers = (s: BusySnapshot) =>
    now - s.fetchedAt < maxSnapshotAge &&
    Date.parse(s.timeMin) <= Date.parse(timeMin) &&
    Date.parse(s.timeMax) >= Date.parse(timeMax);

  const results = await Promise.all(
    readable.map(async (c) => {
      const snap = snapshots.get(c.integrationId);
      if (snap && covers(snap)) return { ok: true, busy: snap.busy };
      const read = c.provider
        .getBusy!({ timeMin, timeMax })
        .catch((err: Error) => ({
          ok: false,
          busy: [] as BusyInterval[],
          error: err?.message ?? "threw",
        }));
      const res = await withDeadline(read, INTEGRATION_TIMEOUT_MS, {
        ok: false,
        busy: [] as BusyInterval[],
        error: "timeout",
      });
      // Keep the shared snapshot warm for later checks - but never from a guard
      // read, whose write could land after the post-booking clear.
      if (res.ok && !guardRead) {
        void writeSnapshot(c.integrationId, { timeMin, timeMax, busy: res.busy });
      }
      return res;
    }),
  );
  if (results.every((r) => !r.ok)) {
    const why = results
      .map((r, i) => `${readable[i].integrationId}: ${r.error ?? "unknown"}`)
      .join("; ");
    console.error(`[availability] every calendar read failed - ${why}`);
    return { ok: false, requestedFree: false, alternatives: [], error: why };
  }
  for (const [i, r] of results.entries()) {
    if (!r.ok) {
      console.warn(
        `[availability] ${readable[i].integrationId} read failed (${r.error ?? "unknown"}) - answering from the calendars that did read`,
      );
    }
  }
  const busy = results.flatMap((r) => r.busy);

  const requestedFree = !overlaps(startMs, endMs, busy);

  // Alternatives only matter when the requested slot is taken.
  const alternatives: string[] = [];
  if (!requestedFree) {
    const offsetMin = requestOffsetMin(startIso.trim(), startMs);
    const stepMs = SLOT_STEP_MIN * 60 * 1000;
    const searchEnd = startMs + SEARCH_DAYS * 24 * 60 * 60 * 1000;
    for (let s = startMs; s < searchEnd && alternatives.length < MAX_ALTERNATIVES; s += stepMs) {
      const e = s + durationMs;
      if (!withinHours(s, e, offsetMin)) continue;
      if (overlaps(s, e, busy)) continue;
      alternatives.push(formatSlot(s, offsetMin));
    }
  }

  return { ok: true, requestedFree, alternatives };
}

// Fired from /api/agent/init via after(): warms OAuth tokens and stores each
// calendar's busy window so mid-call checks answer from one indexed read. Also
// warms the write-calendar token for providers whose getBusy is unauthenticated
// (Cal.com) or absent (Outlook), which the busy prefetch alone never touches.
export async function prefetchAvailability(calendars: ResolvedCalendar[]): Promise<void> {
  // The same integration can appear under multiple access entries (read + write);
  // warm each provider once.
  const seen = new Set<string>();
  const unique = calendars.filter((c) => {
    if (seen.has(c.integrationId)) return false;
    seen.add(c.integrationId);
    return true;
  });
  if (unique.length === 0) return;

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + PREFETCH_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const jobs: Promise<unknown>[] = [];
  for (const c of unique) {
    if (typeof c.provider.getBusy === "function") {
      jobs.push(
        (async () => {
          const read = await withDeadline(
            c.provider.getBusy!({ timeMin, timeMax }).catch((err: Error) => ({
              ok: false,
              busy: [] as BusyInterval[],
              error: err?.message ?? "threw",
            })),
            INTEGRATION_TIMEOUT_MS,
            { ok: false, busy: [] as BusyInterval[], error: "timeout" },
          );
          if (read.ok) await writeSnapshot(c.integrationId, { timeMin, timeMax, busy: read.busy });
        })(),
      );
    }
    if (typeof c.provider.warmAuth === "function") {
      jobs.push(
        withDeadline(
          c.provider.warmAuth().catch(() => undefined),
          INTEGRATION_TIMEOUT_MS,
          undefined,
        ),
      );
    }
  }
  await Promise.all(jobs);
}
