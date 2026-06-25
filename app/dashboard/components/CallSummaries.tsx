import type { Summary } from "@/lib/dashboard/analytics";

export function CallSummaries({ items }: { items: Summary[] }) {
  return (
    <ul className="space-y-4">
      {items.map((s, i) => (
        <li key={s.id} className={i > 0 ? "border-t border-neutral-100 pt-4" : ""}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-neutral-900">{s.name}</span>
            <span className="text-xs text-neutral-400">{s.time}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">{s.text}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {s.tags.map((t) => (
              <span key={t} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                {t}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
