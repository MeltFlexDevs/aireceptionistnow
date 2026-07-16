import { getAnalyticsCached, getAssistantStatsCached } from "@/lib/dashboard/analytics";
import { listAssistants } from "@/lib/dashboard/db";
import { listOrganizations } from "@/lib/dashboard/organizations";
import { currentUserId } from "@/lib/auth";
import { SectionCard } from "../components/SectionCard";
import { BarChart } from "../components/BarChart";
import { DonutChart } from "../components/DonutChart";
import { AssistantStats } from "../components/AssistantStats";
import { PageHeader } from "../components/PageHeader";
import { AssistantPicker } from "./AssistantPicker";
import { OrganizationPicker } from "./OrganizationPicker";
import { Bolt } from "../icons";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

function latencyPoints(values: number[]): string {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100;
      const y = 24 - ((v - min) / span) * 20 - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ assistant?: string; org?: string }>;
}) {
  const [{ assistant: assistantParam, org: orgParam }, t] = await Promise.all([
    searchParams,
    getDictionary(),
  ]);
  const a = t.analytics;

  let data: Awaited<ReturnType<typeof getAnalyticsCached>> | null = null;
  let assistants: Awaited<ReturnType<typeof getAssistantStatsCached>> = [];
  let assistantList: { id: string; name: string }[] = [];
  let orgList: { id: string; name: string }[] = [];
  let loadError = "";
  let selectedId = "";
  let selectedOrg = "";
  try {
    const ownerId = await currentUserId();
    const [all, orgs] = await Promise.all([
      listAssistants(ownerId),
      listOrganizations(ownerId),
    ]);
    orgList = orgs.map((o) => ({ id: o.id, name: o.name }));
    // Only honor the org filter when it's one of the owner's organizations.
    selectedOrg = orgParam && orgs.some((o) => o.id === orgParam) ? orgParam : "";

    const inScope = selectedOrg ? all.filter((a) => a.organization_id === selectedOrg) : all;
    assistantList = inScope.map((a) => ({ id: a.id, name: a.name }));
    selectedId =
      assistantParam && inScope.some((a) => a.id === assistantParam) ? assistantParam : "";

    [data, assistants] = await Promise.all([
      getAnalyticsCached(ownerId, selectedId || undefined, selectedOrg || undefined),
      getAssistantStatsCached(ownerId, 30, selectedOrg || undefined),
    ]);
  } catch (err) {
    loadError = (err as Error).message;
  }

  const header = (
    <PageHeader
      title={a.title}
      action={
        <>
          {orgList.length > 0 && (
            <OrganizationPicker organizations={orgList} selected={selectedOrg} />
          )}
          {assistantList.length > 0 && (
            <AssistantPicker assistants={assistantList} selected={selectedId} />
          )}
        </>
      }
    />
  );

  if (!data) {
    return (
      <div className="space-y-6 rise">
        {header}
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {a.loadError}
          {loadError ? `: ${loadError}` : ""}.
        </div>
      </div>
    );
  }

  const tiles = [
    { label: a.totalCalls, value: String(data.totals.calls) },
    { label: a.avgCallTime, value: data.totals.avgDuration },
    { label: a.answerRate, value: data.totals.answerRate },
    { label: a.bookings, value: String(data.totals.bookings) },
  ];
  const positive = data.sentiment.find((s) => s.label === "Positive")?.value ?? 0;
  const caller = data.talkRatio.find((s) => s.label === "Caller")?.value ?? 0;
  const talkLabel = (label: string) =>
    label === "Caller" ? t.data.talkCaller : label === "AI" ? t.data.talkAi : label;
  const underTarget = data.latency.medianMs > 0 && data.latency.medianMs <= data.latency.targetMs;

  return (
    <div className="space-y-6 rise">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{t.label}</div>
            <div className="mt-2 text-[28px] font-medium leading-none tracking-tight text-neutral-900">{t.value}</div>
          </div>
        ))}
      </div>

      <SectionCard title={a.callVolume} subtitle={a.callVolumeSub}>
        <BarChart data={data.volume} />
      </SectionCard>

      {!selectedId && (
        <SectionCard title={a.byAssistant} subtitle={a.byAssistantSub}>
          <AssistantStats stats={assistants} />
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title={a.callersByCountry} subtitle={a.callersByCountrySub}>
          {data.countries.length > 0 ? (
            <DonutChart segments={data.countries} centerLabel={String(data.totals.calls)} centerSub="calls" />
          ) : (
            <p className="text-sm text-neutral-500">{a.noCalls}</p>
          )}
        </SectionCard>

        <SectionCard title={a.sentiment} subtitle={a.sentimentSub}>
          {data.sentiment.length > 0 ? (
            <DonutChart segments={data.sentiment} centerLabel={`${positive}%`} centerSub="positive" />
          ) : (
            <p className="text-sm text-neutral-500">{a.noCalls}</p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title={a.talkRatio} subtitle={a.talkRatioSub}>
          {data.talkRatio.length > 0 ? (
            <DonutChart
              segments={data.talkRatio.map((s) => ({ ...s, label: talkLabel(s.label) }))}
              centerLabel={`${caller}%`}
              centerSub={t.data.talkCaller}
            />
          ) : (
            <p className="text-sm text-neutral-500">{a.noConversation}</p>
          )}
        </SectionCard>

        <SectionCard title={a.voiceLatency} subtitle={a.voiceLatencySub}>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[28px] font-medium leading-none tracking-tight text-neutral-900">
                {data.latency.medianMs > 0 ? data.latency.medianMs : "-"}
                {data.latency.medianMs > 0 && (
                  <span className="ml-1 text-base font-normal text-neutral-400">ms</span>
                )}
              </div>
              {data.latency.medianMs > 0 && (
                <span
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
                    underTarget ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}
                >
                  <Bolt className="h-3 w-3" />
                  {underTarget ? a.latencyUnder : a.latencyOver} ({data.latency.targetMs}ms)
                </span>
              )}
            </div>
            {data.latency.spark.length > 1 && (
              <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-10 w-28">
                <polyline
                  points={latencyPoints(data.latency.spark)}
                  fill="none"
                  stroke="#1D1D1D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )}
          </div>
          <div className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500">
            p95{" "}
            <span className="font-medium text-neutral-900">
              {data.latency.p95Ms > 0 ? `${data.latency.p95Ms}ms` : "-"}
            </span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
