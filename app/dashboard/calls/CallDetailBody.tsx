import type { CallDetail } from "@/lib/dashboard/calls";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { SectionCard } from "../components/SectionCard";
import { TranslatedText } from "../components/TranslatedText";
import { ArrowDown, ArrowUp } from "../icons";
import { statusTone, bucketLabel } from "./status";
import { ActionItems } from "./[id]/ActionItems";
import { Recording } from "./[id]/Recording";
import { ReportIssue } from "./[id]/ReportIssue";
import { Transcript } from "./[id]/Transcript";

const SENTIMENT_TONE: Record<string, string> = {
  positive: "bg-emerald-50 text-emerald-700",
  neutral: "bg-neutral-100 text-neutral-700",
  negative: "bg-rose-50 text-rose-700",
  frustrated: "bg-amber-50 text-amber-700",
  angry: "bg-rose-50 text-rose-700",
};

const summaryCls = "text-sm leading-relaxed text-neutral-600";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-0.5 text-sm text-neutral-800">{value}</div>
    </div>
  );
}

function outcomeLabel(outcome: string, d: Dictionary["data"]): string {
  switch (outcome.toLowerCase()) {
    case "booked":
      return d.outcomeBooked;
    case "message":
      return d.outcomeMessage;
    case "transferred":
      return d.outcomeTransferred;
    case "resolved":
      return d.outcomeResolved;
    default:
      return d.outcomeUnknown;
  }
}

function sentimentLabel(sentiment: string, d: Dictionary["data"]): string {
  switch (sentiment.toLowerCase()) {
    case "positive":
      return d.sentimentPositive;
    case "negative":
      return d.sentimentNegative;
    case "frustrated":
      return d.sentimentFrustrated;
    case "angry":
      return d.sentimentAngry;
    default:
      return d.sentimentNeutral;
  }
}

/**
 * The call detail surface, shared by the split-view pane (`variant="pane"`) and
 * the standalone /dashboard/calls/[id] route (`variant="page"`).
 *
 * In pane mode the header and the recording strip stay fixed and everything
 * below them scrolls, so a long transcript never pushes the caller's number off
 * screen. In page mode it is the original three-column grid.
 */
export async function CallDetailBody({
  call,
  variant,
  assistantCount,
}: {
  call: CallDetail;
  variant: "pane" | "page";
  /** The Assistant meta cell only renders when more than one exists. */
  assistantCount: number;
}) {
  const t = await getDictionary();
  const d = t.calls.detail;
  const outbound = call.direction === "outbound";
  const summaryText = call.isLive ? d.summaryLive : d.summaryNone;

  const badges = (
    <div className="flex flex-wrap items-center gap-2">
      {call.isLive && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {d.live}
        </span>
      )}
      {/* Bucket label only: raw carrier statuses never reach the screen. */}
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(call.status, call.date)}`}
      >
        {bucketLabel(t, call.status, call.date)}
      </span>
      {call.outcome && call.outcome.toLowerCase() !== "abandoned" && (
        <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-900">
          {outcomeLabel(call.outcome, t.data)}
        </span>
      )}
      {call.sentiment && (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SENTIMENT_TONE[call.sentiment.toLowerCase()] ?? "bg-neutral-100 text-neutral-500"}`}
        >
          {sentimentLabel(call.sentiment, t.data)}
        </span>
      )}
    </div>
  );

  const heading = (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
        {outbound ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
      </span>
      <h1 className="truncate text-lg font-medium tracking-tight text-neutral-900">
        {call.from ? formatPhone(call.from) : t.data.unknownCaller}{" "}
        <span className="text-neutral-400">→</span> {call.to ? formatPhone(call.to) : "-"}
      </h1>
    </div>
  );

  const meta = (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <Meta label={t.calls.colDate} value={call.dateLabel} />
      <Meta label={t.calls.colDuration} value={call.durationLabel} />
      {assistantCount > 1 && <Meta label={t.calls.colAssistant} value={call.assistant ?? "-"} />}
    </div>
  );

  const summaryCard = (
    <SectionCard title={d.summary}>
      {call.summary ? (
        <TranslatedText text={call.summary} className={summaryCls} />
      ) : (
        <p className={summaryCls}>{summaryText}</p>
      )}
    </SectionCard>
  );

  const actionsCard = (
    <SectionCard title={d.actions} subtitle={d.actionsSub}>
      <ActionItems actions={call.actions} />
    </SectionCard>
  );

  const transcriptCard = (
    <SectionCard title={d.transcript} action={<ReportIssue callId={call.id} />}>
      {/* Originals render instantly; TranscriptView translates client-side. */}
      <Transcript turns={call.turns} />
    </SectionCard>
  );

  if (variant === "page") {
    return (
      <>
        <SectionCard>
          <div className="flex flex-wrap items-start justify-between gap-4">
            {heading}
            {badges}
          </div>
          <div className="mt-5 border-t border-neutral-100 pt-4">{meta}</div>
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {call.recordingUrl && (
              <SectionCard title={d.recording} subtitle={d.recordingSub}>
                <Recording url={call.recordingUrl} />
              </SectionCard>
            )}
            {transcriptCard}
          </div>
          <div className="space-y-4">
            {summaryCard}
            {actionsCard}
          </div>
        </div>
      </>
    );
  }

  // Pane: fixed header + recording strip, one scroll region underneath.
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-neutral-200/70 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {heading}
          {badges}
        </div>
        <div className="mt-4">{meta}</div>
      </div>

      {call.recordingUrl && (
        <div className="shrink-0 border-b border-neutral-200/70 px-5 py-3">
          <Recording url={call.recordingUrl} />
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {summaryCard}
        {actionsCard}
        {transcriptCard}
      </div>
    </div>
  );
}
