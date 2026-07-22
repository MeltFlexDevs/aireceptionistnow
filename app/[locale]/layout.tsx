import { notFound } from "next/navigation";

import RootShell, { baseMetadata, baseViewport } from "@/app/_shared/root-shell";
import { isMarketingLocale } from "@/lib/i18n/marketing/locales";

// DO NOT ADD generateStaticParams TO THIS FILE.
//
// Verified empirically against Next 16.2.9: a layout-level generateStaticParams
// OVERRIDES leaf-level gating. With this layout returning all four locales and
// a leaf returning [], all four localized URLs were still prerendered into
// prerender-manifest.json. That is exactly the "untranslated page goes live"
// failure this whole design exists to prevent.
//
// Locale params come from the leaves, each pruned by isPublished().

// This is a ROOT layout: it renders <html>, as the sibling app/(main)/layout.tsx
// does for English. It has to be, because <html lang> must carry the locale and
// only a root layout may render <html>. While this sat nested under a single
// app/layout.tsx, /de was served as <html lang="en">.
//
// baseMetadata is re-exported, not inherited: metadata does not cross between
// sibling root layouts, and without metadataBase here every hreflang and
// canonical on a localized page would degrade to a relative href.
export const metadata = baseMetadata;
export const viewport = baseViewport;

export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // dynamicParams=false already 404s unknown params; this is belt and braces
  // for the dev server, where dynamicParams is not enforced the same way.
  if (!isMarketingLocale(locale)) notFound();

  return <RootShell lang={locale}>{children}</RootShell>;
}
