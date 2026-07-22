import type { PageId } from "@/content/i18n/_types";
import { siteUrl } from "@/lib/site";
import { pageIdToPath } from "./ids";
import type { ContentLocale } from "./locales";
import { localesFor } from "./manifest";

// Absolute URLs are built here rather than left to metadataBase resolution.
// Verified: metadataBase does NOT cross into a sibling root layout, and the
// only symptom is a buried build warning plus relative hreflang hrefs, which
// Google ignores. Building them absolutely makes that failure mode impossible.
function abs(locale: ContentLocale, pageId: PageId): string {
  const path = pageIdToPath(pageId);
  const prefixed =
    locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`;
  return prefixed === "/" ? siteUrl : `${siteUrl}${prefixed}`;
}

/**
 * Canonical + hreflang cluster for a page.
 *
 * Reciprocity is structural: every member of the cluster derives it from this
 * same pure function over the same manifest, so the `languages` map is
 * set-identical from every member's perspective. There is no code path that
 * can emit a one-way link, and an unreviewed locale cannot appear because
 * localesFor filters on the gate.
 *
 * Language-only codes throughout. Never en-GB or en-US: a single `en` plus
 * x-default on the already-indexed root URLs serves GB, US and the rest of
 * Europe without minting duplicate English URLs.
 */
export function alternatesFor(pageId: PageId, current: ContentLocale) {
  const others = localesFor(pageId);

  // No reviewed translation: emit exactly what the page emits today, with no
  // hreflang cluster at all. A one-member cluster is noise.
  if (others.length === 0) return { canonical: abs("en", pageId) };

  const languages: Record<string, string> = { en: abs("en", pageId) };
  for (const locale of others) languages[locale] = abs(locale, pageId);
  languages["x-default"] = abs("en", pageId);

  return { canonical: abs(current, pageId), languages };
}
