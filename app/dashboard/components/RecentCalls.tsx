import type { Call, Sentiment } from "@/lib/dashboard/analytics";

const outcomeStyle: Record<string, string> = {
  Booked: "bg-neutral-100 text-neutral-900",
  Resolved: "bg-emerald-50 text-emerald-700",
  Message: "bg-neutral-100 text-neutral-700",
  Transferred: "bg-neutral-100 text-neutral-700",
  Abandoned: "bg-rose-50 text-rose-700",
};

const sentimentStyle: Record<Sentiment, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-neutral-400",
  negative: "bg-rose-500",
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
            <th className="pb-3 pr-4 font-medium">Line</th>
            <th className="pb-3 pr-4 font-medium">Duration</th>
            <th className="pb-3 pr-4 font-medium">Outcome</th>
            <th className="pb-3 pr-4 font-medium">Sentiment</th>
            <th className="pb-3 text-right font-medium">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {calls.map((c) => (
            <tr key={c.id} className="transition-colors hover:bg-neutral-50">
              <td className="py-3 pr-4">
                <div className="font-medium text-neutral-900">{c.name}</div>
                <div className="text-xs text-neutral-400">{c.number}</div>
              </td>
              <td className="py-3 pr-4 text-neutral-500">{c.line}</td>
              <td className="py-3 pr-4 tabular-nums text-neutral-600">{c.duration}</td>
              <td className="py-3 pr-4">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${outcomeStyle[c.outcome] ?? "bg-neutral-100 text-neutral-500"}`}>
                  {c.outcome}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className="flex items-center gap-1.5 capitalize text-neutral-500">
                  <span className={`h-2 w-2 rounded-full ${sentimentStyle[c.sentiment]}`} />
                  {c.sentiment}
                </span>
              </td>
              <td className="py-3 text-right text-xs text-neutral-400">{c.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
