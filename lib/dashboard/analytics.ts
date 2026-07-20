import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getOwnedNumbers } from "./db";
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
  /** English fallback. Never render this where a dictionary key exists. */
  label: string;
  /**
   * Stable, non-localized identity (e.g. the raw sentiment value) for callers
   * that map to dictionary copy. Set where a mapping exists, absent otherwise.
   */
  key?: string;
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
export interface TodayUsage {
  calls: number;
  answered: number;
  missed: number;
  booked: number;
}
export type Sentiment = "positive" | "neutral" | "negative" | "frustrated" | "angry";
export interface Call {
  id: string;
  name: string;
  number: string;
  flag: string; // caller's country flag emoji, "" when unknown
  duration: string;
  /**
   * Raw DB outcome (booked / message / transferred / resolved / abandoned), or
   * null when the call had none. Deliberately NOT capitalized or localized
   * here: these results are cached without a locale in the key, so localizing
   * would serve one user's language to the next. Map at render.
   */
  outcome: string | null;
  sentiment: Sentiment;
  /** Minutes since the call started. Formatted at render, for the same reason. */
  agoMinutes: number;
  at: string;
}
export interface Summary {
  id: string;
  name: string;
  time: string;
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
  today: TodayUsage;
  recentCalls: Call[];
  summaries: Summary[];
}

