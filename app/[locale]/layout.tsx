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

// No dynamicParams here. Child segments inherit it, and false would also block
// app/[locale]/[...rest] (the localized 404), which has no static params. Each
// leaf page sets dynamicParams = false itself; locale-routes.test.ts checks it.

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Unknown first segments (/blog/old-post, /xx/nope) reach this layout through
  // [...rest] and get lang "en"; [...rest]/layout.tsx shows the English 404.
  // Do not call notFound here: a root layout has no not-found boundary, so
  // Next would send its bare error page. The leaf pages keep their own guards
  // and dynamicParams = false.
  return <RootShell lang={isMarketingLocale(locale) ? locale : "en"}>{children}</RootShell>;
}
