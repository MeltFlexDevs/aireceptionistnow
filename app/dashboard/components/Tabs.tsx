"use client";

import { Children, useId, useState, type ReactNode } from "react";

interface Props {
  labels: string[];
  children: ReactNode;
  /** Wrapper for the whole component - e.g. to make it a shrinkable flex column. */
  className?: string;
  /** Applied to each panel, e.g. "min-h-0 flex-1 overflow-y-auto" to make the
   *  active panel a page's single scroll region. */
  panelClassName?: string;
}

export function Tabs({ labels, children, className = "", panelClassName = "" }: Props) {
  const [active, setActive] = useState(0);
  const panels = Children.toArray(children);
  const id = useId();

  return (
    <div className={className}>
      <div role="tablist" className="flex shrink-0 gap-1 border-b border-neutral-200">
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
      {/* Every panel stays mounted (inactive ones are display:none), so form
          state survives a tab switch. */}
      <div className="flex min-h-0 flex-1 flex-col pt-5">
        {panels.map((panel, i) => (
          <div
            key={i}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            // `relative` so absolutely-positioned descendants (Tailwind's
            // sr-only inputs, for one) resolve against the scrolling panel
            // rather than some ancestor above the height cap - otherwise they
            // inflate the capped root's scrollHeight.
            className={`relative ${i === active ? panelClassName : `hidden ${panelClassName}`}`}
          >
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
