import type { CSSProperties } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { getOverviewCached, getAssistantStatsCached } from "@/lib/dashboard/analytics";
import { currentUserId } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { StatCard } from "./components/StatCard";
import { SectionCard } from "./components/SectionCard";
import { BarChart } from "./components/BarChart";
import { DonutChart } from "./components/DonutChart";
import { RecentCalls } from "./components/RecentCalls";
import { CallSummaries } from "./components/CallSummaries";
import { AssistantStats } from "./components/AssistantStats";
import { PlanUsage } from "./components/PlanUsage";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { PageHeader } from "./components/PageHeader";
import { Skeleton } from "./components/Skeleton";
import { Bolt, Hash, Phone, Plus } from "./icons";

export const dynamic = "force-dynamic";

function latencyPoints(values: number[]): string {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100;
      const y = 24 - ((v - min) / span) * 20 - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function SectionError({ what }: { what: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      Couldn&apos;t load {what}. Refresh to try again.
    </div>
  );
}

// Body skeleton shown while the overview's analytics stream in. The header above
// is already painted, so this covers just the KPI tiles + charts and keeps the
// layout from jumping when real data lands.
function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shape-card glass space-y-3 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-7 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="shape-card glass space-y-4 p-5 lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-44 w-full" />
        </div>
        <div className="shape-card glass space-y-4 p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}

// Synchronous-ish shell: the header paints immediately (the dictionary read is a
// cookie lookup, not a query), and the analytics-heavy body streams in behind
// OverviewSkeleton - so first paint stays instant.
export default async function OverviewPage() {
  const t = await getDictionary();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.overview.title}
        description={t.overview.description}
        action={
          <Link
            href="/dashboard/assistant"
            className="press inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-900 px-3 text-sm font-medium text-white shadow-card hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            {t.common.newAssistant}
          </Link>
        }
      />
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewBody t={t} />
      </Suspense>
    </div>
  );
}

