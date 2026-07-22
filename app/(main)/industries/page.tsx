import type { Metadata } from "next";
import Link from "next/link";

import { siteUrl, siteName } from "@/lib/site";
import SiteHeader from "@/app/components/SiteHeader";
import SiteFooter from "@/app/components/SiteFooter";
import { INDUSTRY_MENU } from "@/lib/marketing/industries";

const title = "AI Receptionist by Industry";
const description =
  "AI phone receptionist for your industry: dentists, restaurants, e-commerce, law firms, home services, and property management. Answers 24/7, books, captures leads.";
const url = `${siteUrl}/industries`;

export const metadata: Metadata = {
  title: { absolute: `${title} | ${siteName}` },
  description,
  keywords: [
    "AI receptionist by industry",
    "AI receptionist for dentists",
    "AI receptionist for restaurants",
    "AI receptionist for e-commerce",
    "AI receptionist for law firms",
    "AI receptionist for home services",
    "AI receptionist for property management",
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
    hasPart: INDUSTRY_MENU.map((i) => ({
      "@type": "WebPage",
      name: `AI Receptionist for ${i.label}`,
      url: `${siteUrl}/${i.slug}`,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: INDUSTRY_MENU.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `AI Receptionist for ${i.label}`,
      url: `${siteUrl}/${i.slug}`,
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

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  padding: "28px",
  borderRadius: "16px",
  border: "1px solid #eee",
  background: "#fff",
  textDecoration: "none",
  color: "#1D1D1D",
  transition: "border-color 0.2s, transform 0.2s",
};

export default function IndustriesHub() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "160px 24px 96px",
          fontFamily: "var(--font-inter), Inter, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span style={{ fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", fontWeight: 400 }}>
            Industries
          </span>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", fontWeight: 300, letterSpacing: "-0.03em", textTransform: "uppercase", color: "#1D1D1D", margin: "12px 0 0" }}>
            An AI receptionist that speaks your industry
          </h1>
          <p style={{ fontSize: "16px", color: "#888", fontWeight: 300, lineHeight: 1.65, maxWidth: "620px", margin: "16px auto 0" }}>
            The same 24/7 AI phone agent, tuned to how your business actually takes
            calls. It answers every call, books appointments, and captures leads in
            25+ languages. Pick your industry to see how.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {INDUSTRY_MENU.map((i) => (
            <Link key={i.slug} href={`/${i.slug}`} style={cardStyle}>
              <h2 style={{ fontSize: "18px", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>{i.label}</h2>
              <p style={{ fontSize: "14px", color: "#888", fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{i.tagline}</p>
              <span style={{ fontSize: "13px", color: "#1D1D1D", fontWeight: 400, marginTop: "8px" }}>See how it works &rarr;</span>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
