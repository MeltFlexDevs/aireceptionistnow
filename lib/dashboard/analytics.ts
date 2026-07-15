import { cache } from "react";
import { unstable_cache } from "next/cache";
import { ensureBusinessId, getOwnedNumbers } from "./db";
import { serviceClient } from "./supabase";
import { dayKeyFn, ownerTimezone, timeFmt } from "./timezone";
import { countryFromPhone, flagEmoji } from "../call-engine/voice/phone-language";

// Dashboard analytics from the calls / call_turns tables (read-only, one business).
export type Trend = "up" | "down";

export interface Kpi {
  key: string;
  label: string;
  value: string;
  delta: number;
  goodWhen: Trend;
  spark: number[];
}
export interface Bar {
  label: string;
  value: number;
}
export interface Segment {
  label: string;
  value: number;
  color: string;
}
export interface Latency {
  medianMs: number;
  p95Ms: number;
  targetMs: number;
  spark: number[];
}
export interface MonthUsage {
  callsThisMonth: number;
  minutes: number;
  bookings: number;
}
export type Sentiment = "positive" | "neutral" | "negative" | "frustrated" | "angry";
export interface Call {
  id: string;
  name: string;
  number: string;
  flag: string; // caller's country flag emoji, "" when unknown
  duration: string;
  outcome: string;
  sentiment: Sentiment;
  time: string;
  /** Absolute timestamp in the user's timezone (tooltip next to `time`). */
  at: string;
}
export interface Summary {
  id: string;
  name: string;
  time: string;
  /** Absolute timestamp in the user's timezone (tooltip next to `time`). */
  at: string;
  text: string;
  tags: string[];
}

export interface Overview {
  kpis: Kpi[];
  callVolume: Bar[];
  talkRatio: Segment[];
  countries: Segment[];
  latency: Latency;
  monthUsage: MonthUsage;
  recentCalls: Call[];
  summaries: Summary[];
}

export interface Analytics {
  totals: { calls: number; avgDuration: string; answerRate: string; bookings: number };
  volume: Bar[];
  countries: Segment[];
  sentiment: Segment[];
  /** Who did the talking. Depth metrics: they moved off the overview, which is
   *  now a glance, and landed here where the filters make them meaningful. */
  talkRatio: Segment[];
  latency: Latency;
}

interface CallRow {
  id: string;
  started_at: string;
  duration_seconds: number | null;
  status: string;
  outcome: string | null;
  sentiment: string | null;
  from_number: string | null;
  to_number: string | null;
  median_latency_ms: number | null;
  summary: string | null;
  phone_number_id: string | null;
  assistant_id: string | null;
}

// Per-assistant rollup shown on the Overview and Analytics pages.
export interface AssistantStat {
  id: string;
  name: string;
  number: string;
  calls: number;
  avgDuration: string;
  answerRate: number;
  bookings: number;
  positivePct: number;
}

// Monochrome charts: grays cycled across the top caller countries.
const COUNTRY_COLORS = ["#1D1D1D", "#404040", "#525252", "#737373", "#a3a3a3", "#d4d4d4"];
const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#16a34a",
  neutral: "#a3a3a3",
  negative: "#dc2626",
  frustrated: "#ea580c",
  angry: "#b91c1c",
};

