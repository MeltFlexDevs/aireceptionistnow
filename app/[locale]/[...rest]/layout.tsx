import type { Metadata } from "next";

import NotFoundView from "@/app/components/NotFoundView";
import { EN_NOT_FOUND_LINKS } from "@/app/components/en-not-found-links";
import { UI_COPY } from "@/content/i18n/ui-registry";
import { navHrefs } from "@/lib/i18n/marketing/href";
import { isMarketingLocale } from "@/lib/i18n/marketing/locales";
import { localizedNotFoundLinks } from "@/lib/i18n/marketing/not-found-links";

type Params = Promise<{ locale: string; rest: string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  // Same metadata as app/(main)/not-found.tsx.
  if (!isMarketingLocale(locale)) {
    return { title: "Page not found", robots: { index: false }, alternates: { canonical: null } };
  }
  return {
    title: UI_COPY[locale].notFound.metaTitle,
    robots: { index: false },
    alternates: { canonical: null },
  };
}

// The localized 404 (see ./page.tsx). An unknown first segment (/blog/old-post,
// /xx/nope) is not a locale: it gets the English view, as app/(main)/not-found.tsx
// and app/global-not-found.tsx render it.
export default async function LocaleNotFoundLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { locale } = await params;
  if (!isMarketingLocale(locale)) {
    return (
      <>
        <NotFoundView links={EN_NOT_FOUND_LINKS} />
        {children}
      </>
    );
  }
  return (
    <>
      <NotFoundView ui={UI_COPY[locale]} nav={navHrefs(locale)} links={localizedNotFoundLinks(locale)} />
      {children}
    </>
  );
}
