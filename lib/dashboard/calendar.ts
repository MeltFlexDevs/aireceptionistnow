import { serviceClient } from "./supabase";
import { assistantName, str } from "./calls/embed";

export type BookingStatus = "pending" | "done" | "failed" | "cancelled";

export interface BookingCancellation {
  reason: string;
  offerRebook: boolean;
  notifyStatus: "pending" | "calling" | "answered" | "sms_sent" | "failed";
}

export interface Booking {
  id: string;
  callId: string;
  startTime: string;
  endTime: string;
  title: string;
  attendeeName: string;
  attendeePhone: string;
  notes: string;
  status: BookingStatus;
  externalId: string | null;
  error: string | null;
  bookedAt: string;
  callerNumber: string;
  assistant: string | null;
  provider: string | null;
  cancellation: BookingCancellation | null;
  // Automatic calendar-sync retries recorded so far (see booking-retry.ts).
  syncAttempts: number;
}

const SELECT =
  "id,status,external_id,payload,error,created_at," +
  "call:calls!inner(id,from_number,owner_id,assistant:assistants!assistant_id(name))," +
  "integration:integrations(provider)";

function one(v: unknown): Record<string, unknown> | null {
  const x = Array.isArray(v) ? v[0] : v;
  return x && typeof x === "object" ? (x as Record<string, unknown>) : null;
}

function toStatus(v: unknown): BookingStatus {
  return v === "done" || v === "failed" || v === "cancelled" ? v : "pending";
}

/**
 * Written by claimCancellation (booking-cancel.ts) to payload.cancelClaim:
 * when a cancel request took the row, and the status the row had before.
 */
export interface CancelClaim {
  at: string;
  status: string;
}

/**
 * A claim older than this belongs to a request that died between its claim
 * and its save: no route sets maxDuration, so no request runs past 300 s.
 */
export const CANCEL_CLAIM_STALE_MS = 10 * 60_000;

/**
 * The claim a dead cancel request left behind: status "cancelled", no saved
 * cancellation, and a claim older than CANCEL_CLAIM_STALE_MS. The customer was
 * never told, so the row reads as its old status and may be claimed again.
 * Null for a saved cancel, a claim still in flight, or a row with no claim.
 */
export function staleCancelClaim(
  status: string,
  payload: Record<string, unknown>,
  nowMs: number,
): CancelClaim | null {
  if (status !== "cancelled" || payload.cancellation) return null;
  const claim = payload.cancelClaim as Partial<CancelClaim> | undefined;
  if (typeof claim?.at !== "string" || typeof claim.status !== "string") return null;
  if (!claim.status || claim.status === "cancelled") return null;
  const atMs = Date.parse(claim.at);
  if (!Number.isFinite(atMs) || nowMs - atMs < CANCEL_CLAIM_STALE_MS) return null;
  return { at: claim.at, status: claim.status };
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

const DAY_MS = 86_400_000;

/**
 * The PostgREST or() filter behind listBookingsInWindow: bookings that start
 * inside the window, plus undated ones (no start_time, or ""), which wait on
 * a person whatever the window. start_time is the agent's ISO text with its
 * own UTC offset (agent/tools.ts) and is compared as text, so each bound is
 * padded by a day: no offset moves a wall time more than 14 h from UTC.
 * A null timeMax leaves the window open at the end.
 */
export function bookingWindowFilter(timeMin: string, timeMax: string | null): string {
  const min = `payload->>start_time.gte.${new Date(Date.parse(timeMin) - DAY_MS).toISOString()}`;
  const dated = timeMax
    ? `and(${min},payload->>start_time.lte.${new Date(Date.parse(timeMax) + DAY_MS).toISOString()})`
    : min;
  return `payload->>start_time.is.null,payload->>start_time.eq."",${dated}`;
}

export function listBookings(ownerId?: string | null, limit = 500): Promise<Booking[]> {
  return selectBookings(ownerId, limit, null);
}

/**
 * listBookings for one time window, for the mobile Calendar and Home tabs.
 * The cap counts the newest-made first, so without a window a busy account's
 * booking made weeks ago for next week fell out of it. The cap stays as a
 * safety net. Undated bookings always come back.
 */
export function listBookingsInWindow(
  ownerId: string,
  timeMin: string,
  timeMax: string | null,
  limit = 500,
): Promise<Booking[]> {
  return selectBookings(ownerId, limit, bookingWindowFilter(timeMin, timeMax));
}

async function selectBookings(
  ownerId: string | null | undefined,
  limit: number,
  window: string | null,
): Promise<Booking[]> {
  let query = serviceClient()
    .from("call_actions")
    .select(SELECT)
    .eq("type", "booking");
  // Strictly the owner's calls (the embed is !inner, so this filters bookings).
  // Owner-less calls belong to no tenant; they used to show for every user.
  if (ownerId) query = query.eq("call.owner_id", ownerId);
  if (window) query = query.or(window);
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
      // A dead cancel request's claim reads as the status before it, so the
      // owner gets the cancel button back (see staleCancelClaim).
      status: toStatus(staleCancelClaim(str(row.status), payload, Date.now())?.status ?? row.status),
      externalId: nullableStr(row.external_id),
      error: nullableStr(row.error),
      bookedAt: str(row.created_at),
      callerNumber: str(call.from_number),
      assistant: assistantName(call),
      provider: integration ? nullableStr(integration.provider) : null,
      cancellation: toCancellation(payload),
      syncAttempts:
        typeof (payload.sync as { attempts?: unknown } | undefined)?.attempts === "number"
          ? ((payload.sync as { attempts: number }).attempts)
          : 0,
    };
  });
}

// ── Month navigation ────────────────────────────────────────────────────────

export interface MonthCursor {
  year: number;
  month: number;
}

export function monthParam(c: MonthCursor): string {
  return `${c.year}-${String(c.month).padStart(2, "0")}`;
}

export function shiftMonth(c: MonthCursor, delta: number): MonthCursor {
  const zero = c.month - 1 + delta;
  return { year: c.year + Math.floor(zero / 12), month: ((zero % 12) + 12) % 12 + 1 };
}

export function monthOf(dayKey: string): MonthCursor {
  const [y, m] = dayKey.split("-").map(Number);
  return { year: y, month: m };
}

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
  key: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

function keyOf(utc: Date): string {
  return utc.toISOString().slice(0, 10);
}

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

export function undatedBookings(bookings: Booking[]): Booking[] {
  return bookings.filter((b) => !Number.isFinite(Date.parse(b.startTime)));
}
