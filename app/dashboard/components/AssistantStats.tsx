import Link from "next/link";
import type { AssistantStat } from "@/lib/dashboard/analytics";
import { Bot, Hash } from "../icons";

interface Props {
  stats: AssistantStat[];
}

function answerTone(pct: number): string {
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 50) return "text-neutral-700";
  return "text-rose-600";
}

function NameCell({ stat }: { stat: AssistantStat }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
        <Bot className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="truncate font-medium text-neutral-900">{stat.name}</div>
        {stat.number && (
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Hash className="h-3 w-3" />
            <span className="truncate">{stat.number}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AssistantStats({ stats }: Props) {
  if (stats.length === 0) {
    return <p className="text-sm text-neutral-500">No assistants yet.</p>;
  }

  return (
    <div className="-mx-5 -mb-5 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
            <th className="px-5 py-2.5 font-medium">Assistant</th>
            <th className="px-3 py-2.5 text-right font-medium">Calls</th>
            <th className="px-3 py-2.5 text-right font-medium">Avg time</th>
            <th className="px-3 py-2.5 text-right font-medium">Answered</th>
            <th className="px-3 py-2.5 text-right font-medium">Bookings</th>
            <th className="px-5 py-2.5 text-right font-medium">Positive</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((s) => {
            const isLinked = s.id !== "unassigned";
            return (
              <tr
                key={s.id}
                className="border-b border-neutral-50 transition-colors last:border-0 hover:bg-neutral-50"
              >
                <td className="px-5 py-3">
                  {isLinked ? (
                    <Link href={`/dashboard/assistant/${s.id}`} className="block">
                      <NameCell stat={s} />
                    </Link>
                  ) : (
                    <NameCell stat={s} />
                  )}
                </td>
                <td className="px-3 py-3 text-right font-medium text-neutral-900">{s.calls}</td>
                <td className="px-3 py-3 text-right text-neutral-600">{s.avgDuration}</td>
                <td className={`px-3 py-3 text-right font-medium ${answerTone(s.answerRate)}`}>
                  {s.answerRate}%
                </td>
                <td className="px-3 py-3 text-right text-neutral-600">{s.bookings}</td>
                <td className="px-5 py-3 text-right text-neutral-600">{s.positivePct}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
