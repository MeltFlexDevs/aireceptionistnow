import type { ResolvedCalendar } from "./registry";
import type { BusyInterval } from "./types";

// Availability logic for the check_availability tool. It reads busy intervals
// from every readable calendar and returns ONLY what's safe to say out loud:
// whether the requested slot is free, and a few free alternatives. It never
// returns event titles, attendees, or reasons - read access is for availability
// only, so the assistant can say "that time isn't available, I'm free at 3pm"
// without ever revealing what is on the calendar or why.

// Hours the assistant will offer slots within, as a privacy-safe heuristic when
// no explicit business hours are configured. Times are evaluated in the zone the
// request was written in (its UTC offset), and alternatives are returned in that
// zone, spoken-friendly with an explicit-offset ISO the model can book with.
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
  /** Free alternatives of the same duration, e.g.
   *  "Friday, July 3, 9:00 AM (2026-07-03T09:00:00-04:00)". */
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

// UTC offset (minutes east) the request was written in: an explicit offset in
// the ISO string wins, otherwise the server zone Date.parse assumed for it.
// ponytail: the request's offset stands in for the business timezone until one
// is stored in the schema - an IANA zone would also track DST across the search.
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

// "Friday, July 3, 9:00 AM (2026-07-03T09:00:00-04:00)" - the spoken part is
// what the caller hears, the explicit-offset ISO is what books unambiguously.
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

  // A time the caller explicitly asked for is free purely on calendar conflict -
  // the business-hours window only bounds the alternatives we proactively offer,
  // so we never reject a valid slot just because of the heuristic window/zone.
  const requestedFree = !overlaps(startMs, endMs, busy);

  const offsetMin = requestOffsetMin(startIso.trim(), startMs);
  const alternatives: string[] = [];
  const stepMs = SLOT_STEP_MIN * 60 * 1000;
  const searchEnd = startMs + SEARCH_DAYS * 24 * 60 * 60 * 1000;
  for (let s = startMs; s < searchEnd && alternatives.length < MAX_ALTERNATIVES; s += stepMs) {
    const e = s + durationMs;
    if (s === startMs && requestedFree) continue; // don't offer the slot they asked for
    if (!withinHours(s, e, offsetMin)) continue;
    if (overlaps(s, e, busy)) continue;
    alternatives.push(formatSlot(s, offsetMin));
  }

  return { ok: true, requestedFree, alternatives };
}
