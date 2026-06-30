import type { CallActionItem } from "@/lib/dashboard/calls";

const TYPE_LABEL: Record<string, string> = {
  booking: "Appointment booked",
  message: "Message taken",
  transfer: "Call transferred",
};

const STATUS_TONE: Record<string, string> = {
  done: "bg-emerald-50 text-emerald-700",
  pending: "bg-neutral-100 text-neutral-700",
  failed: "bg-rose-50 text-rose-700",
};

function summarize(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (v == null || typeof v === "object") continue;
    parts.push(`${k}: ${String(v)}`);
    if (parts.length >= 3) break;
  }
  return parts.join(" · ");
}

export function ActionItems({ actions }: { actions: CallActionItem[] }) {
  if (actions.length === 0) {
    return <p className="text-sm text-neutral-500">No actions taken on this call.</p>;
  }
  return (
    <ul className="space-y-3">
      {actions.map((a) => {
        const detail = summarize(a.payload);
        return (
          <li key={a.id} className="rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-neutral-900">
                {TYPE_LABEL[a.type] ?? a.type}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[a.status] ?? "bg-neutral-100 text-neutral-500"}`}
              >
                {a.status}
              </span>
            </div>
            {detail && <p className="mt-1 text-xs text-neutral-500">{detail}</p>}
            {a.error && <p className="mt-1 text-xs text-rose-600">{a.error}</p>}
          </li>
        );
      })}
    </ul>
  );
}
