"use client";

import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { CallLogRow } from "@/lib/dashboard/calls";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { ArrowDown, ArrowUp } from "../icons";
import { statusTone } from "./status";
import { useT } from "@/lib/i18n/client";

function Direction({ direction }: { direction: string }) {
  const t = useT();
  const outbound = direction === "outbound";
  return (
    <span className="inline-flex items-center gap-1.5 text-neutral-600">
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${outbound ? "bg-neutral-100 text-neutral-900" : "bg-neutral-100 text-neutral-700"}`}
      >
        {outbound ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      </span>
      {outbound ? t.calls.outbound : t.calls.inbound}
    </span>
  );
}

function FromTo({ row }: { row: CallLogRow }) {
  return (
    <div className="transition-transform duration-150 group-hover:translate-x-0.5">
      <div className="font-medium text-neutral-900">{row.from ? formatPhone(row.from) : "Unknown"}</div>
      <div className="text-xs text-neutral-400">→ {row.to ? formatPhone(row.to) : "-"}</div>
    </div>
  );
}

function StatusBadges({ row }: { row: CallLogRow }) {
  return (
    <>
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(row.status)}`}>
        {row.statusLabel}
      </span>
      {row.outcome && row.outcome.toLowerCase() !== "abandoned" && (
        <span className="ml-1.5 inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-900">
          {row.outcome}
        </span>
      )}
    </>
  );
}

function hrefOf(row: CallLogRow): string | null {
  return row.dbId ? `/dashboard/calls/${row.dbId}` : null;
}

export function CallTable({ rows }: { rows: CallLogRow[] }) {
  const t = useT();
  const router = useRouter();
  const open = (href: string) => router.push(href);

  return (
    <>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
              <th className="pb-3 pr-4 font-medium">{t.calls.colDirection}</th>
              <th className="pb-3 pr-4 font-medium">{t.calls.colFromTo}</th>
              <th className="pb-3 pr-4 font-medium">{t.calls.colAssistant}</th>
              <th className="pb-3 pr-4 font-medium">{t.calls.colStatus}</th>
              <th className="pb-3 pr-4 font-medium">{t.calls.colDuration}</th>
              <th className="pb-3 text-right font-medium">{t.calls.colDate}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((c) => {
              const href = hrefOf(c);
              return (
                <tr
                  key={c.key}
                  onClick={href ? () => open(href) : undefined}
                  onKeyDown={href ? (e) => e.key === "Enter" && open(href) : undefined}
                  tabIndex={href ? 0 : undefined}
                  role={href ? "link" : undefined}
                  className={`group transition-colors duration-150 outline-none focus-visible:bg-neutral-50 ${
                    href
                      ? "cursor-pointer hover:bg-neutral-50 hover:shadow-[inset_2px_0_0_0_#1D1D1D]"
                      : "cursor-default"
                  }`}
                >
                  <td className="py-3 pr-4">
                    <Direction direction={c.direction} />
                  </td>
                  <td className="py-3 pr-4">
                    <FromTo row={c} />
                  </td>
                  <td className="py-3 pr-4 text-neutral-500">{c.assistant ?? "-"}</td>
                  <td className="py-3 pr-4">
                    <StatusBadges row={c} />
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-neutral-600">{c.durationLabel}</td>
                  <td className="py-3 text-right whitespace-nowrap text-neutral-500">{c.dateLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="rise-stagger space-y-2.5 sm:hidden">
        {rows.map((c, i) => {
          const href = hrefOf(c);
          return (
            <li key={c.key} style={{ "--i": i } as CSSProperties}>
              <div
                onClick={href ? () => open(href) : undefined}
                onKeyDown={href ? (e) => e.key === "Enter" && open(href) : undefined}
                tabIndex={href ? 0 : undefined}
                role={href ? "link" : undefined}
                aria-label={href ? `Open call from ${c.from ? formatPhone(c.from) : "unknown"}` : undefined}
                className={`rounded-xl border border-neutral-200/70 bg-white/60 p-4 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/60 ${
                  href ? "lift press cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <Direction direction={c.direction} />
                  <span className="whitespace-nowrap text-xs text-neutral-400">{c.dateLabel}</span>
                </div>
                <div className="mt-3">
                  <FromTo row={c} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center">
                    <StatusBadges row={c} />
                  </div>
                  <span className="tabular-nums text-xs text-neutral-500">{c.durationLabel}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
