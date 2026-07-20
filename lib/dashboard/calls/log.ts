import { getOwnedNumbers } from "../db";
import { serviceClient } from "../supabase";
import { listTwilioCallsCached, type TwilioCallLog } from "../twilio";
import { ownerTimezone } from "../timezone";
import { assistantName, num, str } from "./embed";
import {
  dateTimeFmt,
  fmtDuration,
  isLiveStatus,
  normalizeDirection,
  statusBucket,
  statusLabel,
} from "./format";
import type { CallFilters, CallLog, CallLogRow } from "./types";

interface DbCallRow {
  id: string;
  sid: string;
  from: string;
  to: string;
  direction: string;
  status: string;
  date: string;
  durationSec: number;
  outcome: string | null;
  assistant: string | null;
}

const SELECT =
  "id,twilio_call_sid,from_number,to_number,direction,status,started_at,duration_seconds,outcome,assistant:assistants!assistant_id(name)";

async function fetchAllNumbers(): Promise<Map<string, number>> {
  const { data, error } = await serviceClient()
    .from("phone_numbers")
    .select("e164,created_at");
  if (error) throw error;
  const owned = new Map<string, number>();
  for (const r of data ?? []) {
    const row = r as Record<string, unknown>;
    const e164 = str(row.e164);
    if (!e164) continue;
    const ms = Date.parse(str(row.created_at)) || 0;
    const prev = owned.get(e164);
    if (prev === undefined || ms < prev) owned.set(e164, ms);
  }
  return owned;
}

async function fetchDbCalls(limit: number, ownerId?: string | null): Promise<DbCallRow[]> {
  let query = serviceClient().from("calls").select(SELECT);
  if (ownerId) query = query.or(`owner_id.eq.${ownerId},owner_id.is.null`);
  const { data, error } = await query.order("started_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as unknown as Record<string, unknown>;
    return {
      id: str(row.id),
      sid: str(row.twilio_call_sid),
      from: str(row.from_number),
      to: str(row.to_number),
      direction: str(row.direction),
      status: str(row.status),
      date: str(row.started_at),
      durationSec: num(row.duration_seconds),
      outcome: str(row.outcome) || null,
      assistant: assistantName(row),
    };
  });
}

function mergeRow(t: TwilioCallLog, db: DbCallRow | null, fmtDateTime: (iso: string) => string): CallLogRow {
  return {
    key: t.sid,
    dbId: db?.id ?? null,
    sid: t.sid,
    date: t.date,
    dateLabel: fmtDateTime(t.date),
    status: t.status,
    statusLabel: statusLabel(t.status),
    direction: t.direction,
    from: t.from,
    to: t.to,
    durationSec: t.durationSec,
    durationLabel: fmtDuration(t.durationSec),
    outcome: db?.outcome ?? null,
    assistant: db?.assistant ?? null,
    source: db ? "both" : "twilio",
  };
}

function dbOnlyRow(c: DbCallRow, fmtDateTime: (iso: string) => string): CallLogRow {
  return {
    key: `db:${c.id}`,
    dbId: c.id,
    sid: c.sid,
    date: c.date,
    dateLabel: fmtDateTime(c.date),
    status: c.status,
    statusLabel: statusLabel(c.status),
    direction: normalizeDirection(c.direction),
    from: c.from,
    to: c.to,
    durationSec: c.durationSec,
    durationLabel: fmtDuration(c.durationSec),
    outcome: c.outcome,
    assistant: c.assistant,
    source: "db",
  };
}

function applyFilters(rows: CallLogRow[], f: CallFilters): CallLogRow[] {
  const q = (f.q ?? "").trim().toLowerCase();
  return rows.filter((r) => {
    if (f.direction && f.direction !== "all" && r.direction !== f.direction) return false;
    if (f.status && f.status !== "all" && statusBucket(r.status, r.date) !== f.status) return false;
    if (q) {
      const hay = `${r.from} ${r.to} ${r.sid} ${r.assistant ?? ""} ${r.outcome ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

async function ownedNumberMap(ownerId?: string | null): Promise<Map<string, number>> {
  if (!ownerId) return fetchAllNumbers();
  const numbers = await getOwnedNumbers(ownerId);
  const owned = new Map<string, number>();
  for (const n of numbers) {
    const ms = Date.parse(n.created_at) || 0;
    const prev = owned.get(n.e164);
    if (prev === undefined || ms < prev) owned.set(n.e164, ms);
  }
  return owned;
}

export async function getCallLog(
  filters: CallFilters = {},
  ownerId?: string | null,
  limit?: number,
  /** Viewer's locale for date labels; the page threads it in. */
  locale?: string,
): Promise<CallLog> {
  // Search/status filters run in memory, so a filtered view must scan deep
  // enough that older calls stay findable; the plain view stays light.
  const filtered = Boolean((filters.q ?? "").trim()) || (filters.status ?? "all") !== "all";
  const scan = limit ?? (filtered ? 1000 : 200);
  const [dbCalls, owned, twilioCalls, tz] = await Promise.all([
    fetchDbCalls(scan, ownerId),
    ownedNumberMap(ownerId),
    listTwilioCallsCached(Math.max(scan, 500)).catch(() => [] as TwilioCallLog[]),
    ownerTimezone(ownerId),
  ]);
  const fmtDateTime = dateTimeFmt(tz, locale);

  const dbBySid = new Map<string, DbCallRow>();
  for (const c of dbCalls) if (c.sid) dbBySid.set(c.sid, c);

  const isOurs = (t: TwilioCallLog): boolean => {
    if (dbBySid.has(t.sid)) return true;
    const when = Date.parse(t.date) || 0;
    const fromMs = owned.get(t.from);
    const toMs = owned.get(t.to);
    return (fromMs !== undefined && when >= fromMs) || (toMs !== undefined && when >= toMs);
  };

  const matched = new Set<string>();
  const rows: CallLogRow[] = [];
  for (const t of twilioCalls) {
    if (!isOurs(t)) continue;
    const db = dbBySid.get(t.sid) ?? null;
    if (db) matched.add(t.sid);
    rows.push(mergeRow(t, db, fmtDateTime));
  }
  for (const c of dbCalls) {
    if (c.sid && matched.has(c.sid)) continue;
    rows.push(dbOnlyRow(c, fmtDateTime));
  }

  const cleaned = rows.filter(
    (r) =>
      r.assistant &&
      (r.durationSec > 0 || isLiveStatus(r.status, r.date) || statusBucket(r.status) === "completed"),
  );

  cleaned.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  return { rows: applyFilters(cleaned, filters), twilioConnected: twilioCalls.length > 0 };
}
