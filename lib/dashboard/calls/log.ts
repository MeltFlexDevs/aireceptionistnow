import { ensureBusinessId, getOwnedNumbers } from "../db";
import { serviceClient } from "../supabase";
import { listTwilioCalls, type TwilioCallLog } from "../twilio";
import { assistantName, num, str } from "./embed";
import {
  fmtDateTime,
  fmtDuration,
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
  "id,twilio_call_sid,from_number,to_number,direction,status,started_at,duration_seconds,outcome,phone_number:phone_numbers(assistant:assistants(name))";

// Numbers we provisioned, mapped to when they became ours. The same e164 may
// have a call history from a previous owner; we only own calls on/after this.
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
  businessId: string,
  limit: number,
  numberIds?: string[],
): Promise<DbCallRow[]> {
  if (numberIds && numberIds.length === 0) return [];
  let query = serviceClient().from("calls").select(SELECT).eq("business_id", businessId);
  if (numberIds) query = query.in("phone_number_id", numberIds);
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

function mergeRow(t: TwilioCallLog, db: DbCallRow | null): CallLogRow {
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

function dbOnlyRow(c: DbCallRow): CallLogRow {
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
    if (f.status && f.status !== "all" && statusBucket(r.status) !== f.status) return false;
    if (q) {
      const hay = `${r.from} ${r.to} ${r.sid} ${r.assistant ?? ""} ${r.outcome ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// Reconcile DB call rows against the live Twilio call logs by Call SID. Twilio is
// authoritative for status/duration/direction/from/to/date; the DB row adds
// outcome + assistant. Calls present only in one source are still surfaced.
export async function getCallLog(
  filters: CallFilters = {},
  ownerId?: string | null,
  limit = 200,
): Promise<CallLog> {
  const businessId = await ensureBusinessId();

  // Owned numbers scope the log: the signed-in user's numbers, or all business
  // numbers when auth is off. Used to filter DB rows and to drop a previous
  // owner's Twilio history on the same e164.
  const ownerNumbers = ownerId ? await getOwnedNumbers(ownerId) : null;
  let owned: Map<string, number>;
  let numberIds: string[] | undefined;
  if (ownerNumbers) {
    owned = new Map();
    for (const n of ownerNumbers) {
      const ms = Date.parse(n.created_at) || 0;
      const prev = owned.get(n.e164);
      if (prev === undefined || ms < prev) owned.set(n.e164, ms);
    }
    numberIds = ownerNumbers.map((n) => n.id);
  } else {
    owned = await fetchAllNumbers();
    numberIds = undefined;
  }

  // Pull a wider Twilio window since prior-owner noise gets filtered out below.
  const [dbCalls, twilioCalls] = await Promise.all([
    fetchDbCalls(businessId, limit, numberIds),
    listTwilioCalls(Math.max(limit, 500)).catch(() => [] as TwilioCallLog[]),
  ]);

  const dbBySid = new Map<string, DbCallRow>();
  for (const c of dbCalls) if (c.sid) dbBySid.set(c.sid, c);

  // Keep a Twilio call only if it's already one of ours (SID match) or it
  // involves a number we own and happened on/after we provisioned it.
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
    rows.push(mergeRow(t, db));
  }
  for (const c of dbCalls) {
    if (c.sid && matched.has(c.sid)) continue;
    rows.push(dbOnlyRow(c));
  }

  rows.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
  return { rows: applyFilters(rows, filters), twilioConnected: twilioCalls.length > 0 };
}
