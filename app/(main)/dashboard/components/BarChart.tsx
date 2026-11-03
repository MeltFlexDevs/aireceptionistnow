import type { Bar } from "@/lib/dashboard/analytics";
import { plural, type PluralForms } from "@/lib/i18n/plural";

/** `countForms` is the localized hover title per plural form, e.g. "{count} calls". */
export function BarChart({ data, countForms, locale }: { data: Bar[]; countForms: PluralForms; locale: string }) {
  // Floor of 1 keeps all-zero data from dividing by zero (NaN% heights).
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div>
      <div className="flex h-44 items-end gap-1.5">
        {data.map((d, i) => {
          const heightPct = (d.value / max) * 100;
          const isLast = i === data.length - 1;
          return (
            <div key={i} className="group flex flex-1 items-end justify-center">
              <div
                title={plural(locale, d.value, countForms)}
                style={{ height: `${Math.max(heightPct, 3)}%` }}
                className={`w-full max-w-[16px] rounded-md transition-colors ${isLast ? "bg-neutral-900" : "bg-neutral-300 group-hover:bg-neutral-900"}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-neutral-500">
            {i % 2 === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