function fmtDuration(sec: number | null): string {
  const s = Math.max(0, Math.round(sec ?? 0));
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}
function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}
function percentile(xs: number[], p: number): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}
function latencyFrom(calls: CallRow[]): Latency {
  const vals = calls
    .map((c) => c.median_latency_ms)
    .filter((v): v is number => typeof v === "number" && v > 0);
  return {
    medianMs: median(vals),
    p95Ms: percentile(vals, 95),
    targetMs: 800,
    spark: vals.slice(0, 7).reverse(),
  };
}
function pctDelta(recent: number, prior: number): number {
  if (prior === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - prior) / prior) * 1000) / 10;
}
function dayBuckets(calls: CallRow[], days: number, toKey: (d: Date) => string): Bar[] {
  const counts = new Map<string, number>();
  for (const c of calls) {
    const key = toKey(new Date(c.started_at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const [y, m, d] = toKey(new Date()).split("-").map(Number);
  const out: Bar[] = [];
  for (let i = days - 1; i >= 0; i--) {
    // Pure calendar arithmetic on the day key - no DST edge cases.
    const day = new Date(Date.UTC(y, m - 1, d - i));
    out.push({
      label: String(day.getUTCDate()),
      value: counts.get(day.toISOString().slice(0, 10)) ?? 0,
    });
  }
  return out;
}
/** Per-day values over the trailing `days`, oldest first (for KPI sparklines). */
function dailySeries(
  calls: CallRow[],
  days: number,
  toKey: (d: Date) => string,
  value: (dayCalls: CallRow[]) => number,
): number[] {
  const byDay = new Map<string, CallRow[]>();
  for (const c of calls) {
    const key = toKey(new Date(c.started_at));
    const bucket = byDay.get(key);
    if (bucket) bucket.push(c);
    else byDay.set(key, [c]);
  }
  const [y, m, d] = toKey(new Date()).split("-").map(Number);
  const out: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.UTC(y, m - 1, d - i)).toISOString().slice(0, 10);
    out.push(value(byDay.get(key) ?? []));
  }
  return out;
}


function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** A user's stats scope. Calls are matched primarily on the insert-time
 *  owner_id / assistant_id snapshots (same rule as the call log), so history
 *  survives a number being unassigned, pooled, or deleted - scoping on the
 *  numbers *currently* linked to the owner's assistants silently dropped all
 *  of it. The owner's assistants and current numbers only serve as fallbacks
 *  for unstamped rows (owner_id null). undefined = auth off, no scoping. */
interface CallScope {
  ownerId: string;
  assistantIds: string[];
  numberIds: string[];
}

// Cached per request: getOverview, getAssistantStats, and getAnalytics each
// need the same owner scope - without this it ran the assistants+numbers
// queries once per caller (3x) every render.
const ownerScope = cache(async (ownerId?: string | null): Promise<CallScope | undefined> => {
  if (!ownerId) return undefined;
  // Includes soft-deleted assistants on purpose: their call history still
  // belongs to this owner.
  const { data: assistants, error } = await serviceClient()
    .from("assistants")
    .select("id")
    .eq("owner_id", ownerId);
  if (error) throw error;
  const assistantIds = (assistants ?? []).map((a) => String((a as { id: string }).id));
  return {
    ownerId,
    assistantIds,
    numberIds: (await getOwnedNumbers(ownerId)).map((n) => n.id),
  };
});

function scopeFilter(scope: CallScope): string {
  // The assistant/number arms are fallbacks for unstamped rows ONLY - they must
  // not match a call another tenant owns. Numbers are pooled and recycled
  // across tenants, so an unconditioned phone_number_id arm would hand the new
  // holder the previous tenant's stamped call history (same recycled-number
  // rule the call log enforces in calls/log.ts).
  // ponytail: or-filter lives in the request URL, fine for tens of assistants
  // per owner; move to an RPC if a tenant ever owns hundreds.
  const parts = [`owner_id.eq.${scope.ownerId}`];
  if (scope.assistantIds.length > 0) {
    parts.push(`and(owner_id.is.null,assistant_id.in.(${scope.assistantIds.join(",")}))`);
  }
  if (scope.numberIds.length > 0) {
    parts.push(`and(owner_id.is.null,phone_number_id.in.(${scope.numberIds.join(",")}))`);
  }
  return parts.join(",");
}

async function fetchCalls(
  businessId: string,
  sinceIso: string,
  scope?: CallScope,
): Promise<CallRow[]> {
  // PostgREST silently caps a select at 1000 rows, so page until a short page.
  const PAGE = 1000;
  const rows: CallRow[] = [];
  for (let page = 0; ; page++) {
    let query = serviceClient()
      .from("calls")
      .select(
        "id,started_at,duration_seconds,status,outcome,sentiment,from_number,to_number,median_latency_ms,summary,phone_number_id,assistant_id",
      )
      .eq("business_id", businessId)
      .gte("started_at", sinceIso);
    if (scope) query = query.or(scopeFilter(scope));
    const { data, error } = await query
      .order("started_at", { ascending: false })
      .range(page * PAGE, (page + 1) * PAGE - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as CallRow[]));
    if (!data || data.length < PAGE) break;
    if (page >= 19) {
      // ponytail: 20k-row ceiling; move to server-side aggregation past that.
      console.warn(`fetchCalls: hit ${rows.length}-row cap, stats truncated`);
      break;
    }
  }
  return rows;
}

// ISO 3166 alpha-2 → English country name, via the platform Intl data (no map to
// maintain). Falls back to the raw code if the runtime can't resolve it.
let regionNames: Intl.DisplayNames | null = null;
function regionName(iso: string): string {
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(iso) ?? iso;
  } catch {
    return iso;
  }
}

