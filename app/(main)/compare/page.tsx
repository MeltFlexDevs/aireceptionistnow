import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { siteUrl, siteName } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { COMPETITORS } from "./_compare/competitors";
import "./_compare/compare.css";

const title = "AI Receptionist Alternatives Compared";
const description =
  "How AI Receptionist Now compares to Smith.ai, Ruby, Rosie, Goodcall, and My AI Front Desk: pricing, languages, setup time, and where each one fits.";
const url = `${siteUrl}/compare`;

export const metadata: Metadata = {
  title: { absolute: `${title} | ${siteName}` },
  description,
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

// Two-level breadcrumb: the hub itself sits directly under the home page. Its
// children carry the three-level version.
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url,
    description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    hasPart: COMPETITORS.map((c) => ({
      "@type": "WebPage",
      name: c.title,
      url: `${siteUrl}/compare/${c.slug}`,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: COMPETITORS.map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: c.title,
      url: `${siteUrl}/compare/${c.slug}`,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Compare", item: url },
    ],
  },
];

export default function CompareHub() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="compare-hub">
        <section className="compare-hub-hero">
          <span className="compare-hub-eyebrow">Compare</span>
          <h1>AI receptionist alternatives, compared honestly</h1>
          <p>
            Side-by-side breakdowns of how AI Receptionist Now stacks up against
            the other answering services, including where a competitor is the
            better fit. Pricing, languages, setup time, and what each one
            actually does on a live call.
          </p>
        </section>

        <div className="compare-hub-grid">
          {COMPETITORS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="compare-hub-card"
            >
              <Image
                src={c.logo}
                alt={`${c.competitor} logo`}
                width={88}
                height={22}
                className="compare-hub-logo"
              />
              <h2>vs {c.competitor}</h2>
              <p>{c.blurb}</p>
              <span className="compare-hub-card-cta">
                Read the comparison &rarr;
              </span>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
