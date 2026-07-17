"use client";

import { Children, useId, useState, type ReactNode } from "react";

export function Tabs({ labels, children }: { labels: string[]; children: ReactNode }) {
  const [active, setActive] = useState(0);
  const panels = Children.toArray(children);
  const id = useId();

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-neutral-200">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const next = (active + (e.key === "ArrowRight" ? 1 : labels.length - 1)) % labels.length;
              setActive(next);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              i === active
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="pt-5">
        {panels.map((panel, i) => (
          <div
            key={i}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            className={i === active ? "" : "hidden"}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
