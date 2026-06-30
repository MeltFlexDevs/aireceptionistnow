import type { ResolvedCalendar } from "./registry";
import type { BusyInterval } from "./types";

// Availability logic for the check_availability tool. It reads busy intervals
// from every readable calendar and returns ONLY what's safe to say out loud:
// whether the requested slot is free, and a few free alternatives. It never
// returns event titles, attendees, or reasons — read access is for availability
// only, so the assistant can say "that time isn't available, I'm free at 3pm"
// without ever revealing what is on the calendar or why.

// Hours the assistant will offer slots within, as a privacy-safe heuristic when
// no explicit business hours are configured. Times are evaluated in the server's
// local zone; alternatives are returned as absolute ISO timestamps.
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const SLOT_STEP_MIN = 30;
const SEARCH_DAYS = 3;
const MAX_ALTERNATIVES = 3;

export interface AvailabilityAnswer {
  /** false when no calendar could be read (assistant should take a message). */
  ok: boolean;
  /** Whether the requested [start,end) is free. */
  requestedFree: boolean;
  /** ISO start times of free alternatives of the same duration. */
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

function withinHours(startMs: number, endMs: number): boolean {
  const s = new Date(startMs);
  const e = new Date(endMs);
  // Keep a slot inside the offered window and on the same calendar day.
  return (
    s.getHours() >= DAY_START_HOUR &&
    (e.getHours() < DAY_END_HOUR ||
      (e.getHours() === DAY_END_HOUR && e.getMinutes() === 0)) &&
    s.toDateString() === new Date(endMs - 1).toDateString()
  );
}

/**
 * Decide if the requested slot is free and, if not, find the next few free slots
 * of the same duration. Pulls busy from all readable calendars in parallel; if
 * none can be read, returns ok:false so the caller takes a message instead of
 * inventing availability.
 */
export async function checkAvailability(
  calendars: ResolvedCalendar[],
  startIso: string,
  endIso: string,
): Promise<AvailabilityAnswer> {
  const startMs = Date.parse(startIso);
  const endMs = Date.parse(endIso);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return { ok: false, requestedFree: false, alternatives: [], error: "invalid time range" };
  }
  const durationMs = endMs - startMs;

  const readable = calendars.filter((c) => typeof c.provider.getBusy === "function");
  if (readable.length === 0) {
    return { ok: false, requestedFree: false, alternatives: [] };
  }

  const timeMin = new Date(Math.min(startMs, Date.now())).toISOString();
  const timeMax = new Date(startMs + SEARCH_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const results = await Promise.all(
    readable.map((c) =>
      c.provider
        .getBusy!({ timeMin, timeMax })
        .catch(() => ({ ok: false, busy: [] as BusyInterval[] })),
    ),
  );
  // If every read failed, we can't make a claim about availability.
  if (results.every((r) => !r.ok)) {
    return { ok: false, requestedFree: false, alternatives: [] };
  }
  const busy = results.flatMap((r) => r.busy);

  // A time the caller explicitly asked for is free purely on calendar conflict —
  // the business-hours window only bounds the alternatives we proactively offer,
  // so we never reject a valid slot just because of the heuristic window/zone.
  const requestedFree = !overlaps(startMs, endMs, busy);

  const alternatives: string[] = [];
  const stepMs = SLOT_STEP_MIN * 60 * 1000;
  const searchEnd = startMs + SEARCH_DAYS * 24 * 60 * 60 * 1000;
  for (let s = startMs; s < searchEnd && alternatives.length < MAX_ALTERNATIVES; s += stepMs) {
    const e = s + durationMs;
    if (s === startMs && requestedFree) continue; // don't offer the slot they asked for
    if (!withinHours(s, e)) continue;
    if (overlaps(s, e, busy)) continue;
    alternatives.push(new Date(s).toISOString());
  }

  return { ok: true, requestedFree, alternatives };
}
