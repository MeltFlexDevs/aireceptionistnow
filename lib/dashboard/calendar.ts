import { ensureBusinessId } from "./db";
import { serviceClient } from "./supabase";
import { assistantName, str } from "./calls/embed";

// The booking calendar reads `call_actions` (type = 'booking'), NOT the remote
// provider. The CalendarProvider boundary deliberately exposes only getBusy()
// (busy intervals, no event details) so an assistant can offer free slots
// without ever revealing what is on the calendar - there is no read path for
// event details, by design. `call_actions` is the record of what our assistants
// booked, which is what this page is about: attribution (who called, which
// assistant, when it was added). Events a user adds directly in Cal.com/Google
// are therefore not listed here.
//
// Day bucketing goes through dayKeyFn (timezone.ts) so a booking lands on the
// day the user saw it; grid arithmetic is pure UTC calendar math on "YYYY-MM-DD"
// keys, which keeps it free of DST edge cases.

export type BookingStatus = "pending" | "done" | "failed" | "cancelled";

/** Where an in-flight cancellation notification is, surfaced on the booking. */
export interface BookingCancellation {
  reason: string;
  offerRebook: boolean;
  notifyStatus: "pending" | "calling" | "answered" | "sms_sent" | "failed";
}

export interface Booking {
  id: string;
  callId: string;
  /** Appointment slot (ISO). Empty when the agent never supplied a start. */
  startTime: string;
  endTime: string;
  title: string;
  attendeeName: string;
  /** Callback number the caller gave, when different from their caller ID. */
  attendeePhone: string;
  notes: string;
  status: BookingStatus;
  /** Provider's id for the event. Null when it never reached the provider. */
  externalId: string | null;
  error: string | null;
  /** When the assistant recorded it (call_actions.created_at). */
  bookedAt: string;
  /** Who called (calls.from_number). */
  callerNumber: string;
  /** Assistant that took the call, from the calls.assistant_id snapshot. */
  assistant: string | null;
  /** Calendar the event was written to ('calcom', 'google'…). Null when the
   *  booking was saved as a request with no calendar resolved. */
  provider: string | null;
  /** Present once the owner has cancelled this booking. */
  cancellation: BookingCancellation | null;
}

// `!inner` on calls so a booking whose call was deleted drops out, and so the
// call.* filters below narrow the top-level rows. The assistant name comes from
// the insert-time calls.assistant_id snapshot, matching the call log:
// reassigning a number must not relabel history.
const SELECT =
  "id,status,external_id,payload,error,created_at," +
  "call:calls!inner(id,from_number,business_id,owner_id,assistant:assistants!assistant_id(name))," +
  "integration:integrations(provider)";

