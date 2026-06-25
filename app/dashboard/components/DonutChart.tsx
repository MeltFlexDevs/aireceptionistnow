import type { Segment } from "../data";

interface Props {
  segments: Segment[];
  centerLabel: string;
  centerSub: string;
}

export function DonutChart({ segments, centerLabel, centerSub }: Props) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let acc = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
          {segments.map((s) => {
            const dash = (s.value / total) * 100;
            const circle = (
              <circle
                key={s.label}
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={s.color}
                strokeWidth="3.5"
                strokeDasharray={`${dash} ${100 - dash}`}
                strokeDashoffset={-acc}
              />
            );
            acc += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-medium text-neutral-900">{centerLabel}</span>
          <span className="text-[11px] text-neutral-500">{centerSub}</span>
        </div>
      </div>
      <ul className="flex-1 space-y-3">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-neutral-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <span className="font-medium text-neutral-900">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
