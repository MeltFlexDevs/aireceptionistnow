"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useAuthDialog } from "@/app/components/AuthDialog";

export function CompareCta({
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
      className={outline ? "compare-cta-btn compare-cta-btn-outline" : "compare-cta-btn"}
    >
      {label} &rarr;
    </button>
  );
}

export type TocItem = { id: string; label: string };

export function CompareToc({ items }: { items: TocItem[] }) {
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
                "compare-toc__link--active",
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
    <aside className="compare-sidebar">
      <nav className="compare-toc" ref={tocRef}>
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

export type CompetitorPricing = {
  name: string;
  currency: string;
  planLabel: string;
} & (
  | {
      model: "perCall";
      base: number;
      includedCalls: number;
      overagePerCall: number;
    }
  | {
      model: "perMinute";
      base: number;
      includedMinutes: number;
      overagePerMinute: number;
      roundsUp?: boolean;
    }
);

function money(currency: string, n: number) {
  const rounded = Math.round(n);
  return `${currency}${rounded.toLocaleString("en-US")}`;
}

export function CompareCalculator({
  competitor,
  sourceUrl,
}: {
  competitor: CompetitorPricing;
  sourceUrl: string;
}) {
  const [calls, setCalls] = useState(120);
  const [avgLen, setAvgLen] = useState(4);

  const { ourCost, ourPlan, theirCost, minutes } = useMemo(() => {
    const minutes = calls * avgLen;
    const solo = 99 + Math.max(0, minutes - 1000) * 0.09;
    const team = 299 + Math.max(0, minutes - 3000) * 0.09;
    const ourCost = Math.min(solo, team);
    const ourPlan = solo <= team ? "Solo" : "Team";

    let theirCost: number;
    if (competitor.model === "perCall") {
      theirCost =
        competitor.base +
        Math.max(0, calls - competitor.includedCalls) * competitor.overagePerCall;
    } else {
      theirCost =
        competitor.base +
        Math.max(0, minutes - competitor.includedMinutes) * competitor.overagePerMinute;
    }
    return { ourCost, ourPlan, theirCost, minutes };
  }, [calls, avgLen, competitor]);

  const weWin = ourCost < theirCost;

  return (
    <div className="compare-calc">
      <div className="compare-calc-label">Estimate your monthly cost</div>
      <div className="compare-calc-controls">
        <div className="compare-calc-control">
          <div className="compare-calc-control-top">
            <span>Calls per month</span>
            <span className="compare-calc-val">{calls}</span>
          </div>
          <input
            type="range"
            min={20}
            max={600}
            step={10}
            value={calls}
            onChange={(e) => setCalls(Number(e.target.value))}
            aria-label="Calls per month"
          />
        </div>
        <div className="compare-calc-control">
          <div className="compare-calc-control-top">
            <span>Average call length</span>
            <span className="compare-calc-val">{avgLen} min</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={avgLen}
            onChange={(e) => setAvgLen(Number(e.target.value))}
            aria-label="Average call length in minutes"
          />
        </div>
      </div>

      <div className="compare-calc-results">
        <div className={`compare-calc-card${weWin ? " compare-calc-card--win" : ""}`}>
          <div className="compare-calc-card-name">
            AI Receptionist Now
            <span className="compare-calc-plan">{ourPlan}</span>
          </div>
          <div className="compare-calc-price">{money("€", ourCost)}</div>
          <div className="compare-calc-sub">
            {minutes.toLocaleString("en-US")} min · billed per minute
          </div>
        </div>
        <div className={`compare-calc-card${!weWin ? " compare-calc-card--win" : ""}`}>
          <div className="compare-calc-card-name">
            {competitor.name}
            <span className="compare-calc-plan">{competitor.planLabel}</span>
          </div>
          <div className="compare-calc-price">{money(competitor.currency, theirCost)}</div>
          <div className="compare-calc-sub">
            {competitor.model === "perCall"
              ? `${calls} calls · billed per call`
              : `${minutes.toLocaleString("en-US")} min · billed per minute`}
          </div>
        </div>
      </div>

      <p className="compare-calc-note">
        Illustrative estimate at{" "}
        <a href={sourceUrl} target="_blank" rel="nofollow noopener noreferrer">
          {competitor.name}&apos;s published rates
        </a>
        . Your real bill depends on call mix and length. Figures shown in each
        provider&apos;s own currency, not currency-converted.
      </p>
    </div>
  );
}
