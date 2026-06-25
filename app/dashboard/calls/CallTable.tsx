import Link from "next/link";
import type { CallLogRow } from "@/lib/dashboard/calls";
import { ArrowDown, ArrowUp } from "../icons";
import { statusTone } from "./status";

function Direction({ direction }: { direction: string }) {
  const outbound = direction === "outbound";
  return (
    <span className="inline-flex items-center gap-1.5 text-neutral-600">
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${outbound ? "bg-violet-50 text-violet-600" : "bg-sky-50 text-sky-600"}`}
      >
        {outbound ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      </span>
      {outbound ? "Outbound" : "Inbound"}
    </span>
  );
}

function FromTo({ row }: { row: CallLogRow }) {
  const inner = (
    <>
      <div className="font-medium text-neutral-900">{row.from || "Unknown"}</div>
      <div className="text-xs text-neutral-400">→ {row.to || "-"}</div>
    </>
  );
  return row.dbId ? (
    <Link href={`/dashboard/calls/${row.dbId}`} className="block hover:text-violet-700">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}

export function CallTable({ rows }: { rows: CallLogRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
            <th className="pb-3 pr-4 font-medium">Direction</th>
            <th className="pb-3 pr-4 font-medium">From → To</th>
            <th className="pb-3 pr-4 font-medium">Assistant</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 pr-4 font-medium">Duration</th>
            <th className="pb-3 pr-4 font-medium">Date</th>
            <th className="pb-3 text-right font-medium">Call SID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((c) => (
            <tr key={c.key} className="transition-colors hover:bg-neutral-50">
              <td className="py-3 pr-4">
                <Direction direction={c.direction} />
              </td>
              <td className="py-3 pr-4">
                <FromTo row={c} />
              </td>
              <td className="py-3 pr-4 text-neutral-500">{c.assistant ?? "-"}</td>
              <td className="py-3 pr-4">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(c.status)}`}>
                  {c.statusLabel}
                </span>
                {c.outcome && (
                  <span className="ml-1.5 inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                    {c.outcome}
                  </span>
                )}
              </td>
              <td className="py-3 pr-4 tabular-nums text-neutral-600">{c.durationLabel}</td>
              <td className="py-3 pr-4 whitespace-nowrap text-neutral-500">{c.dateLabel}</td>
              <td className="py-3 text-right">
                <span className="font-mono text-[11px] text-neutral-400" title={c.sid || "Not yet linked"}>
                  {c.sid ? `${c.sid.slice(0, 10)}…` : "-"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
