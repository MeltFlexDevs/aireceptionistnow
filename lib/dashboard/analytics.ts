import { ensureBusinessId, getOwnedNumbers } from "./db";
import { serviceClient } from "./supabase";
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
}
export interface Summary {
  id: string;
  name: string;
  time: string;
  text: string;
  tags: string[];
}

export interface Overview {
  kpis: Kpi[];
  callVolume: Bar[];
  talkRatio: Segment[];
  countries: Segment[];
  monthUsage: MonthUsage;
  recentCalls: Call[];
  summaries: Summary[];
}

export interface Analytics {
  totals: { calls: number; avgDuration: string; answerRate: string; bookings: number };
  volume: Bar[];
  countries: Segment[];
  sentiment: Segment[];
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
  summary: string | null;
  phone_number_id: string | null;
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
const COUNTRY_COLORS = ["#171717", "#404040", "#525252", "#737373", "#a3a3a3", "#d4d4d4"];
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
function pctDelta(recent: number, prior: number): number {
  if (prior === 0) return recent > 0 ? 100 : 0;
  return Math.round(((recent - prior) / prior) * 1000) / 10;
}
function dayBuckets(calls: CallRow[], days: number): Bar[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const out: Bar[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date(today);
    start.setDate(today.getDate() - i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const value = calls.filter((c) => {
      const t = new Date(c.started_at);
      return t >= start && t < end;
    }).length;
    out.push({ label: String(start.getDate()), value });
  }
  return out;
}
function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

async function fetchCalls(
  businessId: string,
  sinceIso: string,
  numberIds?: string[],
): Promise<CallRow[]> {
  if (numberIds && numberIds.length === 0) return [];
  let query = serviceClient()
    .from("calls")
    .select(
      "id,started_at,duration_seconds,status,outcome,sentiment,from_number,to_number,summary,phone_number_id",
    )
    .eq("business_id", businessId)
    .gte("started_at", sinceIso);
  if (numberIds) query = query.in("phone_number_id", numberIds);
  const { data, error } = await query.order("started_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CallRow[];
}

// Restrict stats to a user's assistants' numbers. undefined = no scoping
// (auth off); [] = the user owns no numbers, so no calls.
async function scopedNumberIds(ownerId?: string | null): Promise<string[] | undefined> {
  if (!ownerId) return undefined;
  return (await getOwnedNumbers(ownerId)).map((n) => n.id);
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
  const { data } = await serviceClient()
    .from("call_turns")
    .select("role,text")
    .in("call_id", callIds.slice(0, 500));
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
    { label: "Caller", value: Math.round((caller / total) * 100), color: "#171717" },
    { label: "AI", value: Math.round((ai / total) * 100), color: "#a3a3a3" },
  ];
}

export async function getOverview(ownerId?: string | null): Promise<Overview> {
  const businessId = await ensureBusinessId();
  const numberIds = await scopedNumberIds(ownerId);
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 14);
  const calls = await fetchCalls(businessId, since.toISOString(), numberIds);

  const split = new Date(now);
  split.setDate(now.getDate() - 7);
  const recent = calls.filter((c) => new Date(c.started_at) >= split);
  const prior = calls.filter((c) => new Date(c.started_at) < split);

  const spark = dayBuckets(recent, 7).map((b) => b.value);
  const avg = (cs: CallRow[]) =>
    cs.length ? cs.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / cs.length : 0;
  const answerRate = (cs: CallRow[]) =>
    cs.length ? (cs.filter((c) => c.status === "completed").length / cs.length) * 100 : 0;
  const booked = (cs: CallRow[]) => cs.filter((c) => c.outcome === "booked").length;

  const kpis: Kpi[] = [
    {
      key: "calls",
      label: "Total calls",
      value: String(recent.length),
      delta: pctDelta(recent.length, prior.length),
      goodWhen: "up",
      spark,
    },
    {
      key: "avg",
      label: "Avg call time",
      value: fmtDuration(avg(recent)),
      delta: pctDelta(avg(recent), avg(prior)),
      goodWhen: "down",
      spark,
    },
    {
      key: "answer",
      label: "Answer rate",
      value: `${Math.round(answerRate(recent))}%`,
      delta: pctDelta(answerRate(recent), answerRate(prior)),
      goodWhen: "up",
      spark,
    },
    {
      key: "booked",
      label: "Appointments booked",
      value: String(booked(recent)),
      delta: pctDelta(booked(recent), booked(prior)),
      goodWhen: "up",
      spark,
    },
  ];

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthCalls = calls.filter((c) => new Date(c.started_at) >= monthStart);
  const monthUsage: MonthUsage = {
    callsThisMonth: monthCalls.length,
    minutes: Math.round(
      monthCalls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / 60,
    ),
    bookings: booked(monthCalls),
  };

  const recentCalls: Call[] = calls.slice(0, 6).map((c) => ({
    id: c.id,
    name: c.from_number || "Unknown caller",
    number: c.from_number || "",
    flag: countryFromPhone(c.from_number ?? "")?.flag ?? "",
    duration: fmtDuration(c.duration_seconds),
    outcome: c.outcome ? capitalize(c.outcome) : "—",
    sentiment: (c.sentiment as Sentiment) || "neutral",
    time: relTime(c.started_at),
  }));

  const summaries: Summary[] = calls
    .filter((c) => c.summary)
    .slice(0, 4)
    .map((c) => {
      const country = countryFromPhone(c.from_number ?? "");
      return {
        id: c.id,
        name: c.from_number || "Unknown caller",
        time: relTime(c.started_at),
        text: c.summary ?? "",
        tags: country ? [`${country.flag} ${regionName(country.iso)}`.trim()] : [],
      };
    });

  return {
    kpis,
    callVolume: dayBuckets(calls, 14),
    talkRatio: await talkRatio(recent.map((c) => c.id)),
    countries: countriesFrom(recent),
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
  const businessId = await ensureBusinessId();
  let numberIds = await scopedNumberIds(ownerId);
  if (organizationId) {
    numberIds = intersectScope(numberIds, await organizationNumberIds(organizationId));
  }
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [calls, meta] = await Promise.all([
    fetchCalls(businessId, since.toISOString(), numberIds),
    numberMeta(numberIds),
  ]);

  const groups = new Map<string, { name: string; number: string; calls: CallRow[] }>();
  for (const c of calls) {
    const m = c.phone_number_id ? meta.get(c.phone_number_id) : undefined;
    const id = m?.assistantId ?? "unassigned";
    if (!groups.has(id)) {
      groups.set(id, {
        name: m?.assistantName || "Unassigned",
        number: m?.e164 ?? "",
        calls: [],
      });
    }
    groups.get(id)!.calls.push(c);
  }

  // Surface assistants that own a number but have no calls yet, so each shows up.
  for (const [numberId, m] of meta) {
    void numberId;
    const id = m.assistantId ?? "unassigned";
    if (m.assistantId && !groups.has(id)) {
      groups.set(id, { name: m.assistantName || "Assistant", number: m.e164, calls: [] });
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
        bookings: g.calls.filter((c) => c.outcome === "booked").length,
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

/** Active phone-number ids across every assistant in an organization. */
async function organizationNumberIds(organizationId: string): Promise<string[]> {
  const sb = serviceClient();
  const { data: assistants, error: aErr } = await sb
    .from("assistants")
    .select("id")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);
  if (aErr) throw aErr;
  const assistantIds = (assistants ?? []).map((a) => String((a as { id: string }).id));
  if (assistantIds.length === 0) return [];

  const { data: numbers, error: nErr } = await sb
    .from("phone_numbers")
    .select("id")
    .in("assistant_id", assistantIds)
    .is("deleted_at", null);
  if (nErr) throw nErr;
  return (numbers ?? []).map((r) => String((r as { id: string }).id));
}

/** Intersect a number-id scope with an extra filter set. undefined scope (auth
 *  off) becomes the filter; otherwise keep only ids present in both. */
function intersectScope(
  scope: string[] | undefined,
  filter: string[],
): string[] {
  return scope ? scope.filter((id) => filter.includes(id)) : filter;
}

export async function getAnalytics(
  ownerId?: string | null,
  assistantId?: string | null,
  organizationId?: string | null,
): Promise<Analytics> {
  const businessId = await ensureBusinessId();
  // Owner scopes to all their numbers; an organization filter narrows to its
  // assistants' numbers, and an assistant filter narrows further — each
  // intersected with the owner scope so a filter can never widen it.
  let numberIds = await scopedNumberIds(ownerId);
  if (organizationId) {
    numberIds = intersectScope(numberIds, await organizationNumberIds(organizationId));
  }
  if (assistantId) {
    numberIds = intersectScope(numberIds, await assistantNumberIds(assistantId));
  }
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 30);
  const calls = await fetchCalls(businessId, since.toISOString(), numberIds);

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
      bookings: calls.filter((c) => c.outcome === "booked").length,
    },
    volume: dayBuckets(calls, 30),
    countries: countriesFrom(calls),
    sentiment,
  };
}
