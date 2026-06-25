import type { Bar } from "@/lib/dashboard/analytics";

export function BarChart({ data }: { data: Bar[] }) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div>
      <div className="flex h-44 items-end gap-1.5">
        {data.map((d, i) => {
          const heightPct = (d.value / max) * 100;
          const isLast = i === data.length - 1;
          return (
            <div key={d.label} className="group flex flex-1 items-end justify-center">
              <div
                title={`${d.value} calls`}
                style={{ height: `${Math.max(heightPct, 3)}%` }}
                className={`w-full max-w-[16px] rounded-md transition-colors ${isLast ? "bg-violet-600" : "bg-violet-200 group-hover:bg-violet-400"}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-neutral-400">
            {i % 2 === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