// Share of calls by the caller's country (guessed from their E.164 number). Top
// six countries by volume, the rest folded into "Other".
function countriesFrom(calls: CallRow[]): Segment[] {
  const counts = new Map<string, number>();
  for (const c of calls) {
    const info = countryFromPhone(c.from_number ?? "");
    if (!info) continue;
    counts.set(info.iso, (counts.get(info.iso) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const segs: Segment[] = sorted.slice(0, 6).map(([iso, n], i) => ({
    label: `${flagEmoji(iso)} ${regionName(iso)}`.trim(),
    value: Math.round((n / total) * 100),
    color: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
  }));
  const rest = sorted.slice(6).reduce((s, [, n]) => s + n, 0);
  if (rest > 0) {
    segs.push({ label: "Other", value: Math.round((rest / total) * 100), color: "#e5e5e5" });
  }
  return segs;
}

async function talkRatio(callIds: string[]): Promise<Segment[]> {
  if (callIds.length === 0) return [];
  const { data, error } = await serviceClient()
    .from("call_turns")
    .select("role,text")
    .in("call_id", callIds.slice(0, 500))
    .limit(1000); // deliberate sample (like the 500-call slice) - ratio is approximate
  if (error) {
    console.warn("talkRatio: call_turns query failed, hiding the chart", error.message);
    return [];
  }
  let caller = 0;
  let ai = 0;
  for (const t of data ?? []) {
    const len = String(t.text ?? "").length;
    if (t.role === "caller") caller += len;
    else ai += len;
  }
  const total = caller + ai;
  if (total === 0) return [];
  return [
    { label: "Caller", value: Math.round((caller / total) * 100), color: "#1D1D1D" },
    { label: "AI", value: Math.round((ai / total) * 100), color: "#a3a3a3" },
  ];
}

// Ground truth for bookings: a completed "booking" action row (the calendar
// event really got created), not the LLM-labeled outcome - that stays a
// display label only. Chunked so the id list fits in a request URL.
async function bookedCallIds(callIds: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  for (let i = 0; i < callIds.length; i += 500) {
    const { data, error } = await serviceClient()
      .from("call_actions")
      .select("call_id")
      .eq("type", "booking")
      .eq("status", "done")
      .in("call_id", callIds.slice(i, i + 500));
    if (error) throw error;
    for (const r of data ?? []) out.add(String((r as { call_id: string }).call_id));
  }
  return out;
}

export async function getOverview(ownerId?: string | null): Promise<Overview> {
  const [businessId, scope, tz] = await Promise.all([
    ensureBusinessId(),
    ownerScope(ownerId),
    ownerTimezone(ownerId),
  ]);
  const toKey = dayKeyFn(tz);
  const atFmt = timeFmt(tz);
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 14);
  // "This month" is a true calendar month in the user's timezone, so fetch back
  // to the month start once it predates the 14-day KPI window (one day of slack
  // covers the timezone offset; the filters below trim the excess).
  const monthStartKey = `${toKey(now).slice(0, 8)}01`;
  const monthFetch = new Date(`${monthStartKey}T00:00:00Z`);
  monthFetch.setUTCDate(monthFetch.getUTCDate() - 1);
  const fetchSince = monthFetch < since ? monthFetch : since;
  const calls = await fetchCalls(businessId, fetchSince.toISOString(), scope);

  // KPI windows are whole calendar days in the user's timezone (today-6..today
  // vs the 7 days before), matching the sparkline buckets - a rolling cutoff
  // counted calls the sparks silently dropped, so the spark didn't sum to the
  // tile (getAnalytics trims its window the same way).
  const [y, m, d] = toKey(now).split("-").map(Number);
  const keyAt = (back: number) => new Date(Date.UTC(y, m - 1, d - back)).toISOString().slice(0, 10);
  const recentStartKey = keyAt(6);
  const priorStartKey = keyAt(13);
  const dayKey = (c: CallRow) => toKey(new Date(c.started_at));
  const recent = calls.filter((c) => dayKey(c) >= recentStartKey);
  const prior = calls.filter((c) => {
    const k = dayKey(c);
    return k >= priorStartKey && k < recentStartKey;
  });

  const [bookedIds, ratio] = await Promise.all([
    bookedCallIds(calls.map((c) => c.id)),
    talkRatio(recent.map((c) => c.id)),
  ]);

  const avg = (cs: CallRow[]) =>
    cs.length ? cs.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / cs.length : 0;
  const answerRate = (cs: CallRow[]) =>
    cs.length ? (cs.filter((c) => c.status === "completed").length / cs.length) * 100 : 0;
  const booked = (cs: CallRow[]) => cs.filter((c) => bookedIds.has(c.id)).length;

  // Each KPI gets its own daily series - one shared call-count spark under
  // "Avg call time" or "Answer rate" would just be a wrong chart.
  const spark = (value: (dayCalls: CallRow[]) => number) =>
    dailySeries(recent, 7, toKey, value);
  // Rates/averages are undefined (not zero) on days with no calls - plotting 0
  // would draw fake outage dips, so those days are skipped instead.
  const rateSpark = (value: (dayCalls: CallRow[]) => number) =>
    dailySeries(recent, 7, toKey, (cs) => (cs.length ? value(cs) : NaN)).filter(Number.isFinite);

  const kpis: Kpi[] = [
    {
      key: "calls",
      label: "Total calls",
      value: String(recent.length),
      delta: pctDelta(recent.length, prior.length),
      goodWhen: "up",
      spark: spark((cs) => cs.length),
    },
    {
      key: "avg",
      label: "Avg call time",
      value: fmtDuration(avg(recent)),
      delta: pctDelta(avg(recent), avg(prior)),
      goodWhen: "down",
      spark: rateSpark(avg),
    },
    {
      key: "answer",
      label: "Answer rate",
      value: `${Math.round(answerRate(recent))}%`,
      delta: pctDelta(answerRate(recent), answerRate(prior)),
      goodWhen: "up",
      spark: rateSpark(answerRate),
    },
    {
      key: "booked",
      label: "Appointments booked",
      value: String(booked(recent)),
      delta: pctDelta(booked(recent), booked(prior)),
      goodWhen: "up",
      spark: spark(booked),
    },
  ];

  const monthCalls = calls.filter((c) => toKey(new Date(c.started_at)) >= monthStartKey);
  const monthUsage: MonthUsage = {
    callsThisMonth: monthCalls.length,
    minutes: Math.round(
      monthCalls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / 60,
    ),
    bookings: booked(monthCalls),
  };

  const recentCalls: Call[] = calls.slice(0, 6).map((c) => ({
    id: c.id,
    name: c.from_number || "",
    number: c.from_number || "",
    flag: countryFromPhone(c.from_number ?? "")?.flag ?? "",
    duration: fmtDuration(c.duration_seconds),
    outcome: c.outcome ? capitalize(c.outcome) : "-",
    sentiment: (c.sentiment as Sentiment) || "neutral",
    time: relTime(c.started_at),
    at: atFmt(c.started_at),
  }));

  const summaries: Summary[] = calls
    .filter((c) => c.summary)
    .slice(0, 4)
    .map((c) => {
      const country = countryFromPhone(c.from_number ?? "");
      return {
        id: c.id,
        name: c.from_number || "",
        time: relTime(c.started_at),
        at: atFmt(c.started_at),
        text: c.summary ?? "",
        tags: country ? [`${country.flag} ${regionName(country.iso)}`.trim()] : [],
      };
    });

  return {
    kpis,
    callVolume: dayBuckets(calls, 14, toKey),
    talkRatio: ratio,
    countries: countriesFrom(recent),
    latency: latencyFrom(recent),
    monthUsage,
    recentCalls,
    summaries,
  };
}

interface NumberMeta {
  assistantId: string | null;
  assistantName: string;
  e164: string;
}

// Map phone_number_id -> its assistant, so calls can be grouped per assistant.
async function numberMeta(numberIds?: string[]): Promise<Map<string, NumberMeta>> {
  if (numberIds && numberIds.length === 0) return new Map();
  let query = serviceClient()
    .from("phone_numbers")
    .select("id,e164,assistant_id,assistant:assistants(name)");
  if (numberIds) query = query.in("id", numberIds);
  const { data, error } = await query;
  if (error) throw error;
  const map = new Map<string, NumberMeta>();
  for (const r of data ?? []) {
    const row = r as Record<string, unknown>;
    const assistant = row.assistant as { name?: string } | { name?: string }[] | null;
    const name = Array.isArray(assistant) ? assistant[0]?.name : assistant?.name;
    map.set(String(row.id), {
      assistantId: row.assistant_id ? String(row.assistant_id) : null,
      assistantName: name ?? "",
      e164: String(row.e164 ?? ""),
    });
  }
  return map;
}

/** Per-assistant call stats over the last `days`. Calls on numbers not linked to
 *  an assistant are grouped under a single "Unassigned" row. */
export async function getAssistantStats(
  ownerId?: string | null,
  days = 30,
  organizationId?: string | null,
): Promise<AssistantStat[]> {
  const [businessId, scope, org] = await Promise.all([
    ensureBusinessId(),
    ownerScope(ownerId),
    organizationId ? organizationScope(organizationId) : null,
  ]);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [fetched, meta] = await Promise.all([
    fetchCalls(businessId, since.toISOString(), scope),
    numberMeta(scope?.numberIds),
  ]);
  const calls = org ? fetched.filter(inOrganization(org)) : fetched;
  const bookedIds = await bookedCallIds(calls.map((c) => c.id));

  // Group on the call's own assistant_id - snapshotted at insert by the
  // set_call_assignment trigger, so history survives number reassignment. The
  // number's current assistant only names the group and covers legacy rows.
  const byAssistant = new Map<string, { name: string; e164: string }>();
  for (const m of meta.values()) {
    if (m.assistantId) byAssistant.set(m.assistantId, { name: m.assistantName, e164: m.e164 });
  }
  const groups = new Map<string, { name: string; number: string; calls: CallRow[] }>();
  for (const c of calls) {
    const id =
      c.assistant_id ??
      (c.phone_number_id ? meta.get(c.phone_number_id)?.assistantId : null) ??
      "unassigned";
    if (!groups.has(id)) {
      const m = byAssistant.get(id);
      groups.set(id, { name: m?.name || "Unassigned", number: m?.e164 ?? "", calls: [] });
    }
    groups.get(id)!.calls.push(c);
  }

  // Surface assistants that own a number but have no calls yet, so each shows
  // up (restricted to the organization when that filter is active).
  for (const m of meta.values()) {
    const id = m.assistantId ?? "unassigned";
    if (org && !(m.assistantId && org.assistantIds.has(m.assistantId))) continue;
    if (m.assistantId && !groups.has(id)) {
      groups.set(id, { name: m.assistantName || "Assistant", number: m.e164, calls: [] });
    }
  }

  // Name assistants that no longer hold a number (deleted/reassigned away) but
  // still own call history via the snapshot.
  const unnamed = [...groups.keys()].filter((id) => id !== "unassigned" && !byAssistant.has(id));
  if (unnamed.length > 0) {
    const { data } = await serviceClient().from("assistants").select("id,name").in("id", unnamed);
    for (const r of data ?? []) {
      const row = r as { id: string; name: string | null };
      const g = groups.get(String(row.id));
      if (g) g.name = row.name || "Assistant";
    }
  }

  return [...groups.entries()]
    .map(([id, g]) => {
      const total = g.calls.length;
      const completed = g.calls.filter((c) => c.status === "completed").length;
      const positive = g.calls.filter((c) => c.sentiment === "positive").length;
      const avgSec = total
        ? g.calls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / total
        : 0;
      return {
        id,
        name: g.name,
        number: g.number,
        calls: total,
        avgDuration: fmtDuration(avgSec),
        answerRate: total ? Math.round((completed / total) * 100) : 0,
        bookings: g.calls.filter((c) => bookedIds.has(c.id)).length,
        positivePct: total ? Math.round((positive / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.calls - a.calls);
}

/** Active phone-number ids linked to a single assistant. */
async function assistantNumberIds(assistantId: string): Promise<string[]> {
  const { data, error } = await serviceClient()
    .from("phone_numbers")
    .select("id")
    .eq("assistant_id", assistantId)
    .is("deleted_at", null);
  if (error) throw error;
  return (data ?? []).map((r) => String((r as { id: string }).id));
}

/** An organization's assistants + their active numbers, for post-filtering
 *  calls (on the snapshot columns, same rule as the owner scope). */
interface OrgScope {
  assistantIds: Set<string>;
  numberIds: Set<string>;
}

async function organizationScope(organizationId: string): Promise<OrgScope> {
  const sb = serviceClient();
  const { data: assistants, error: aErr } = await sb
    .from("assistants")
    .select("id")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);
  if (aErr) throw aErr;
  const assistantIds = new Set((assistants ?? []).map((a) => String((a as { id: string }).id)));
  if (assistantIds.size === 0) return { assistantIds, numberIds: new Set() };

  const { data: numbers, error: nErr } = await sb
    .from("phone_numbers")
    .select("id")
    .in("assistant_id", [...assistantIds])
    .is("deleted_at", null);
  if (nErr) throw nErr;
  return {
    assistantIds,
    numberIds: new Set((numbers ?? []).map((r) => String((r as { id: string }).id))),
  };
}

const inOrganization =
  (org: OrgScope) =>
  (c: CallRow): boolean =>
    (c.assistant_id !== null && org.assistantIds.has(c.assistant_id)) ||
    (c.phone_number_id !== null && org.numberIds.has(c.phone_number_id));

export async function getAnalytics(
  ownerId?: string | null,
  assistantId?: string | null,
  organizationId?: string | null,
): Promise<Analytics> {
  // Owner scope matches calls on the insert-time owner/assistant snapshots (plus
  // current numbers for legacy rows); an organization filter then narrows within
  // that scope, so it can never widen it. The assistant filter applies per call,
  // below.
  const [businessId, scope, org, tz] = await Promise.all([
    ensureBusinessId(),
    ownerScope(ownerId),
    organizationId ? organizationScope(organizationId) : null,
    ownerTimezone(ownerId),
  ]);
  const toKey = dayKeyFn(tz);
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 30);
  let calls = await fetchCalls(businessId, since.toISOString(), scope);
  if (org) calls = calls.filter(inOrganization(org));
  // Trim the rolling fetch window to whole bucket days so the volume chart
  // sums to the totals tile.
  const [y, m, d] = toKey(now).split("-").map(Number);
  const firstKey = new Date(Date.UTC(y, m - 1, d - 29)).toISOString().slice(0, 10);
  calls = calls.filter((c) => toKey(new Date(c.started_at)) >= firstKey);
  if (assistantId) {
    // Filter on the call's snapshotted assistant_id (set at insert, immune to
    // number reassignment); the current-number mapping covers legacy rows.
    const fallback = new Set(await assistantNumberIds(assistantId));
    calls = calls.filter((c) =>
      c.assistant_id
        ? c.assistant_id === assistantId
        : c.phone_number_id !== null && fallback.has(c.phone_number_id),
    );
  }
  // Both scans run over the same filtered call set, so the talk split and
  // latency respect the org/assistant filters - which is the point of moving
  // them here from the (unfilterable) overview.
  const [bookedIds, ratio] = await Promise.all([
    bookedCallIds(calls.map((c) => c.id)),
    talkRatio(calls.map((c) => c.id)),
  ]);

  const completed = calls.filter((c) => c.status === "completed").length;
  const sentimentCounts = new Map<string, number>();
  for (const c of calls) {
    const key = c.sentiment ?? "neutral";
    sentimentCounts.set(key, (sentimentCounts.get(key) ?? 0) + 1);
  }
  const sentTotal = calls.length || 1;
  const sentiment: Segment[] = [...sentimentCounts.entries()].map(([key, n]) => ({
    label: capitalize(key),
    value: Math.round((n / sentTotal) * 100),
    color: SENTIMENT_COLORS[key] ?? "#a3a3a3",
  }));

  return {
    totals: {
      calls: calls.length,
      avgDuration: fmtDuration(
        calls.length
          ? calls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / calls.length
          : 0,
      ),
      answerRate: `${calls.length ? Math.round((completed / calls.length) * 100) : 0}%`,
      bookings: calls.filter((c) => bookedIds.has(c.id)).length,
    },
    volume: dayBuckets(calls, 30, toKey),
    countries: countriesFrom(calls),
    sentiment,
    talkRatio: ratio,
    latency: latencyFrom(calls),
  };
}

// Cross-request cache for the dashboard's heavy call-table scans. A language
// switch (router.refresh) or a quick re-navigation reuses the last result
// instead of re-scanning calls - the data is unchanged, so it's free for those
// cases; genuinely new calls still surface within the revalidate window. Keyed
// by owner so tenants never share a cache entry. Bump/lower DASH_TTL to trade
// freshness for speed, or revalidateTag("dashboard-data") from a write path.
const DASH_TTL = 30;

export const getOverviewCached = (ownerId?: string | null): Promise<Overview> =>
  unstable_cache(() => getOverview(ownerId), ["dash-overview", ownerId ?? "anon"], {
    revalidate: DASH_TTL,
    tags: ["dashboard-data"],
  })();

export const getAssistantStatsCached = (
  ownerId?: string | null,
  days = 30,
): Promise<AssistantStat[]> =>
  unstable_cache(
    () => getAssistantStats(ownerId, days),
    ["dash-assistant-stats", ownerId ?? "anon", String(days)],
    { revalidate: DASH_TTL, tags: ["dashboard-data"] },
  )();
