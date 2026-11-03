import type { SuggestionLink } from "@/app/components/NotFoundSuggestions";
import { UI_COPY } from "@/content/i18n/ui-registry";
import { publishedLocalizedPosts } from "./blog-nav";
import { navHrefs } from "./href";
import { localizedPageIdToPath } from "./ids";
import type { MarketingLocale } from "./locales";

/**
 * Did-you-mean targets for the /<locale>/ 404. Server-only (reads the blog
 * registry). Pricing and blog go through navHrefs, so an unpublished section
 * points to English; articles are only the ones published in this locale.
 */
export function localizedNotFoundLinks(locale: MarketingLocale): SuggestionLink[] {
  const ui = UI_COPY[locale];
  const nav = navHrefs(locale);
  return [
    { href: nav.pricing, label: ui.notFound.pricing },
    { href: nav.blog, label: ui.footer.blog },
    ...publishedLocalizedPosts(locale).map((p) => ({
      href: localizedPageIdToPath(locale, `blog/${p.source}`),
      label: p.title,
    })),
  ];
}
