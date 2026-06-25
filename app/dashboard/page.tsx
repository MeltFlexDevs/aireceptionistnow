import Link from "next/link";
import { kpis, callVolume, talkRatio, outcomes, latency, monthUsage, recentCalls, callSummaries } from "./data";
import { StatCard } from "./components/StatCard";
import { SectionCard } from "./components/SectionCard";
import { BarChart } from "./components/BarChart";
import { DonutChart } from "./components/DonutChart";
import { RecentCalls } from "./components/RecentCalls";
import { CallSummaries } from "./components/CallSummaries";
import { Plus, Download, Bolt } from "./icons";

function latencyPoints(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 24 - ((v - min) / span) * 20 - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function OverviewPage() {
  const usagePct = Math.round((monthUsage.callsUsed / monthUsage.callsLimit) * 100);
  const underTarget = latency.medianMs <= latency.targetMs;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Overview</h1>
          <p className="mt-1 text-sm text-neutral-500">Here&apos;s what your AI receptionist handled today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-900 px-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
            <Plus className="h-4 w-4" />
            Add number
          </button>
        </div>
      </header>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {/* Call volume + talk ratio */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Call volume" subtitle="Calls answered over the last 14 days">
          <BarChart data={callVolume} />
        </SectionCard>
        <SectionCard title="Talk ratio" subtitle="Caller vs AI speaking time">
          <DonutChart segments={talkRatio} centerLabel="62%" centerSub="Caller" />
        </SectionCard>
      </div>

      {/* Latency + outcomes + month usage */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Voice latency" subtitle="Caller stops → AI replies">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[28px] font-medium leading-none tracking-tight text-neutral-900">
                {latency.medianMs}
                <span className="ml-1 text-base font-normal text-neutral-400">ms</span>
              </div>
              <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${underTarget ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                <Bolt className="h-3 w-3" />
                {underTarget ? "Under" : "Over"} {latency.targetMs}ms target
              </span>
            </div>
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-10 w-28">
              <polyline points={latencyPoints(latency.spark)} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <div className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500">
            p95 <span className="font-medium text-neutral-900">{latency.p95Ms}ms</span>
          </div>
        </SectionCard>

        <SectionCard title="Call outcomes" subtitle="How today's calls resolved">
          <ul className="space-y-3">
            {outcomes.map((o) => (
              <li key={o.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">{o.label}</span>
                  <span className="font-medium text-neutral-900">{o.value}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full" style={{ width: `${o.value}%`, background: o.color }} />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="This month" subtitle={`${monthUsage.plan} plan usage`}>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-medium leading-none tracking-tight text-neutral-900">{monthUsage.callsUsed.toLocaleString()}</span>
            <span className="text-sm text-neutral-400">/ {monthUsage.callsLimit.toLocaleString()} calls</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-violet-600" style={{ width: `${usagePct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4">
            <div>
              <div className="text-lg font-medium text-neutral-900">{monthUsage.minutes.toLocaleString()}</div>
              <div className="text-xs text-neutral-400">Talk minutes</div>
            </div>
            <div>
              <div className="text-lg font-medium text-neutral-900">{monthUsage.bookings}</div>
              <div className="text-xs text-neutral-400">Bookings</div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Recent calls + AI summaries */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Recent calls"
          action={<Link href="/dashboard/calls" className="text-sm font-medium text-violet-600 hover:text-violet-700">View all</Link>}
        >
          <RecentCalls calls={recentCalls} />
        </SectionCard>
        <SectionCard title="AI call summaries" subtitle="Auto-generated after each call">
          <CallSummaries items={callSummaries} />
        </SectionCard>
      </div>
    </div>
  );
}
