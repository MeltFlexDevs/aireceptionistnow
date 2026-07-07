import type { Metadata } from "next";
import Link from "next/link";

import { siteUrl, siteName, logoUrl } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { CompareCta } from "./_compare/compare-client";
import { COMPETITORS } from "./_compare/competitors";
import "./_compare/compare.css";

const PATH = "/compare";
const url = `${siteUrl}${PATH}`;

const title = "Best AI Receptionist Alternatives: Smith.ai, Ruby, Rosie, Goodcall & More";
const description =
  "Honest, side-by-side comparisons of AI Receptionist Now against Smith.ai, Ruby, Rosie, Goodcall and My AI Front Desk. See how flat, per-minute, multilingual pricing stacks up.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AI receptionist comparison",
    "Smith.ai alternative",
    "AI answering service comparison",
    "virtual receptionist alternatives",
    "best AI receptionist",
  ],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    type: "website",
    url,
    siteName,
    images: [{ url: `${siteUrl}/opengraph-image.png`, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}/opengraph-image.png`],
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Compare", item: url },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url,
    description,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: { "@type": "ImageObject", url: logoUrl },
    },
  },
];

export default function CompareHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <div className="compare-page">
        <section className="compare-hero">
          <div className="compare-hero-inner" style={{ gridTemplateColumns: "1fr" }}>
            <div className="compare-hero-left" style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
              <div className="compare-badge">Comparisons &middot; 2026</div>
              <h1>The best AI receptionist alternatives</h1>
              <p className="compare-hero-sub">
                Shopping for an AI receptionist is confusing: per-call vs
                per-minute, AI vs human, setup in minutes vs days. These are the
                honest, side-by-side breakdowns against Smith.ai, Ruby, Rosie,
                Goodcall and My AI Front Desk, including where each competitor
                genuinely wins.
              </p>
              <div className="compare-hero-cta" style={{ justifyContent: "center" }}>
                <CompareCta label="Start free" />
                <Link href="/pricing" className="compare-cta-btn compare-cta-btn-outline">
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="compare-main" style={{ justifyContent: "center" }}>
          <article className="compare-article" style={{ maxWidth: 900 }}>
            <div className="compare-diagnostic">
              <div className="compare-diagnostic-label">Head-to-head comparisons</div>
              <div className="compare-diagnostic-grid">
                {COMPETITORS.map((c) => (
                  <Link key={c.slug} className="compare-diagnostic-card" href={`/compare/${c.slug}`}>
                    <span className="compare-diagnostic-title">{c.title} &rarr;</span>
                    <p>{c.blurb}</p>
                  </Link>
                ))}
                <Link className="compare-diagnostic-card" href="/pricing">
                  <span className="compare-diagnostic-title">Our pricing &rarr;</span>
                  <p>Two flat plans, free to start, €0.09 per extra minute — no per-call fees.</p>
                </Link>
                <Link className="compare-diagnostic-card" href="/answers">
                  <span className="compare-diagnostic-title">Buyer answers &rarr;</span>
                  <p>Straight answers to the questions people ask before switching.</p>
                </Link>
              </div>
            </div>

            <div className="compare-cta-section">
              <h2>The short version</h2>
              <p>
                Flat monthly pricing, billed by the minute. 25+ languages. Live in
                about ten minutes. Free to start. See it answer a real call.
              </p>
              <div className="compare-cta-buttons">
                <CompareCta label="Start free" />
                <Link href="/#how-it-works" className="compare-cta-btn compare-cta-btn-outline">
                  How it works
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
