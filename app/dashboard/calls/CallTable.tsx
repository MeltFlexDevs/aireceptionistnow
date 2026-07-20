"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import type { CallLogRow } from "@/lib/dashboard/calls";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { statusTone, bucketLabel } from "./status";
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
    <ul className="space-y-1.5">
      {rows.map((c, i) => {
        const caller = c.from ? formatPhone(c.from) : t.data.unknownCaller;
        const selected = Boolean(c.dbId) && c.dbId === selectedId;

        const inner = (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-neutral-900">{caller}</span>
              <span className="shrink-0 whitespace-nowrap text-xs text-neutral-400">{c.dateLabel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span
                className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(c.status, c.date)}`}
              >
                {bucketLabel(t, c.status, c.date)}
              </span>
              <span className="flex min-w-0 items-center gap-2">
                {assistantCount > 1 && c.assistant && (
                  <span className="truncate text-xs text-neutral-500">{c.assistant}</span>
                )}
                <span className="shrink-0 tabular-nums text-xs text-neutral-500">{c.durationLabel}</span>
              </span>
            </div>
          </>
        );

        const box = `block rounded-xl border p-3 outline-none transition-colors ${
          selected
            ? "border-neutral-900 bg-white shadow-[inset_2px_0_0_0_#1D1D1D]"
            : "border-neutral-200/70 bg-white/60 hover:border-neutral-300"
        }`;

        // Rows with no stored record have nothing to open - say so rather than
        // silently swallowing the click.
        if (!c.dbId) {
          return (
            <li key={c.key} style={{ "--i": i } as CSSProperties}>
              <div
                title={t.calls.detail.noDetailTooltip}
                className="block cursor-default rounded-xl border border-neutral-200/70 bg-white/40 p-3 opacity-70"
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
