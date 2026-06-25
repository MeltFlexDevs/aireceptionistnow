"use client";

import { Children, useState, type ReactNode } from "react";

// Tabs that keep every panel mounted (inactive ones just hidden) so a single
// surrounding <form> still submits all fields regardless of the active tab.
export function Tabs({ labels, children }: { labels: string[]; children: ReactNode }) {
  const [active, setActive] = useState(0);
  const panels = Children.toArray(children);

  return (
    <div>
      <div className="flex gap-1 border-b border-neutral-200">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setActive(i)}
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
          <div key={i} className={i === active ? "" : "hidden"}>
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
