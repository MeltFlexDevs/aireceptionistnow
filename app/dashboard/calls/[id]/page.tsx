import Link from "next/link";
import { notFound } from "next/navigation";
import { getCallDetail } from "@/lib/dashboard/calls";
import { currentUserId } from "@/lib/auth";
import { SectionCard } from "../../components/SectionCard";
import { ArrowDown, ArrowUp } from "../../icons";
import { statusTone } from "../status";
import { ActionItems } from "./ActionItems";
import { LiveRefresh } from "./LiveRefresh";
import { Recording } from "./Recording";
import { Transcript } from "./Transcript";

export const dynamic = "force-dynamic";

const SENTIMENT_TONE: Record<string, string> = {
  positive: "bg-emerald-50 text-emerald-700",
  neutral: "bg-amber-50 text-amber-700",
  negative: "bg-rose-50 text-rose-700",
};

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-0.5 text-sm text-neutral-800">{value}</div>
    </div>
  );
}

export default async function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let call: Awaited<ReturnType<typeof getCallDetail>> | null = null;
  try {
    call = await getCallDetail(id, await currentUserId());
  } catch {
    call = null;
  }
  if (!call) notFound();

  const outbound = call.direction === "outbound";
  const summaryText = call.summary
    ? call.summary
    : call.isLive
      ? "The AI summary is generated after the call ends."
      : "No summary for this call.";

  return (
    <div className="space-y-6">
      {call.isLive && <LiveRefresh />}

      <Link href="/dashboard/calls" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
        ← Calls
      </Link>

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${outbound ? "bg-violet-50 text-violet-600" : "bg-sky-50 text-sky-600"}`}
              >
                {outbound ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
              </span>
              <h1 className="text-xl font-medium tracking-tight text-neutral-900">
                {call.from || "Unknown"} <span className="text-neutral-400">→</span> {call.to || "-"}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {call.isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live
              </span>
            )}
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(call.status)}`}>
              {call.statusLabel}
            </span>
            {call.outcome && (
              <span className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                {call.outcome}
              </span>
            )}
            {call.sentiment && (
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${SENTIMENT_TONE[call.sentiment] ?? "bg-neutral-100 text-neutral-500"}`}>
                {call.sentiment}
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 sm:grid-cols-4">
          <Meta label="Date" value={call.dateLabel} />
          <Meta label="Duration" value={call.durationLabel} />
          <Meta label="Assistant" value={call.assistant ?? "-"} />
          <Meta label="Call SID" value={call.sid || "-"} />
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {call.recordingUrl && (
            <SectionCard title="Recording" subtitle="Play or download the call audio">
              <Recording url={call.recordingUrl} />
            </SectionCard>
          )}
          <SectionCard title="Transcript" subtitle={`${call.turns.length} turn${call.turns.length === 1 ? "" : "s"}`}>
            <Transcript turns={call.turns} />
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="AI summary">
            <p className="text-sm leading-relaxed text-neutral-600">{summaryText}</p>
          </SectionCard>
          <SectionCard title="Actions" subtitle="What the assistant did">
            <ActionItems actions={call.actions} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
