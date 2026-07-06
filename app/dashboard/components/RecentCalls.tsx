import Link from "next/link";
import type { Call, Sentiment } from "@/lib/dashboard/analytics";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";

const sentimentStyle: Record<Sentiment, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-neutral-400",
  negative: "bg-rose-500",
  frustrated: "bg-orange-500",
  angry: "bg-red-700",
};

export function RecentCalls({ calls }: { calls: Call[] }) {
  if (calls.length === 0) {
    return <p className="text-sm text-neutral-500">No calls yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
            <th className="pb-3 pr-4 font-medium">Caller</th>
            <th className="pb-3 pr-4 font-medium">Duration</th>
            <th className="pb-3 pr-4 font-medium">Sentiment</th>
            <th className="pb-3 text-right font-medium">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {calls.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-neutral-50">
              <td className="py-3 pr-4">
                <Link
                  href={`/dashboard/calls/${c.id}`}
                  className="flex items-center gap-2 font-medium text-neutral-900 hover:underline"
                >
                  {c.flag && <span aria-hidden>{c.flag}</span>}
                  {formatPhone(c.number) || c.name}
                </Link>
              </td>
              <td className="py-3 pr-4 tabular-nums text-neutral-600">{c.duration}</td>
              <td className="py-3 pr-4">
                <span className="flex items-center gap-1.5 capitalize text-neutral-500">
                  <span className={`h-2 w-2 rounded-full ${sentimentStyle[c.sentiment]}`} />
                  {c.sentiment}
                </span>
              </td>
              <td className="py-3 text-right text-xs text-neutral-400" title={c.at}>
                {c.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
