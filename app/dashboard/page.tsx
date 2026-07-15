import type { CSSProperties } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { getOverviewCached } from "@/lib/dashboard/analytics";
import { currentUserId } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { StatCard } from "./components/StatCard";
import { SectionCard } from "./components/SectionCard";
import { RecentCalls } from "./components/RecentCalls";
import { CallSummaries } from "./components/CallSummaries";
import { Onboarding } from "./components/Onboarding";
import { getOnboardingState } from "@/lib/dashboard/onboarding";
import { PageHeader } from "./components/PageHeader";
import { Skeleton } from "./components/Skeleton";
import { Phone, Plus } from "./icons";

export const dynamic = "force-dynamic";

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
  const data = await getOverviewCached(ownerId).catch((err: Error) => {
    console.error("[overview] load failed", err);
    return null;
  });

  if (!data) {
    return (
      <div className="space-y-6 rise">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {o.loadError}.
        </div>
      </div>
    );
  }

  // No calls yet - the setup guide replaces the stats, since there's nothing to
  // chart and the user's real question is "what do I do next?". Once it's all
  // done but no call has landed, the guide's last step explains where they'll
  // show up, so this stays useful right up to the first call.
  if (data.recentCalls.length === 0) {
    const onboarding = await getOnboardingState().catch(() => null);
    return (
      <div className="space-y-6 rise">
        {onboarding ? (
          <Onboarding state={onboarding} />
        ) : (
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
        )}
      </div>
    );
  }

  // KPI labels come back from the (locale-free) analytics layer keyed in
  // English; translate them here at render.
  const kpiLabels: Record<string, string> = {
    calls: t.data.kpiCalls,
    avg: t.data.kpiAvg,
    answer: t.data.kpiAnswer,
    booked: t.data.kpiBooked,
  };

  // Deliberately short. This screen answers "how is it going?" in one look:
  // the four numbers, then what actually happened on the phone. Everything that
  // needs studying rather than glancing - volume chart, countries, talk split,
  // latency, per-assistant breakdown - lives on Analytics, which can filter by
  // organization and assistant; plan meters live on Settings. The overview used
  // to restate all of it, so nothing here was worth looking at first.
  return (
    <div className="space-y-6 rise">
      <div className="rise-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi, i) => (
          <div key={kpi.key} style={{ "--i": i } as CSSProperties}>
            <StatCard kpi={{ ...kpi, label: kpiLabels[kpi.key] ?? kpi.label }} />
          </div>
        ))}
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
