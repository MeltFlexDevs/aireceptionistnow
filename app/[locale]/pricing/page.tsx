import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PLANS } from "@/lib/plans";
import { siteName, siteUrl } from "@/lib/site";
import { alternatesFor } from "@/lib/i18n/marketing/alternates";
import {
  MARKETING_LOCALES,
  OG_LOCALE,
  isMarketingLocale,
  type MarketingLocale,
} from "@/lib/i18n/marketing/locales";
import { isPublished } from "@/lib/i18n/marketing/manifest";
import { localeOptions } from "@/lib/i18n/marketing/switcher";
import { navHrefs } from "@/lib/i18n/marketing/href";
import { PRICING_COPY } from "@/content/i18n/pricing-registry";
import { UI_COPY } from "@/content/i18n/ui-registry";
import PricingClient from "@/app/(main)/pricing/PricingClient";

// Gated per locale exactly like the home route. A locale whose pricing page is
// unreviewed returns [] here, so the URL is never built and dynamicParams=false
// turns it into a hard 404.
//
// DO NOT lift this into app/[locale]/layout.tsx - a layout-level
// generateStaticParams overrides leaf gating and publishes every locale.
export function generateStaticParams(): { locale: MarketingLocale }[] {
  return MARKETING_LOCALES.filter((locale) =>
    isPublished(locale, "pricing"),
  ).map((locale) => ({ locale }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) return {};
  const copy = PRICING_COPY[locale];

  return {
    title: { absolute: `${copy.h1} | ${siteName}` },
    description: copy.sub,
    alternates: alternatesFor("pricing", locale),
    openGraph: {
      title: copy.h1,
      description: copy.sub,
      type: "website",
      url: `${siteUrl}/${locale}/pricing`,
      siteName,
      locale: OG_LOCALE[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.h1,
      description: copy.sub,
    },
  };
}

export default async function LocalizedPricing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isMarketingLocale(locale) || !isPublished(locale, "pricing")) notFound();

  const copy = PRICING_COPY[locale];

  // Prices come from PLANS, never from the translation, so a translator can
  // never change what a plan costs. Only the display text is localized.
  const prices = PLANS.map((p) => p.monthlyAmountCents / 100);
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "BusinessApplication",
    inLanguage: locale,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: String(Math.min(...prices)),
      highPrice: String(Math.max(...prices)),
      offerCount: PLANS.length,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <PricingClient
        localeOptions={localeOptions("pricing", locale)}
        copy={copy}
        ui={UI_COPY[locale]}
        nav={navHrefs(locale)}
      />
    </>
  );
}
