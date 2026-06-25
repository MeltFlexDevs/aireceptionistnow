import { getCallLog } from "@/lib/dashboard/calls";
import { currentUserId } from "@/lib/auth";
import { SectionCard } from "../components/SectionCard";
import { Phone } from "../icons";
import { CallFilters } from "./CallFilters";
import { CallTable } from "./CallTable";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined, fallback: string): string {
  return typeof v === "string" && v ? v : fallback;
}

export default async function CallsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters = {
    q: one(sp.q, ""),
    direction: one(sp.dir, "all"),
    status: one(sp.status, "all"),
  };

  let log: Awaited<ReturnType<typeof getCallLog>> | null = null;
  let loadError = "";
  try {
    log = await getCallLog(filters, await currentUserId());
  } catch (err) {
    loadError = (err as Error).message;
  }

  const header = (
    <header>
      <h1 className="text-2xl font-medium tracking-tight text-neutral-900">Calls</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Every inbound and outbound call, reconciled with your Twilio call logs by Call SID.
      </p>
    </header>
  );

  if (!log) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Couldn&apos;t load calls{loadError ? `: ${loadError}` : ""}.
        </div>
      </div>
    );
  }

  const filtered = filters.q || filters.direction !== "all" || filters.status !== "all";

  return (
    <div className="space-y-6">
      {header}
      <CallFilters q={filters.q} direction={filters.direction} status={filters.status} />

      {!log.twilioConnected && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Twilio isn&apos;t connected (or has no call logs yet), so statuses and durations come
          from your own records and may lag the carrier.
        </div>
      )}

      <SectionCard
        title="Call log"
        subtitle={`${log.rows.length} call${log.rows.length === 1 ? "" : "s"}${filtered ? " matched" : ""}`}
      >
        {log.rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Phone className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-neutral-900">
              {filtered ? "No calls match your filters" : "No calls yet"}
            </p>
            <p className="mt-1 max-w-sm text-sm text-neutral-500">
              {filtered
                ? "Try clearing the search or changing the filters."
                : "Inbound calls and test calls appear here, matched to their Twilio Call SID."}
            </p>
          </div>
        ) : (
          <CallTable rows={log.rows} />
        )}
      </SectionCard>
    </div>
  );
}
