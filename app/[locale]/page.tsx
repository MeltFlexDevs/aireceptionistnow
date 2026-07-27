import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HomeClient from "@/app/_home/HomeClient";
import { ogCardImage, siteName, siteUrl } from "@/lib/site";
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
import { UI_COPY } from "@/content/i18n/ui-registry";
import { HOME_COPY } from "@/content/i18n/home-registry";

// Only locales whose home page is reviewed become routable. All seven are
// reviewed as of 2026-07-27, so this returns the full list; an entry flipped
// back to "draft" drops out here and dynamicParams=false makes its URL a hard
// 404 again.
export function generateStaticParams(): { locale: MarketingLocale }[] {
  return MARKETING_LOCALES.filter((locale) => isPublished(locale, "home")).map(
    (locale) => ({ locale }),
  );
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) return {};
  const copy = HOME_COPY[locale];

  // Metadata merging is shallow: a partial openGraph here would REPLACE the root
  // layout's openGraph wholesale, dropping og:url/og:site_name/og:type and
  // inheriting locale "en_US". So the openGraph below is complete, mirroring
  // app/[locale]/pricing/page.tsx. Title/description come from the reviewed
  // translation so localized homes never emit the English defaults.
  //
  // The SERP title is copy.metaTitle, NOT `${hero.h1} | ${siteName}`. The suffix
  // cost 22 characters of a ~60-character budget and pushed the head keyword out
  // of the visible part of the result; hero.h1 is now free to be a headline
  // while metaTitle is written to be clicked. og:title keeps h1, which is what a
  // social preview should show.
  return {
    title: { absolute: copy.metaTitle },
    description: copy.metaDescription,
    alternates: alternatesFor("home", locale),
    openGraph: {
      title: copy.hero.h1,
      description: copy.metaDescription,
      type: "website",
      url: `${siteUrl}/${locale}`,
      siteName,
      locale: OG_LOCALE[locale],
      // Explicit because this tree cannot use the opengraph-image.png file
      // convention - see the ogCardImage note in lib/site.ts.
      images: [ogCardImage],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.hero.h1,
      description: copy.metaDescription,
      images: [ogCardImage],
    },
  };
}

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isMarketingLocale(locale) || !isPublished(locale, "home")) notFound();

  const copy = HOME_COPY[locale];
  // A locale can only be routable if isPublished passed, and isPublished
  // requires a manifest entry. A missing copy object therefore means the
  // manifest and the copy files disagree, which must fail loudly rather than
  // silently serving English under a localized URL.
  if (!copy) notFound();

  return (
    <HomeClient
      localeOptions={localeOptions("home", locale)}
      locale={locale}
      copy={copy}
      ui={UI_COPY[locale]}
      nav={navHrefs(locale)}
    />
  );
}
