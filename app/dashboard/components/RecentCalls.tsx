import Link from "next/link";
import type { Call, Sentiment } from "@/lib/dashboard/analytics";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { getDictionary } from "@/lib/i18n/server";

const sentimentStyle: Record<Sentiment, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-neutral-400",
  negative: "bg-rose-500",
  frustrated: "bg-orange-500",
  angry: "bg-red-700",
};

export async function RecentCalls({ calls }: { calls: Call[] }) {
  const t = await getDictionary();
  if (calls.length === 0) {
    return <p className="text-sm text-neutral-500">{t.data.noCallsYet}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">
            <th className="pb-3 pr-4 font-medium">{t.data.talkCaller}</th>
            <th className="pb-3 pr-4 font-medium">{t.calls.colDuration}</th>
            <th className="pb-3 pr-4 font-medium">{t.analytics.sentiment}</th>
            <th className="pb-3 text-right font-medium">{t.calls.colDate}</th>
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
                  {formatPhone(c.number) || c.name || t.data.unknownCaller}
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
