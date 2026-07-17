import type { Metadata } from "next";

import { PLANS } from "@/lib/plans";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import PricingClient from "./PricingClient";

const description =
  "Simple AI receptionist pricing - Solo and Team plans, billed monthly or annually (save 15%). 30-day money-back guarantee. Live in 10 minutes.";

export const metadata: Metadata = {
  title: "Pricing",
  description,
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: "Pricing - AI Receptionist Now",
    description,
    url: `${siteUrl}/pricing`,
    type: "website",
    siteName,
  },
};

// Mirrors the home page's SoftwareApplication markup so the money page also
// tells crawlers what is sold here and at what price range.
const prices = PLANS.map((p) => p.monthlyAmountCents / 100);
const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteName,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  url: siteUrl,
  description: siteDescription,
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: String(Math.min(...prices)),
    highPrice: String(Math.max(...prices)),
    offerCount: PLANS.length,
    url: `${siteUrl}/pricing`,
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Pricing", item: `${siteUrl}/pricing` },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([softwareJsonLd, breadcrumbJsonLd]) }}
      />
      <PricingClient />
    </>
  );
}