async function OverviewBody({ t }: { t: Dictionary }) {
  const o = t.overview;
  // Each source loads independently so one failed query degrades its own
  // section instead of blanking the whole overview.
  const ownerId = await currentUserId();
  const [dataR, assistantsR, planR] = await Promise.allSettled([
    getOverviewCached(ownerId),
    getAssistantStatsCached(ownerId, 14),
    getPlanContextCached(ownerId),
  ]);
  const data = dataR.status === "fulfilled" ? dataR.value : null;
  const assistants = assistantsR.status === "fulfilled" ? assistantsR.value : null;
  const planCtx = planR.status === "fulfilled" ? planR.value : null;
  const loadError = dataR.status === "rejected" ? (dataR.reason as Error).message : "";
  // Prominent "numbers assigned / max" glance for the top of the overview (the
  // Plan card lower down still shows the full meter). Hidden if usage can't load.
  const numbersBadge = planCtx ? (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-card">
      <span className="flex items-center gap-2 text-sm text-neutral-600">
        <Hash className="h-4 w-4 text-neutral-400" />
        {t.nav.numbers}
      </span>
      <span className="text-sm font-medium tabular-nums text-neutral-900">
        {planCtx.usage.numbers}
        <span className="text-neutral-400">
          {" / "}
          {Number.isFinite(planCtx.limits.phoneNumbers) ? planCtx.limits.phoneNumbers : "∞"}
        </span>
      </span>
    </div>
  ) : null;

  if (!data) {
    return (
      <div className="space-y-6 rise">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {o.loadError}
          {loadError ? `: ${loadError}` : ""}.
        </div>
        {planCtx && <PlanUsage ctx={planCtx} />}
        {assistants && assistants.length > 0 && (
          <SectionCard title={o.assistants} subtitle={o.assistantsSub}>
            <AssistantStats stats={assistants} />
          </SectionCard>
        )}
      </div>
    );
  }

  if (data.recentCalls.length === 0) {
    return (
      <div className="space-y-6 rise">
        {planCtx && <PlanUsage ctx={planCtx} />}
        <SectionCard>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-medium text-neutral-900">{o.noCallsTitle}</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">{o.noCallsBody}</p>
            </div>
            <Link
              href="/dashboard/assistant"
              className="press mt-2 inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white shadow-card hover:bg-neutral-800"
            >
              {o.setUpAssistant}
            </Link>
          </div>
        </SectionCard>
        {assistants && assistants.length > 0 && (
          <SectionCard title={o.assistants} subtitle={o.assistantsSub}>
            <AssistantStats stats={assistants} />
          </SectionCard>
        )}
      </div>
    );
  }

  const caller = data.talkRatio.find((s) => s.label === "Caller")?.value ?? 0;
  const underTarget = data.latency.medianMs > 0 && data.latency.medianMs <= data.latency.targetMs;
  // KPI + segment labels come back from the (locale-free) analytics layer keyed
  // in English; translate them here at render.
  const kpiLabels: Record<string, string> = {
    calls: t.data.kpiCalls,
    avg: t.data.kpiAvg,
    answer: t.data.kpiAnswer,
    booked: t.data.kpiBooked,
  };
  const talkLabel = (label: string) =>
    label === "Caller" ? t.data.talkCaller : label === "AI" ? t.data.talkAi : label;

  return (
    <div className="space-y-6 rise">
      {numbersBadge}
      <div className="rise-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi, i) => (
          <div key={kpi.key} style={{ "--i": i } as CSSProperties}>
            <StatCard kpi={{ ...kpi, label: kpiLabels[kpi.key] ?? kpi.label }} />
          </div>
        ))}
      </div>

      {planCtx && <PlanUsage ctx={planCtx} />}

      <SectionCard title={o.assistants} subtitle={o.assistantsSub}>
        {assistants ? <AssistantStats stats={assistants} /> : <SectionError what="assistant stats" />}
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title={o.callVolume} subtitle={o.callVolumeSub}>
          <BarChart data={data.callVolume} />
        </SectionCard>
        <SectionCard title={o.talkRatio} subtitle={o.talkRatioSub}>
          {data.talkRatio.length > 0 ? (
            <DonutChart
              segments={data.talkRatio.map((s) => ({ ...s, label: talkLabel(s.label) }))}
              centerLabel={`${caller}%`}
              centerSub={t.data.talkCaller}
            />
          ) : (
            <p className="text-sm text-neutral-500">{o.noConversation}</p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title={o.voiceLatency} subtitle={o.voiceLatencySub}>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[28px] font-medium leading-none tracking-tight text-neutral-900">
                {data.latency.medianMs > 0 ? data.latency.medianMs : "-"}
                {data.latency.medianMs > 0 && <span className="ml-1 text-base font-normal text-neutral-400">ms</span>}
              </div>
              {data.latency.medianMs > 0 && (
                <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${underTarget ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  <Bolt className="h-3 w-3" />
                  {underTarget ? "Under" : "Over"} {data.latency.targetMs}ms target
                </span>
              )}
            </div>
            {data.latency.spark.length > 1 && (
              <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-10 w-28">
                <polyline points={latencyPoints(data.latency.spark)} fill="none" stroke="#1D1D1D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
          </div>
          <div className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500">
            p95 <span className="font-medium text-neutral-900">{data.latency.p95Ms > 0 ? `${data.latency.p95Ms}ms` : "-"}</span>
          </div>
        </SectionCard>

        <SectionCard title={o.callersByCountry} subtitle={o.callersByCountrySub}>
          {data.countries.length > 0 ? (
            <ul className="space-y-3">
              {data.countries.map((c) => (
                <li key={c.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">{c.label === "Other" ? t.data.countryOther : c.label}</span>
                    <span className="font-medium text-neutral-900">{c.value}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">{o.noCalls}</p>
          )}
        </SectionCard>

        <SectionCard title={o.thisMonth} subtitle={o.thisMonthSub}>
          <div className="text-[28px] font-medium leading-none tracking-tight text-neutral-900">
            {data.monthUsage.callsThisMonth.toLocaleString()}
            <span className="ml-1 text-sm text-neutral-400 lowercase">{t.nav.calls}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4">
            <div>
              <div className="text-lg font-medium text-neutral-900">{data.monthUsage.minutes.toLocaleString()}</div>
              <div className="text-xs text-neutral-400">{o.talkMinutes}</div>
            </div>
            <div>
              <div className="text-lg font-medium text-neutral-900">{data.monthUsage.bookings}</div>
              <div className="text-xs text-neutral-400">{o.bookings}</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title={o.recentCalls}
          action={
            <Link
              href="/dashboard/calls"
              className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {t.common.viewAll} →
            </Link>
          }
        >
          <RecentCalls calls={data.recentCalls} />
        </SectionCard>
        <SectionCard title={o.aiSummaries} subtitle={o.aiSummariesSub}>
          {data.summaries.length > 0 ? (
            <CallSummaries items={data.summaries} />
          ) : (
            <p className="text-sm text-neutral-500">{o.noSummaries}</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