function one(v: unknown): Record<string, unknown> | null {
  const x = Array.isArray(v) ? v[0] : v;
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

function toStatus(v: unknown): BookingStatus {
  return v === "done" || v === "failed" || v === "cancelled" ? v : "pending";
}

function toCancellation(payload: Record<string, unknown>): BookingCancellation | null {
  const c = payload.cancellation as Partial<BookingCancellation> | undefined;
  if (!c || typeof c !== "object") return null;
  return {
    reason: typeof c.reason === "string" ? c.reason : "",
    offerRebook: Boolean(c.offerRebook),
    notifyStatus:
      (["pending", "calling", "answered", "sms_sent", "failed"] as const).find(
        (s) => s === c.notifyStatus,
      ) ?? "pending",
  };
}

function nullableStr(v: unknown): string | null {
  return typeof v === "string" && v !== "" ? v : null;
}

/**
 * Bookings the assistants made, newest first, scoped to an owner when one is
 * passed (same unowned-allowed rule as listIntegrations/getCallLog: a strict
 * .eq would hide legacy owner_id-null rows).
 *
 * Bounded by `limit` rather than a date range: start_time lives in a jsonb
 * payload as an ISO string with an arbitrary UTC offset, so a SQL range filter
 * on it would be a lexical compare across mixed offsets ("+02:00" vs "Z") and
 * silently drop rows. Callers bucket by month in JS on parsed Dates instead.
 */
export async function listBookings(
  ownerId?: string | null,
  limit = 500,
): Promise<Booking[]> {
  const businessId = await ensureBusinessId();
  let query = serviceClient()
    .from("call_actions")
    .select(SELECT)
    .eq("type", "booking")
    .eq("call.business_id", businessId);
  if (ownerId) {
    query = query.or(`owner_id.eq.${ownerId},owner_id.is.null`, {
      referencedTable: "call",
    });
  }
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((r) => {
    const row = r as unknown as Record<string, unknown>;
    const call = one(row.call) ?? {};
    const payload = one(row.payload) ?? {};
    const integration = one(row.integration);
    return {
      id: str(row.id),
      callId: str(call.id),
      startTime: str(payload.start_time),
      endTime: str(payload.end_time),
      title: str(payload.title),
      attendeeName: str(payload.attendee_name),
      attendeePhone: str(payload.attendee_phone),
      notes: str(payload.notes),
      status: toStatus(row.status),
      externalId: nullableStr(row.external_id),
      error: nullableStr(row.error),
      bookedAt: str(row.created_at),
      callerNumber: str(call.from_number),
      assistant: assistantName(call),
      provider: integration ? nullableStr(integration.provider) : null,
      cancellation: toCancellation(payload),
    };
  });
}

// ── Month navigation ────────────────────────────────────────────────────────

/** `month` is 1-12 (not JS's 0-11) - it maps straight to the `?month=` param. */
export interface MonthCursor {
  year: number;
  month: number;
}

/** `YYYY-MM` for a cursor, for building prev/next links. */
export function monthParam(c: MonthCursor): string {
  return `${c.year}-${String(c.month).padStart(2, "0")}`;
}

/** Move `delta` months, rolling the year over. */
export function shiftMonth(c: MonthCursor, delta: number): MonthCursor {
  const zero = c.month - 1 + delta;
  return { year: c.year + Math.floor(zero / 12), month: ((zero % 12) + 12) % 12 + 1 };
}

/** The month a "YYYY-MM-DD" day key falls in. */
export function monthOf(dayKey: string): MonthCursor {
  const [y, m] = dayKey.split("-").map(Number);
  return { year: y, month: m };
}

/** Parse `?month=YYYY-MM`, falling back to `todayKey`'s month for anything
 *  missing or malformed (the param is user-supplied). */
export function parseMonth(raw: string | undefined, todayKey: string): MonthCursor {
  const m = /^(\d{4})-(\d{2})$/.exec(raw ?? "");
  if (!m) return monthOf(todayKey);
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return monthOf(todayKey);
  return { year, month };
}

// ── Month grid ──────────────────────────────────────────────────────────────

export interface DayCell {
  /** "YYYY-MM-DD" - the join key against groupByDay(). */
  key: string;
  /** Day of month, for the cell label. */
  day: number;
  /** False for the lead-in/trail-out cells borrowed from adjacent months. */
  inMonth: boolean;
  isToday: boolean;
}

function keyOf(utc: Date): string {
  return utc.toISOString().slice(0, 10);
}

/**
 * The Monday-first grid of whole weeks covering `c`'s month (4-6 rows).
 * All arithmetic is on UTC calendar dates, so the result is a pure function of
 * (year, month) - no server-timezone or DST influence.
 */
export function buildMonthGrid(c: MonthCursor, todayKey: string): DayCell[][] {
  const first = new Date(Date.UTC(c.year, c.month - 1, 1));
  // Day 0 of the next month is the last day of this one.
  const lastDay = new Date(Date.UTC(c.year, c.month, 0)).getUTCDate();
  // getUTCDay() is Sunday-0; shift so Monday starts the week.
  const lead = (first.getUTCDay() + 6) % 7;
  const lastDow = (new Date(Date.UTC(c.year, c.month - 1, lastDay)).getUTCDay() + 6) % 7;
  const cells = lead + lastDay + (6 - lastDow);

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells; i += 7) {
    const week: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      // Date.UTC normalizes out-of-range days across month/year boundaries.
      const cell = new Date(Date.UTC(c.year, c.month - 1, 1 - lead + i + d));
      const key = keyOf(cell);
      week.push({
        key,
        day: cell.getUTCDate(),
        inMonth: cell.getUTCMonth() === c.month - 1 && cell.getUTCFullYear() === c.year,
        isToday: key === todayKey,
      });
    }
    weeks.push(week);
  }
  return weeks;
}

/** Bookings bucketed by day key (in the user's timezone via `toKey`), each
 *  day's list sorted by start time. Bookings with no parseable start_time have
 *  no day to sit on and are dropped - the page lists them separately. */
export function groupByDay(
  bookings: Booking[],
  toKey: (d: Date) => string,
): Map<string, Booking[]> {
  const byDay = new Map<string, Booking[]>();
  for (const b of bookings) {
    const t = Date.parse(b.startTime);
    if (!Number.isFinite(t)) continue;
    const key = toKey(new Date(t));
    const list = byDay.get(key);
    if (list) list.push(b);
    else byDay.set(key, [b]);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
  }
  return byDay;
}

/** Bookings with no usable appointment slot - saved as requests to confirm. */
export function undatedBookings(bookings: Booking[]): Booking[] {
  return bookings.filter((b) => !Number.isFinite(Date.parse(b.startTime)));
}
