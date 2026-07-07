import Link from "next/link";

import { COMPETITORS } from "./competitors";

/**
 * "Other comparisons" cross-link block, rendered near the foot of each
 * comparison article. Links to the hub, every sibling comparison page, and a
 * couple of high-intent internal pages so the cluster stays interlinked for SEO
 * even while only one comparison exists.
 */
export function RelatedComparisons({ currentSlug }: { currentSlug: string }) {
  const others = COMPETITORS.filter((c) => c.slug !== currentSlug);
  return (
    <section className="compare-section" id="more-comparisons">
      <div className="compare-section-number">More</div>
      <h2>Compare & explore</h2>
      <p>
        Weighing up a few AI receptionists? Start with the questions that
        actually decide it — price, setup time, languages — then try ours free.
      </p>
      <div className="compare-diagnostic">
        <div className="compare-diagnostic-grid">
          {others.map((c) => (
            <Link key={c.slug} className="compare-diagnostic-card" href={`/compare/${c.slug}`}>
              <span className="compare-diagnostic-title">{c.title}</span>
              <p>{c.blurb}</p>
            </Link>
          ))}
          <Link className="compare-diagnostic-card" href="/pricing">
            <span className="compare-diagnostic-title">See our pricing &rarr;</span>
            <p>Two flat plans, free to start, €0.09 per extra minute — no per-call fees.</p>
          </Link>
          <Link className="compare-diagnostic-card" href="/answers">
            <span className="compare-diagnostic-title">AI receptionist answers &rarr;</span>
            <p>Straight answers to the questions buyers ask before switching.</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
