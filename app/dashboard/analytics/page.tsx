import { getAnalytics, getAssistantStats } from "@/lib/dashboard/analytics";
import { listAssistants } from "@/lib/dashboard/db";
import { currentUserId } from "@/lib/auth";
import { SectionCard } from "../components/SectionCard";
import { BarChart } from "../components/BarChart";
import { DonutChart } from "../components/DonutChart";
import { AssistantStats } from "../components/AssistantStats";
import { AssistantPicker } from "./AssistantPicker";

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

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ assistant?: string }>;
}) {
  const { assistant: assistantParam } = await searchParams;

  let data: Awaited<ReturnType<typeof getAnalytics>> | null = null;
  let assistants: Awaited<ReturnType<typeof getAssistantStats>> = [];
  let assistantList: { id: string; name: string }[] = [];
  let loadError = "";
  let selectedId = "";
  try {
    const ownerId = await currentUserId();
    const all = await listAssistants(ownerId);
    assistantList = all.map((a) => ({ id: a.id, name: a.name }));
    // Only honor the filter when it's one of the owner's assistants.
    selectedId = assistantParam && all.some((a) => a.id === assistantParam) ? assistantParam : "";
    [data, assistants] = await Promise.all([
      getAnalytics(ownerId, selectedId || undefined),
      getAssistantStats(ownerId, 30),
    ]);
  } catch (err) {
    loadError = (err as Error).message;
  }

  const selectedName = assistantList.find((a) => a.id === selectedId)?.name;

  const header = (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {selectedName ? `${selectedName} — last 30 days.` : "Trends across all assistants, last 30 days."}
        </p>
      </div>
      {assistantList.length > 0 && (
        <AssistantPicker assistants={assistantList} selected={selectedId} />
      )}
    </header>
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

  const tiles = [
    { label: "Total calls", value: String(data.totals.calls) },
    { label: "Avg call time", value: data.totals.avgDuration },
    { label: "Answer rate", value: data.totals.answerRate },
    { label: "Bookings", value: String(data.totals.bookings) },
  ];
  const positive = data.sentiment.find((s) => s.label === "Positive")?.value ?? 0;

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{t.label}</div>
            <div className="mt-2 text-[28px] font-medium leading-none tracking-tight text-neutral-900">{t.value}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Call volume" subtitle="Calls answered over the last 30 days">
        <BarChart data={data.volume} />
      </SectionCard>

      {!selectedId && (
        <SectionCard title="By assistant" subtitle="Per-assistant performance over the last 30 days">
          <AssistantStats stats={assistants} />
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Outcomes" subtitle="How calls resolved">
          {data.outcomes.length > 0 ? (
            <DonutChart segments={data.outcomes} centerLabel={String(data.totals.calls)} centerSub="calls" />
          ) : (
            <p className="text-sm text-neutral-500">No calls yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Sentiment" subtitle="Caller sentiment mix">
          {data.sentiment.length > 0 ? (
            <DonutChart segments={data.sentiment} centerLabel={`${positive}%`} centerSub="positive" />
          ) : (
            <p className="text-sm text-neutral-500">No calls yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Voice latency" subtitle="Median reply time">
          <div className="text-[28px] font-medium leading-none tracking-tight text-neutral-900">
            {data.latency.medianMs > 0 ? data.latency.medianMs : "-"}
            {data.latency.medianMs > 0 && <span className="ml-1 text-base font-normal text-neutral-400">ms</span>}
          </div>
          {data.latency.spark.length > 1 && (
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="mt-3 h-10 w-full">
              <polyline points={latencyPoints(data.latency.spark)} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          )}
          <div className="mt-3 border-t border-neutral-100 pt-3 text-sm text-neutral-500">
            p95 <span className="font-medium text-neutral-900">{data.latency.p95Ms > 0 ? `${data.latency.p95Ms}ms` : "-"}</span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
