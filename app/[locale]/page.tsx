import type { Metadata } from "next";
import { notFound } from "next/navigation";

import HomeClient from "@/app/_home/HomeClient";
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
import { UI_COPY } from "@/content/i18n/ui-registry";
import type { HomeCopy } from "@/content/i18n/_home-copy";
import { esHome } from "@/content/i18n/es/pages/home";
import { deHome } from "@/content/i18n/de/pages/home";
import { frHome } from "@/content/i18n/fr/pages/home";
import { skHome } from "@/content/i18n/sk/pages/home";
import { itHome } from "@/content/i18n/it/pages/home";
import { ptHome } from "@/content/i18n/pt/pages/home";
import { nlHome } from "@/content/i18n/nl/pages/home";

// Every marketing locale now has copy, so this is a total Record: adding a
// locale to MARKETING_LOCALES without adding its copy here is a compile error
// rather than a page that silently renders English under a localized URL.
const HOME_COPY: Record<MarketingLocale, HomeCopy> = {
  es: esHome,
  de: deHome,
  fr: frHome,
  sk: skHome,
  it: itHome,
  pt: ptHome,
  nl: nlHome,
};

// Only locales whose home page is reviewed become routable. With every
// manifest empty this returns [], so the build produces zero localized URLs
// and dynamicParams=false makes /de, /es, /fr, /sk a hard 404.
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
  return {
    title: { absolute: `${copy.hero.h1} | ${siteName}` },
    description: copy.metaDescription,
    alternates: alternatesFor("home", locale),
    openGraph: {
      title: copy.hero.h1,
      description: copy.metaDescription,
      type: "website",
      url: `${siteUrl}/${locale}`,
      siteName,
      locale: OG_LOCALE[locale],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.hero.h1,
      description: copy.metaDescription,
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
