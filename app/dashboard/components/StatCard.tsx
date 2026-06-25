import type { Kpi } from "../data";
import { ArrowUp, ArrowDown } from "../icons";

function sparkPoints(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 26 - ((v - min) / span) * 22 - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function StatCard({ kpi }: { kpi: Kpi }) {
  const isUp = kpi.delta >= 0;
  const isGood = isUp === (kpi.goodWhen === "up");
  const stroke = isGood ? "#10b981" : "#f43f5e";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{kpi.label}</span>
        <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${isGood ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
          {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(kpi.delta)}%
        </span>
      </div>
      <div className="mt-2 text-[28px] font-medium leading-none tracking-tight text-neutral-900">{kpi.value}</div>
      <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="mt-4 h-7 w-full">
        <polyline points={sparkPoints(kpi.spark)} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
