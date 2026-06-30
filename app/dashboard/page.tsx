import Link from "next/link";
import { getOverview, getAssistantStats } from "@/lib/dashboard/analytics";
import { currentUserId } from "@/lib/auth";
import { StatCard } from "./components/StatCard";
import { SectionCard } from "./components/SectionCard";
import { BarChart } from "./components/BarChart";
import { DonutChart } from "./components/DonutChart";
import { RecentCalls } from "./components/RecentCalls";
import { CallSummaries } from "./components/CallSummaries";
import { AssistantStats } from "./components/AssistantStats";
import { PlanUsage } from "./components/PlanUsage";
import { getPlanContext } from "@/lib/dashboard/plan";
import { PageHeader } from "./components/PageHeader";
import { Bolt, Plus } from "./icons";

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

export default async function OverviewPage() {
  let data: Awaited<ReturnType<typeof getOverview>> | null = null;
  let assistants: Awaited<ReturnType<typeof getAssistantStats>> = [];
  let planCtx: Awaited<ReturnType<typeof getPlanContext>> | null = null;
  let loadError = "";
  try {
    const ownerId = await currentUserId();
    [data, assistants, planCtx] = await Promise.all([
      getOverview(ownerId),
      getAssistantStats(ownerId, 14),
      getPlanContext(ownerId),
    ]);
  } catch (err) {
    loadError = (err as Error).message;
  }

  const header = (
    <PageHeader
      title="Overview"
      description="See how your AI receptionist is doing. Calls answered, how they went, and trends over time."
      action={
        <Link
          href="/dashboard/assistant"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-neutral-900 px-3 text-sm font-medium text-white shadow-card transition-colors hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          New assistant
        </Link>
      }
    />
  );

  if (!data) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Couldn&apos;t load analytics{loadError ? `: ${loadError}` : ""}.
        </div>
      </div>
    );
  }

  const caller = data.talkRatio.find((s) => s.label === "Caller")?.value ?? 0;
  const underTarget = data.latency.medianMs > 0 && data.latency.medianMs <= data.latency.targetMs;

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <StatCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {planCtx && <PlanUsage ctx={planCtx} />}

      <SectionCard title="Assistants" subtitle="Each assistant's results over the last 14 days">
        <AssistantStats stats={assistants} />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Call volume" subtitle="Calls answered over the last 14 days">
          <BarChart data={data.callVolume} />
        </SectionCard>
        <SectionCard title="Talk ratio" subtitle="Caller vs AI speaking time">
          {data.talkRatio.length > 0 ? (
            <DonutChart segments={data.talkRatio} centerLabel={`${caller}%`} centerSub="Caller" />
          ) : (
            <p className="text-sm text-neutral-500">No conversation data yet.</p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Voice latency" subtitle="Caller stops → AI replies">
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
                <polyline points={latencyPoints(data.latency.spark)} fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            )}
          </div>
          <div className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500">
            p95 <span className="font-medium text-neutral-900">{data.latency.p95Ms > 0 ? `${data.latency.p95Ms}ms` : "-"}</span>
          </div>
        </SectionCard>

        <SectionCard title="Call outcomes" subtitle="How recent calls resolved">
          {data.outcomes.length > 0 ? (
            <ul className="space-y-3">
              {data.outcomes.map((o) => (
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
          ) : (
            <p className="text-sm text-neutral-500">No calls yet.</p>
          )}
        </SectionCard>

        <SectionCard title="This month" subtitle="Calls handled">
          <div className="text-[28px] font-medium leading-none tracking-tight text-neutral-900">
            {data.monthUsage.callsThisMonth.toLocaleString()}
            <span className="ml-1 text-sm text-neutral-400">calls</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4">
            <div>
              <div className="text-lg font-medium text-neutral-900">{data.monthUsage.minutes.toLocaleString()}</div>
              <div className="text-xs text-neutral-400">Talk minutes</div>
            </div>
            <div>
              <div className="text-lg font-medium text-neutral-900">{data.monthUsage.bookings}</div>
              <div className="text-xs text-neutral-400">Bookings</div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Recent calls">
          <RecentCalls calls={data.recentCalls} />
        </SectionCard>
        <SectionCard title="AI call summaries" subtitle="Auto-generated after each call">
          {data.summaries.length > 0 ? (
            <CallSummaries items={data.summaries} />
          ) : (
            <p className="text-sm text-neutral-500">No summaries yet.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
