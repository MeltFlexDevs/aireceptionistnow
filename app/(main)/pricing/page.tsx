import type { Metadata } from "next";

import { PLANS } from "@/lib/plans";
import { siteDescription, siteName, siteUrl } from "@/lib/site";
import { alternatesFor } from "@/lib/i18n/marketing/alternates";
import { localeOptions } from "@/lib/i18n/marketing/switcher";
import { enPricing } from "@/content/i18n/en/pages/pricing";
import PricingClient from "./PricingClient";

const description =
  "Simple AI receptionist pricing - Solo and Team plans, billed monthly or annually (save 15%). 30-day money-back guarantee. Live in 10 minutes.";

export const metadata: Metadata = {
  title: "Pricing",
  description,
  alternates: alternatesFor("pricing", "en"),
  openGraph: {
    title: "Pricing - AI Receptionist Now",
    description,
    url: `${siteUrl}/pricing`,
    type: "website",
    siteName,
  },
  // Without an explicit block this inherits the root layout's homepage twitter
  // card, so X previews of the money page showed the generic site title.
  twitter: {
    card: "summary_large_image",
    title: "Pricing - AI Receptionist Now",
    description,
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

// Built from the same `details.faqs` the page renders, so the markup can never
// promise an answer the visitor does not see. Omitted entirely when a locale has
// no details block rather than falling back to the English questions.
const faqJsonLd = enPricing.details && {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: enPricing.details.faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [softwareJsonLd, breadcrumbJsonLd, faqJsonLd].filter(Boolean),
          ),
        }}
      />
      <PricingClient localeOptions={localeOptions("pricing", "en")} copy={enPricing} />
    </>
  );
}
