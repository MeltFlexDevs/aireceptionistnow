"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import type { CallLogRow } from "@/lib/dashboard/calls";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { bucketOf, bucketLabel } from "./status";
import { CallStatusBadge } from "./CallStatusBadge";
import { useT } from "@/lib/i18n/client";

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

  return (
    <ul className="space-y-0.5">
      {rows.map((c, i) => {
        const caller = c.from ? formatPhone(c.from) : t.data.unknownCaller;
        const selected = Boolean(c.dbId) && c.dbId === selectedId;

        const inner = (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[15px] font-medium tabular-nums text-neutral-900">{caller}</span>
              <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-neutral-400">{c.dateLabel}</span>
            </div>
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-neutral-500">
              <CallStatusBadge bucket={bucketOf(c.status, c.date)} label={bucketLabel(t, c.status, c.date)} />
              <span className="text-neutral-300" aria-hidden>&bull;</span>
              <span className="shrink-0 tabular-nums">{c.durationLabel}</span>
              {assistantCount > 1 && c.assistant && (
                <>
                  <span className="text-neutral-300" aria-hidden>&bull;</span>
                  <span className="truncate">{c.assistant}</span>
                </>
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
                {inner}
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
              aria-label={t.calls.openCall.replace("{caller}", caller)}
              className={`press hidden md:block ${box}`}
            >
              {inner}
            </Link>
            <Link
              href={`/dashboard/calls/${c.dbId}`}
              aria-label={t.calls.openCall.replace("{caller}", caller)}
              className={`press md:hidden ${box}`}
            >
              {inner}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
