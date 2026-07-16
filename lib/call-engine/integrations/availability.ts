import { INTEGRATION_TIMEOUT_MS, withDeadline } from "../net";
import type { ResolvedCalendar } from "./registry";
import type { BusyInterval } from "./types";

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const SLOT_STEP_MIN = 30;
const SEARCH_DAYS = 3;
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

  const results = await Promise.all(
    readable.map((c) => {
      const read = c.provider
        .getBusy!({ timeMin, timeMax })
        .catch((err: Error) => ({
          ok: false,
          busy: [] as BusyInterval[],
          error: err?.message ?? "threw",
        }));
      return withDeadline(read, INTEGRATION_TIMEOUT_MS, {
        ok: false,
        busy: [] as BusyInterval[],
        error: "timeout",
      });
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
