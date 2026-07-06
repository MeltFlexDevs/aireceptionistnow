import { getAnalytics, getAssistantStats } from "@/lib/dashboard/analytics";
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

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ assistant?: string; org?: string }>;
}) {
  const { assistant: assistantParam, org: orgParam } = await searchParams;

  let data: Awaited<ReturnType<typeof getAnalytics>> | null = null;
  let assistants: Awaited<ReturnType<typeof getAssistantStats>> = [];
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

    // When an org is selected, the assistant dropdown only offers that org's
    // assistants, and an out-of-org assistant filter is dropped.
    const inScope = selectedOrg ? all.filter((a) => a.organization_id === selectedOrg) : all;
    assistantList = inScope.map((a) => ({ id: a.id, name: a.name }));
    selectedId =
      assistantParam && inScope.some((a) => a.id === assistantParam) ? assistantParam : "";

    [data, assistants] = await Promise.all([
      getAnalytics(ownerId, selectedId || undefined, selectedOrg || undefined),
      getAssistantStats(ownerId, 30, selectedOrg || undefined),
    ]);
  } catch (err) {
    loadError = (err as Error).message;
  }

  const selectedName = assistantList.find((a) => a.id === selectedId)?.name;
  const selectedOrgName = orgList.find((o) => o.id === selectedOrg)?.name;

  const scopeLabel = selectedName
    ? `${selectedName}. Last 30 days.`
    : selectedOrgName
      ? `${selectedOrgName}. All assistants, last 30 days.`
      : "All assistants. Last 30 days.";

  const header = (
    <PageHeader
      title="Analytics"
      description={scopeLabel}
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

      <SectionCard title="Call volume" subtitle="Calls answered over the last 30 days">
        <BarChart data={data.volume} />
      </SectionCard>

      {!selectedId && (
        <SectionCard title="By assistant" subtitle="Per-assistant performance over the last 30 days">
          <AssistantStats stats={assistants} />
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Callers by country" subtitle="Where callers are calling from">
          {data.countries.length > 0 ? (
            <DonutChart segments={data.countries} centerLabel={String(data.totals.calls)} centerSub="calls" />
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
      </div>
    </div>
  );
}
