import { ensureBusinessId } from "./db";
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
}

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
