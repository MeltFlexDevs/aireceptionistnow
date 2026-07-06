import { Suspense } from "react";
import { getCallLog } from "@/lib/dashboard/calls";
import { currentUserId } from "@/lib/auth";
import { SectionCard } from "../components/SectionCard";
import { PageHeader } from "../components/PageHeader";
import { Skeleton } from "../components/Skeleton";
import { Phone } from "../icons";
import { CallFilters } from "./CallFilters";
import { CallTable } from "./CallTable";
import { getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Filters = { q: string; direction: string; status: string };

function one(v: string | string[] | undefined, fallback: string): string {
  return typeof v === "string" && v ? v : fallback;
}

// Row skeleton for the call log while it streams (matches loading.tsx, minus the
// header/filters which are already painted).
function CallLogSkeleton() {
  return (
    <div className="shape-card glass space-y-4 p-5">
      <Skeleton className="h-4 w-24" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

export default async function CallsPage({ searchParams }: { searchParams: SearchParams }) {
  const [sp, t] = await Promise.all([searchParams, getDictionary()]);
  const filters: Filters = {
    q: one(sp.q, ""),
    direction: "inbound", // Call log shows incoming calls only.
    status: one(sp.status, "all"),
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t.calls.title} description={t.calls.description} />
      <CallFilters q={filters.q} status={filters.status} />

      {/* Re-key on the active filters so changing a filter swaps to the skeleton
          instantly instead of freezing on the previous results while the new
          query runs - the header + filters above never re-block. */}
      <Suspense key={`${filters.q}|${filters.status}`} fallback={<CallLogSkeleton />}>
        <CallLogBody filters={filters} t={t} />
      </Suspense>
    </div>
  );
}

async function CallLogBody({ filters, t }: { filters: Filters; t: Dictionary }) {
  let log: Awaited<ReturnType<typeof getCallLog>> | null = null;
  let loadError = "";
  try {
    log = await getCallLog(filters, await currentUserId());
  } catch (err) {
    loadError = (err as Error).message;
  }

  if (!log) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {t.calls.loadError}
        {loadError ? `: ${loadError}` : ""}.
      </div>
    );
  }

  const filtered = Boolean(filters.q) || filters.status !== "all";
  const count = log.rows.length;
  const subtitle = `${count} ${count === 1 ? t.calls.callOne : t.calls.callMany}${filtered ? ` ${t.calls.matched}` : ""}`;

  return (
    <SectionCard className="rise" title={t.calls.logTitle} subtitle={subtitle}>
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900">
            <Phone className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-900">
            {filtered ? t.calls.emptyFilteredTitle : t.calls.emptyTitle}
          </p>
          <p className="mt-1 max-w-sm text-sm text-neutral-500">
            {filtered ? t.calls.emptyFilteredBody : t.calls.emptyBody}
          </p>
        </div>
      ) : (
        <CallTable rows={log.rows} />
      )}
    </SectionCard>
  );
}
