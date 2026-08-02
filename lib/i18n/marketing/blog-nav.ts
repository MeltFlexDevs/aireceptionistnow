import { siteUrl } from "@/lib/site";
import {
  getLocalizedPostBySource,
  localizedPosts,
} from "@/content/i18n/posts-registry";
import { abs } from "./alternates";
import { localizedPageIdToPath } from "./ids";
import { LOCALES } from "@/lib/i18n/config";
import { MARKETING_LOCALES, type ContentLocale, type MarketingLocale } from "./locales";
import { isPublished } from "./manifest";
import type { LocaleOption } from "./switcher";

// SERVER-ONLY. Importing this pulls in posts-registry, which pulls in every
// translated article body - hundreds of KB of JSX. Call it from a server page
// and pass the plain result down; never import it from a "use client" module.
//
// Why blog posts don't use the manifest the way home and pricing do:
//
// The manifest is flat data that the client-rendered SiteFooter loads in order
// to build localized hrefs. Listing 36 articles x 7 locales in it would ship a
// few hundred entries to every visitor's browser to answer a question only the
// blog templates ever ask. So the manifest carries ONE "blog" entry per locale
// - the section gate, covering the chrome and the index page - and which
// individual articles exist in a locale is answered here, from the registry,
// at build time on the server.
//
// The gate still applies: a locale whose "blog" entry is unreviewed publishes
// no articles at all, no matter what sits in its content directory.

/** Locales that have this article AND a published blog section. */
export function blogPostLocales(source: string): MarketingLocale[] {
  return MARKETING_LOCALES.filter(
    (locale) =>
      isPublished(locale, "blog") &&
      getLocalizedPostBySource(locale, source) !== undefined,
  );
}

/** Localized articles for a locale, or [] while its blog section is unreviewed. */
export function publishedLocalizedPosts(locale: MarketingLocale) {
  return isPublished(locale, "blog") ? localizedPosts(locale) : [];
}

/**
 * Canonical + hreflang cluster for one article, keyed by its ENGLISH slug.
 *
 * Mirrors alternatesFor() exactly - same reciprocity guarantee, same
 * language-only codes, same x-default on the English URL - but resolves cluster
 * membership from the registry instead of the manifest. Both build their URLs
 * with the same abs()/localizedPageIdToPath pair, so a localized slug cannot be
 * right in one and wrong in the other.
 */
export function blogAlternatesFor(source: string, current: ContentLocale) {
  const pageId = `blog/${source}` as const;
  const others = blogPostLocales(source);
  if (others.length === 0) return { canonical: abs("en", pageId) };

  const languages: Record<string, string> = { en: abs("en", pageId) };
  for (const locale of others) languages[locale] = abs(locale, pageId);
  languages["x-default"] = abs("en", pageId);

  return { canonical: abs(current, pageId), languages };
}

const META: Record<string, { label: string; flag: string }> = Object.fromEntries(
  LOCALES.map((l) => [l.code, { label: l.label, flag: l.flag }]),
);

/** Language menu for one article. [] when it exists only in English. */
export function blogLocaleOptions(
  source: string,
  current: ContentLocale,
): LocaleOption[] {
  const translated = blogPostLocales(source);
  if (translated.length === 0) return [];

  const pageId = `blog/${source}` as const;
  const build = (locale: ContentLocale): LocaleOption => ({
    locale,
    label: META[locale]?.label ?? locale.toUpperCase(),
    flag: META[locale]?.flag ?? "",
    href: localizedPageIdToPath(locale, pageId),
    current: current === locale,
  });

  return [build("en"), ...translated.map(build)];
}

/** Absolute URL of an article in a locale. Used by JSON-LD and the sitemap. */
export function blogPostUrl(locale: ContentLocale, source: string): string {
  return `${siteUrl}${localizedPageIdToPath(locale, `blog/${source}`)}`;
}
