import { Suspense } from "react";
import { getCallLog, getCallDetail, type CallLogRow } from "@/lib/dashboard/calls";
import { currentUserId } from "@/lib/auth";
import { listAssistants } from "@/lib/dashboard/db";
import { PageHeader } from "../components/PageHeader";
import { Skeleton } from "../components/Skeleton";
import { CallFilters } from "./CallFilters";
import { CallTable } from "./CallTable";
import { CallDetailBody } from "./CallDetailBody";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { AiAvatar } from "@/app/onboarding/AiAvatar";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Filters = { q: string; direction: string; status: string };

// Matches the shared one-screen cap: 7rem below lg (h-16 topbar + py-6), 8rem
// at lg where main padding grows to py-8.
const CAP = "md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]";

function one(v: string | string[] | undefined, fallback: string): string {
  return typeof v === "string" && v ? v : fallback;
}

function ListSkeletonRows() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
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
  const selected = one(sp.selected, "");

  return (
    <div className={`rise flex flex-col gap-3 ${CAP}`}>
      <div className="shrink-0">
        <PageHeader title={t.calls.title} />
      </div>
      <div className="shrink-0">
        <CallFilters q={filters.q} status={filters.status} />
      </div>

      <Suspense key={`${filters.q}|${filters.status}`} fallback={<SplitSkeleton />}>
        <CallLogBody filters={filters} selected={selected} t={t} />
      </Suspense>
    </div>
  );
}

function SplitSkeleton() {
  return (
    <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[minmax(300px,2fr)_3fr]">
      <div className="shape-card glass min-h-0 overflow-hidden">
        <ListSkeletonRows />
      </div>
      <div className="shape-card glass hidden min-h-0 overflow-hidden md:block">
        <DetailSkeleton />
      </div>
    </div>
  );
}

async function CallLogBody({
  filters,
  selected,
  t,
}: {
  filters: Filters;
  selected: string;
  t: Dictionary;
}) {
  const ownerId = await currentUserId();
  const locale = await getLocale();

  let log: Awaited<ReturnType<typeof getCallLog>> | null = null;
  let loadError = "";
  try {
    log = await getCallLog(filters, ownerId, undefined, locale);
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

  // listAssistants is cache()-wrapped, so this is free if the layout already
  // fetched it this request.
  const assistants = await listAssistants(ownerId ?? undefined).catch(() => []);
  const rows = log.rows;
  const filtered = Boolean(filters.q) || filters.status !== "all";

  if (rows.length === 0) {
    return (
      <div className="shape-card glass flex min-h-0 flex-1 flex-col items-center justify-center p-10 text-center">
        <AiAvatar mood="greeting" className="h-20 w-20" />
        <p className="mt-4 text-sm font-medium text-neutral-900">
          {filtered ? t.calls.emptyFilteredTitle : t.calls.emptyTitle}
        </p>
        <p className="mt-1.5 max-w-sm text-sm text-neutral-500">
          {filtered ? t.calls.emptyFilteredBody : t.calls.emptyBody}
        </p>
      </div>
    );
  }

  // Default selection: the newest row that actually has a record behind it, so
  // a plain /dashboard/calls lands with the pane already populated.
  const selectable = rows.filter((r): r is CallLogRow & { dbId: string } => Boolean(r.dbId));
  const activeId = selectable.some((r) => r.dbId === selected) ? selected : (selectable[0]?.dbId ?? "");

  return (
    <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[minmax(300px,2fr)_3fr]">
      <section className="shape-card glass flex min-h-0 min-w-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <CallTable rows={rows} selectedId={activeId} assistantCount={assistants.length} />
        </div>
      </section>

      {/* Pane is desktop-only: under md a row navigates to the full-screen
          /dashboard/calls/[id] route instead. */}
      <section className="shape-card glass hidden min-h-0 min-w-0 flex-col md:flex">
        <Suspense key={activeId} fallback={<DetailSkeleton />}>
          <DetailPane id={activeId} locale={locale} t={t} assistantCount={assistants.length} />
        </Suspense>
      </section>
    </div>
  );
}

async function DetailPane({
  id,
  locale,
  t,
  assistantCount,
}: {
  id: string;
  locale: string;
  t: Dictionary;
  assistantCount: number;
}) {
  const call = id ? await getCallDetail(id, await currentUserId(), locale).catch(() => null) : null;

  if (!call) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-10 text-center">
        <AiAvatar mood="greeting" className="h-20 w-20" />
        <p className="mt-4 text-sm text-neutral-500">{t.calls.detail.selectPrompt}</p>
      </div>
    );
  }
  return <CallDetailBody call={call} variant="pane" assistantCount={assistantCount} />;
}
