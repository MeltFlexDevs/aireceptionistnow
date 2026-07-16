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

export default async function OverviewPage() {
  const t = await getDictionary();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.overview.title}
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

  const kpiLabels: Record<string, string> = {
    calls: t.data.kpiCalls,
    avg: t.data.kpiAvg,
    answer: t.data.kpiAnswer,
    booked: t.data.kpiBooked,
  };

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
            <Suspense fallback={<CallSummaries items={data.summaries} translate={false} />}>
              <CallSummaries items={data.summaries} />
            </Suspense>
          ) : (
            <p className="text-sm text-neutral-500">{o.noSummaries}</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
