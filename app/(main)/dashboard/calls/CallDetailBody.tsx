import type { ReactNode } from "react";
import type { CallDetail } from "@/lib/dashboard/calls";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { TranslatedText } from "../components/TranslatedText";
import { ArrowDown, ArrowUp } from "../icons";
import { bucketOf, bucketLabel } from "./status";
import { CallStatusBadge } from "./CallStatusBadge";
import { ActionItems } from "./[id]/ActionItems";
import { Recording } from "./[id]/Recording";
import { ReportIssue } from "./[id]/ReportIssue";
import { Transcript } from "./[id]/Transcript";

const SENTIMENT_TONE: Record<string, string> = {
  positive: "bg-emerald-50 text-emerald-700",
  neutral: "bg-neutral-100 text-neutral-600",
  negative: "bg-rose-50 text-rose-600",
  frustrated: "bg-amber-50 text-amber-700",
  angry: "bg-rose-50 text-rose-600",
};

const summaryCls = "text-sm leading-relaxed text-neutral-600";

// Notion-style section: a title, an optional action, then content. Sections are
// separated by a hairline rule and whitespace instead of being boxed, so the
// detail reads as one page rather than a stack of cards.
function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-neutral-100 pt-6 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-neutral-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
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
 * Both variants share one header (caller number + a single muted metadata line +
 * status badges) and the same borderless, Notion-style sections. In pane mode
 * the header and recording stay pinned and the sections scroll; in page mode the
 * whole thing sits in one white card.
 */
export async function CallDetailBody({
  call,
  variant,
  assistantCount,
}: {
  call: CallDetail;
  variant: "pane" | "page";
  /** The assistant name is only worth showing when more than one exists. */
  assistantCount: number;
}) {
  const t = await getDictionary();
  const d = t.calls.detail;
  const outbound = call.direction === "outbound";
  const summaryText = call.isLive ? d.summaryLive : d.summaryNone;

  const flatBadge = "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium";

  const badges = (
    <div className="flex flex-wrap items-center gap-1.5">
      {call.isLive && (
        <span className={`${flatBadge} bg-emerald-50 text-emerald-700`}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {d.live}
        </span>
      )}
      <CallStatusBadge bucket={bucketOf(call.status, call.date)} label={bucketLabel(t, call.status, call.date)} />
      {call.outcome && call.outcome.toLowerCase() !== "abandoned" && (
        <span className={`${flatBadge} bg-neutral-100 text-neutral-700`}>
          {outcomeLabel(call.outcome, t.data)}
        </span>
      )}
      {call.sentiment && (
        <span className={`${flatBadge} ${SENTIMENT_TONE[call.sentiment.toLowerCase()] ?? "bg-neutral-100 text-neutral-500"}`}>
          {sentimentLabel(call.sentiment, t.data)}
        </span>
      )}
    </div>
  );

  // Reduced to one line of chrome: the caller's number, then a single muted
  // metadata row - date, duration, and (when relevant) which receptionist took
  // it. No repeated "→ number" and no boxed DATE / DURATION cells.
  const metaLine = [call.dateLabel, call.durationLabel, assistantCount > 1 ? call.assistant : ""]
    .filter(Boolean)
    .join(" · ");

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            {outbound ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          </span>
          <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight tabular-nums text-neutral-900">
            {call.from ? formatPhone(call.from) : t.data.unknownCaller}
          </h1>
        </div>
        {metaLine && <p className="mt-1.5 pl-8 text-xs tabular-nums text-neutral-400">{metaLine}</p>}
        <div className="mt-2.5 pl-8">{badges}</div>
      </div>
      {/* Reporting is about the whole call, so it lives here in the call header,
          not tucked into the transcript section. */}
      <ReportIssue callId={call.id} />
    </div>
  );

  const recording = call.recordingUrl ? <Recording url={call.recordingUrl} /> : null;

  const sections = (
    <>
      <Section title={d.summary}>
        {call.summary ? (
          <TranslatedText text={call.summary} className={summaryCls} />
        ) : (
          <p className={summaryCls}>{summaryText}</p>
        )}
      </Section>
      <Section title={d.actions}>
        <ActionItems actions={call.actions} />
      </Section>
      <Section title={d.transcript}>
        <Transcript turns={call.turns} />
      </Section>
    </>
  );

  if (variant === "page") {
    return (
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 px-5 py-4 sm:px-6">{header}</div>
        {recording && <div className="border-b border-neutral-100 px-5 py-3 sm:px-6">{recording}</div>}
        <div className="px-5 py-6 sm:px-6">{sections}</div>
      </div>
    );
  }

  // Pane: pinned header + recording strip, one scroll region underneath.
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-neutral-100 px-5 py-4">{header}</div>
      {recording && <div className="shrink-0 border-b border-neutral-100 px-5 py-3">{recording}</div>}
      <div className="min-h-0 flex-1 overflow-y-auto p-5">{sections}</div>
    </div>
  );
}
