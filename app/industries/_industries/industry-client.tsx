"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useAuthDialog } from "@/app/components/AuthDialog";

export function IndustryCta({
  label = "Start free",
  outline = false,
}: {
  label?: string;
  outline?: boolean;
}) {
  const { open } = useAuthDialog();
  return (
    <button
      type="button"
      onClick={() => open("signup")}
      className={outline ? "ind-cta-btn ind-cta-btn-outline" : "ind-cta-btn"}
    >
      {label} &rarr;
    </button>
  );
}

export type TocItem = { id: string; label: string };

export function IndustryToc({ items }: { items: TocItem[] }) {
  const tocRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const nav = tocRef.current;
            if (!nav) return;
            nav.querySelectorAll("a").forEach((a) => {
              a.classList.toggle(
                "ind-toc-active",
                a.getAttribute("href") === `#${id}`,
              );
            });
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  return (
    <aside className="ind-sidebar">
      <nav className="ind-toc" ref={tocRef} aria-label="On this page">
        <h3>On this page</h3>
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}

function euro(n: number): string {
  return `€${Math.round(n).toLocaleString("en-US")}`;
}

export function IndustryRoiCalculator({
  jobValueLabel,
  defaultJobValue,
  defaultMissedCalls,
  note,
}: {
  jobValueLabel: string;
  defaultJobValue: number;
  defaultMissedCalls: number;
  note: string;
}) {
  const [missedPerWeek, setMissedPerWeek] = useState(defaultMissedCalls);
  const [convertPct, setConvertPct] = useState(30);
  const [jobValue, setJobValue] = useState(defaultJobValue);

  const jobStep = defaultJobValue >= 1000 ? 100 : 10;

  const { recoveredCalls, newCustomers, revenue, roiVsPlan } = useMemo(() => {
    const recoveredCalls = missedPerWeek * 4.33;
    const newCustomers = recoveredCalls * (convertPct / 100);
    const revenue = newCustomers * jobValue;
    // Solo plan is €99/mo; how many times over the plan pays back (illustrative).
    const roiVsPlan = revenue / 99;
    return { recoveredCalls, newCustomers, revenue, roiVsPlan };
  }, [missedPerWeek, convertPct, jobValue]);

  return (
    <div className="ind-calc">
      <div className="ind-panel-label">Estimate what answered calls are worth</div>
      <div className="ind-calc-controls">
        <div className="ind-calc-control">
          <div className="ind-calc-control-top">
            <span>Missed calls per week</span>
            <span className="ind-calc-val">{missedPerWeek}</span>
          </div>
          <input
            type="range"
            min={2}
            max={60}
            step={1}
            value={missedPerWeek}
            onChange={(e) => setMissedPerWeek(Number(e.target.value))}
            aria-label="Missed calls per week"
          />
        </div>
        <div className="ind-calc-control">
          <div className="ind-calc-control-top">
            <span>Share that would become customers</span>
            <span className="ind-calc-val">{convertPct}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={80}
            step={5}
            value={convertPct}
            onChange={(e) => setConvertPct(Number(e.target.value))}
            aria-label="Share of recovered calls that become customers"
          />
        </div>
        <div className="ind-calc-control">
          <div className="ind-calc-control-top">
            <span>{jobValueLabel}</span>
            <span className="ind-calc-val">{euro(jobValue)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(1000, defaultJobValue * 3)}
            step={jobStep}
            value={jobValue}
            onChange={(e) => setJobValue(Number(e.target.value))}
            aria-label={jobValueLabel}
          />
        </div>
      </div>

      <div className="ind-calc-results">
        <div className="ind-calc-card">
          <div className="ind-calc-card-label">Calls recovered / mo</div>
          <div className="ind-calc-card-value">{Math.round(recoveredCalls)}</div>
          <div className="ind-calc-card-sub">answered instead of missed</div>
        </div>
        <div className="ind-calc-card">
          <div className="ind-calc-card-label">New customers / mo</div>
          <div className="ind-calc-card-value">
            {newCustomers < 10 ? newCustomers.toFixed(1) : Math.round(newCustomers)}
          </div>
          <div className="ind-calc-card-sub">at {convertPct}% conversion</div>
        </div>
        <div className="ind-calc-card ind-calc-card--hero">
          <div className="ind-calc-card-label">Added revenue / mo</div>
          <div className="ind-calc-card-value">{euro(revenue)}</div>
          <div className="ind-calc-card-sub">
            ~{roiVsPlan >= 1 ? `${Math.round(roiVsPlan)}x` : "under"} the €99 plan
          </div>
        </div>
      </div>

      <p className="ind-calc-note">{note}</p>
    </div>
  );
}
