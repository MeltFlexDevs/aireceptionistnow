import type { Metadata } from "next";
import Link from "next/link";

import { siteUrl, siteName } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { INDUSTRIES } from "./_industries/registry";
import "./_industries/industries.css";

const title = "AI Receptionist by Industry";
const description =
  "AI phone receptionist built for your industry: dentists, restaurants, law firms, home services, and property management. Answers 24/7, books, and captures leads.";
const url = `${siteUrl}/industries`;

export const metadata: Metadata = {
  title: { absolute: `${title} | ${siteName}` },
  description,
  keywords: [
    "AI receptionist by industry",
    "AI receptionist for dentists",
    "AI receptionist for restaurants",
    "AI receptionist for law firms",
    "AI receptionist for home services",
    "AI receptionist for property management",
    "industry answering service",
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
    "@type": "CollectionPage",
    name: title,
    url,
    description,
    isPartOf: { "@id": `${siteUrl}/#website` },
    hasPart: INDUSTRIES.map((i) => ({
      "@type": "WebPage",
      name: `AI Receptionist for ${i.industry}`,
      url: `${siteUrl}/industries/${i.slug}`,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: INDUSTRIES.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `AI Receptionist for ${i.industry}`,
      url: `${siteUrl}/industries/${i.slug}`,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Industries", item: url },
    ],
  },
];

export default function IndustriesHub() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="ind-hub">
        <section className="ind-hub-hero">
          <span className="ind-hub-eyebrow">Industries</span>
          <h1>An AI receptionist that speaks your industry</h1>
          <p>
            The same 24/7 AI phone agent, tuned to how your business actually
            takes calls. It answers every call, books appointments, and captures
            leads in 25+ languages. Pick your industry to see how.
          </p>
        </section>

        <div className="ind-hub-grid">
          {INDUSTRIES.map((i) => (
            <Link
              key={i.slug}
              href={`/industries/${i.slug}`}
              className="ind-hub-card"
              style={{ ["--ind-accent" as string]: i.accent } as React.CSSProperties}
            >
              <span className="ind-hub-eyebrow">{i.eyebrow}</span>
              <h2>{i.industry}</h2>
              <p>{i.heroSub}</p>
              <span className="ind-hub-card-cta">See how it works &rarr;</span>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
