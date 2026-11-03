"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link, { useLinkStatus } from "next/link";
import type { CallLogRow } from "@/lib/dashboard/calls";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { bucketOf, bucketLabel } from "./status";
import { callOutcomeLabel } from "@/lib/dashboard/calls/format";
import { CallStatusBadge } from "./CallStatusBadge";
import { useT } from "@/lib/i18n/client";

/** Spinner on the row whose pane is still loading. Must render inside a Link. */
function RowPending() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span
      aria-hidden
      className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-700 align-middle"
    />
  ) : null;
}

/**
 * Compact call list. On md+ a row selects into the detail pane via ?selected=;
 * below md there is no pane, so a row navigates to the full-screen route.
 */
export function CallTable({
  rows,
  selectedId,
  assistantCount,
}: {
  rows: CallLogRow[];
  selectedId: string;
  /** Assistant name only renders for accounts with more than one. */
  assistantCount: number;
}) {
  const t = useT();

  // Highlight the clicked row at once; a slow network can hold the new pane
  // for seconds. Any new selection from the server (the answer, back or
  // forward) clears it (derived while rendering, no effect).
  const [pending, setPending] = useState<string | null>(null);
  const [prevSelectedId, setPrevSelectedId] = useState(selectedId);
  if (prevSelectedId !== selectedId) {
    setPrevSelectedId(selectedId);
    setPending(null);
  }
  const activeId = pending ?? selectedId;

  return (
    <ul className="space-y-0.5">
      {rows.map((c, i) => {
        const caller = c.from ? formatPhone(c.from) : t.data.unknownCaller;
        const selected = Boolean(c.dbId) && c.dbId === activeId;
        const busy = Boolean(c.dbId) && c.dbId === pending && pending !== selectedId;

        // `mark` sits before the date, so a spinner does not change the row height.
        const inner = (mark?: ReactNode) => (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[15px] font-medium tabular-nums text-neutral-900">{caller}</span>
              <span className={`shrink-0 whitespace-nowrap text-xs tabular-nums ${selected ? "text-neutral-600" : "text-neutral-500"}`}>
                {mark}
                {c.dateLabel}
              </span>
            </div>
            {/* The selected row's grey background needs a darker grey for 4.5:1. */}
            <div className={`mt-1 flex min-w-0 items-center gap-1.5 text-xs ${selected ? "text-neutral-600" : "text-neutral-500"}`}>
              <CallStatusBadge bucket={bucketOf(c.status, c.date)} label={bucketLabel(t, c.status, c.date)} />
              <span className="text-neutral-300" aria-hidden>&bull;</span>
              <span className="shrink-0 tabular-nums">{c.durationLabel}</span>
              {/* An answered call adds what came of it ("Caller hung up",
                  "Took a message"), the same words as Home and the detail. */}
              {c.outcome && bucketOf(c.status, c.date) === "completed" && (
                <>
                  <span className="text-neutral-300" aria-hidden>&bull;</span>
                  <span className="truncate">{callOutcomeLabel(t.data, c.status, c.outcome, c.date)}</span>
                </>
              )}
              {assistantCount > 1 && c.assistant && (
                <>
                  <span className="text-neutral-300" aria-hidden>&bull;</span>
                  <span className="truncate">{c.assistant}</span>
                </>
              )}
              {/* The accuracy audit wants a person to read this one. Last in the
                  row and colour-coded, so a clean list stays quiet and a flagged
                  call is findable at a glance. */}
              {c.needsReview && (
                <span className="ml-auto shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                  {t.calls.needsReview}
                </span>
              )}
            </div>
          </>
        );

        const box = `block rounded-lg px-3 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-300 ${
          selected
            ? "bg-neutral-100"
            : "hover:bg-neutral-50"
        }`;

        // Rows with no stored record have nothing to open - say so rather than
        // silently swallowing the click.
        if (!c.dbId) {
          return (
            <li key={c.key} style={{ "--i": i } as CSSProperties}>
              <div
                title={t.calls.detail.noDetailTooltip}
                className="block cursor-default rounded-lg px-3 py-2.5 opacity-55"
              >
                {inner()}
              </div>
            </li>
          );
        }

        return (
          <li key={c.key} style={{ "--i": i } as CSSProperties}>
            {/* Two links, one per breakpoint: the pane link keeps scroll where
                it is, the mobile link is a real navigation. */}
            <Link
              href={`/dashboard/calls?selected=${c.dbId}`}
              scroll={false}
              aria-current={selected ? "true" : undefined}
              aria-busy={busy ? true : undefined}
              aria-label={t.calls.openCall.replace("{caller}", caller)}
              className={`press hidden md:block ${box}`}
              onClick={(e) => {
                // A modified click opens a new tab; this pane stays as it is.
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                setPending(c.dbId);
              }}
            >
              {inner(<RowPending />)}
            </Link>
            <Link
              href={`/dashboard/calls/${c.dbId}`}
              aria-label={t.calls.openCall.replace("{caller}", caller)}
              className={`press md:hidden ${box}`}
            >
              {inner()}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