export interface Analytics {
  totals: { calls: number; avgDuration: string; answerRate: string; bookings: number };
  volume: Bar[];
  countries: Segment[];
  sentiment: Segment[];
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

interface CallScope {
  ownerId: string;
  assistantIds: string[];
  numberIds: string[];
}

const ownerScope = cache(async (ownerId?: string | null): Promise<CallScope | undefined> => {
  if (!ownerId) return undefined;
  const [assistantsRes, numbers] = await Promise.all([
    serviceClient().from("assistants").select("id").eq("owner_id", ownerId),
    getOwnedNumbers(ownerId),
  ]);
  if (assistantsRes.error) throw assistantsRes.error;
  const assistantIds = (assistantsRes.data ?? []).map((a) => String((a as { id: string }).id));
  return {
    ownerId,
    assistantIds,
    numberIds: numbers.map((n) => n.id),
  };
});

function scopeFilter(scope: CallScope): string {
  const parts = [`owner_id.eq.${scope.ownerId}`];
  if (scope.assistantIds.length > 0) {
    parts.push(`and(owner_id.is.null,assistant_id.in.(${scope.assistantIds.join(",")}))`);
  }
  if (scope.numberIds.length > 0) {
    parts.push(`and(owner_id.is.null,phone_number_id.in.(${scope.numberIds.join(",")}))`);
  }
  return parts.join(",");
}

// Overview, analytics, and per-assistant stats all scan the same window; the
// minute-floor makes their `since` values identical so the react cache() below
// dedupes the paged scan within one request.
function minuteFloor(iso: string): string {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? new Date(Math.floor(ms / 60_000) * 60_000).toISOString() : iso;
}

function fetchCalls(sinceIso: string, scope?: CallScope): Promise<CallRow[]> {
  return fetchCallsMemo(minuteFloor(sinceIso), scope);
}

const fetchCallsMemo = cache(async function fetchCallsPaged(
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
});

let regionNames: Intl.DisplayNames | null = null;
function regionName(iso: string): string {
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(iso) ?? iso;
  } catch {
    return iso;
  }
}

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
  const [scope, tz] = await Promise.all([ownerScope(ownerId), ownerTimezone(ownerId)]);
  const toKey = dayKeyFn(tz);
  const atFmt = timeFmt(tz);
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 14);
  const monthStartKey = `${toKey(now).slice(0, 8)}01`;
  const monthFetch = new Date(`${monthStartKey}T00:00:00Z`);
  monthFetch.setUTCDate(monthFetch.getUTCDate() - 1);
  const fetchSince = monthFetch < since ? monthFetch : since;
  const calls = await fetchCalls(fetchSince.toISOString(), scope);

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

  const spark = (value: (dayCalls: CallRow[]) => number) =>
    dailySeries(recent, 7, toKey, value);
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

  // Today, in the owner's timezone. "answered" mirrors the answer-rate rule
  // (status === "completed"); everything else counts as missed.
  const todayKey = toKey(now);
  const todayCalls = calls.filter((c) => dayKey(c) === todayKey);
  const answeredToday = todayCalls.filter((c) => c.status === "completed").length;
  const today: TodayUsage = {
    calls: todayCalls.length,
    answered: answeredToday,
    missed: todayCalls.length - answeredToday,
    booked: booked(todayCalls),
  };

  // 20, not 6: the Home activity feed is a scroll region now, so it needs
  // enough rows to be worth scrolling.
  const recentCalls: Call[] = calls.slice(0, 20).map((c) => ({
    id: c.id,
    name: c.from_number || "",
    number: c.from_number || "",
    flag: countryFromPhone(c.from_number ?? "")?.flag ?? "",
    duration: fmtDuration(c.duration_seconds),
    outcome: c.outcome ?? null,
    sentiment: (c.sentiment as Sentiment) || "neutral",
    agoMinutes: Math.max(0, Math.floor((Date.now() - new Date(c.started_at).getTime()) / 60000)),
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
    today,
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

export async function getAssistantStats(
  ownerId?: string | null,
  days = 30,
  organizationId?: string | null,
): Promise<AssistantStat[]> {
  const [scope, org] = await Promise.all([
    ownerScope(ownerId),
    organizationId ? organizationScope(organizationId) : null,
  ]);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [fetched, meta] = await Promise.all([
    fetchCalls(since.toISOString(), scope),
    numberMeta(scope?.numberIds),
  ]);
  const calls = org ? fetched.filter(inOrganization(org)) : fetched;
  const bookedIds = await bookedCallIds(calls.map((c) => c.id));

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

  for (const m of meta.values()) {
    const id = m.assistantId ?? "unassigned";
    if (org && !(m.assistantId && org.assistantIds.has(m.assistantId))) continue;
    if (m.assistantId && !groups.has(id)) {
      groups.set(id, { name: m.assistantName || "Assistant", number: m.e164, calls: [] });
    }
  }

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

async function assistantNumberIds(assistantId: string): Promise<string[]> {
  const { data, error } = await serviceClient()
    .from("phone_numbers")
    .select("id")
    .eq("assistant_id", assistantId)
    .is("deleted_at", null);
  if (error) throw error;
  return (data ?? []).map((r) => String((r as { id: string }).id));
}

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
  const [scope, org, tz] = await Promise.all([
    ownerScope(ownerId),
    organizationId ? organizationScope(organizationId) : null,
    ownerTimezone(ownerId),
  ]);
  const toKey = dayKeyFn(tz);
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 30);
  let calls = await fetchCalls(since.toISOString(), scope);
  if (org) calls = calls.filter(inOrganization(org));
  const [y, m, d] = toKey(now).split("-").map(Number);
  const firstKey = new Date(Date.UTC(y, m - 1, d - 29)).toISOString().slice(0, 10);
  calls = calls.filter((c) => toKey(new Date(c.started_at)) >= firstKey);
  if (assistantId) {
    const fallback = new Set(await assistantNumberIds(assistantId));
    calls = calls.filter((c) =>
      c.assistant_id
        ? c.assistant_id === assistantId
        : c.phone_number_id !== null && fallback.has(c.phone_number_id),
    );
  }
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
    key,
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

const DASH_TTL = 30;

export const getOverviewCached = (ownerId?: string | null): Promise<Overview> =>
  unstable_cache(() => getOverview(ownerId), ["dash-overview", ownerId ?? "anon"], {
    revalidate: DASH_TTL,
    tags: ["dashboard-data"],
  })();

export const getAssistantStatsCached = (
  ownerId?: string | null,
  days = 30,
  organizationId?: string | null,
): Promise<AssistantStat[]> =>
  unstable_cache(
    () => getAssistantStats(ownerId, days, organizationId),
    ["dash-assistant-stats", ownerId ?? "anon", String(days), organizationId ?? ""],
    { revalidate: DASH_TTL, tags: ["dashboard-data"] },
  )();

export const getAnalyticsCached = (
  ownerId?: string | null,
  assistantId?: string | null,
  organizationId?: string | null,
): Promise<Analytics> =>
  unstable_cache(
    () => getAnalytics(ownerId, assistantId, organizationId),
    ["dash-analytics", ownerId ?? "anon", assistantId ?? "", organizationId ?? ""],
    { revalidate: DASH_TTL, tags: ["dashboard-data"] },
  )();
