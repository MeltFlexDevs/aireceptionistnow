import { getOwnedNumbers } from "../db";
import { serviceClient } from "../supabase";
import { listTwilioCallsCached, type TwilioCallLog } from "../twilio";
import { ownerTimezone } from "../timezone";
import { assistantName, num, str } from "./embed";
import {
  dateTimeFmt,
  fmtDuration,
  normalizeDirection,
  showInCallLog,
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
  needsReview: boolean;
}

const SELECT =
  "id,twilio_call_sid,from_number,to_number,direction,status,started_at,duration_seconds,outcome,needs_review,assistant:assistants!assistant_id(name)";

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

async function fetchDbCalls(
  limit: number,
  ownerId?: string | null,
  beforeIso?: string,
): Promise<DbCallRow[]> {
  let query = serviceClient().from("calls").select(SELECT);
  // Strictly the owner's rows. Owner-less calls belong to no tenant (the dev
  // preview passes no ownerId and sees them all); they used to be listed for
  // every signed-in user.
  if (ownerId) query = query.eq("owner_id", ownerId);
  if (beforeIso) query = query.lt("started_at", beforeIso);
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
      needsReview: row.needs_review === true,
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
    // A Twilio-only row has no summary and so was never audited.
    needsReview: db?.needsReview ?? false,
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
    needsReview: c.needsReview,
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

/** Keyset paging for the app's Calls list. The web page reads everything at once. */
export interface CallLogPaging {
  /** Only rows whose `date` is strictly older than this ISO timestamp. */
  before?: string;
  /** Page size. Without it every scanned row is returned and nextCursor is null. */
  limit?: number;
}

export interface CallLogPage extends CallLog {
  /** The owner's IANA zone every `dateLabel` was formatted in. */
  timezone: string;
  /** The last row's `date` when older rows remain - pass it back as `before`. */
  nextCursor: string | null;
}

/**
 * How far past `before` the DB read reaches. A merged row is dated by Twilio's
 * start time, which runs a few seconds off the row's own `started_at`; cutting
 * the DB read exactly at the cursor would drop the DB half of a call whose
 * Twilio start sits just under it (and without an assistant the row is then
 * hidden). The exact cut happens on the merged `date` below.
 */
const CURSOR_SLACK_MS = 2 * 60_000;

export async function getCallLog(
  filters: CallFilters = {},
  ownerId?: string | null,
  limit?: number,
  /** Viewer's locale for date labels; the page threads it in. */
  locale?: string,
  paging: CallLogPaging = {},
  /** The zone to show times in when the account has none (display only). */
  displayTz?: string,
): Promise<CallLogPage> {
  // Search/status filters run in memory, so a filtered view must scan deep
  // enough that older calls stay findable; the plain view stays light.
  const filtered = Boolean((filters.q ?? "").trim()) || (filters.status ?? "all") !== "all";
  const scan = limit ?? (filtered ? 1000 : 200);
  const beforeMs = paging.before ? Date.parse(paging.before) : NaN;
  const paged = Number.isFinite(beforeMs);
  const [dbCalls, owned, twilioCalls, tz] = await Promise.all([
    fetchDbCalls(
      scan,
      ownerId,
      paged ? new Date(beforeMs + CURSOR_SLACK_MS).toISOString() : undefined,
    ),
    ownedNumberMap(ownerId),
    listTwilioCallsCached(Math.max(scan, 500)).catch(() => [] as TwilioCallLog[]),
    ownerTimezone(ownerId, displayTz),
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
      showInCallLog(r) &&
      // The cursor compares against the same `date` the list is sorted by, so a
      // page never repeats the previous page's last row. An undated row (NaN)
      // stays on the first page rather than repeating on every later one.
      (!paged || Date.parse(r.date) < beforeMs),
  );

  cleaned.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  const all = applyFilters(cleaned, filters);
  const twilioConnected = twilioCalls.length > 0;

  const size = paging.limit;
  if (!size || size < 1) return { rows: all, twilioConnected, timezone: tz, nextCursor: null };
  const page = all.slice(0, size);
  // Older rows remain when this scan matched more than a page, or when the DB
  // read was cut short by the scan size (older calls may still match there).
  const more = all.length > size || dbCalls.length >= scan;
  const nextCursor = more && page.length > 0 ? page[page.length - 1].date : null;
  return { rows: page, twilioConnected, timezone: tz, nextCursor };
}
