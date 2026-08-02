import type { PageId } from "@/content/i18n/_types";
import { localizedPageIdToPath, pageIdToPath } from "./ids";
import type { ContentLocale } from "./locales";
import { isPublished } from "./manifest";
import { EN_NAV_HREFS, type NavHrefs } from "./nav";

/**
 * Internal link builder for localized pages.
 *
 * Falls back to the English URL when the target has no reviewed translation in
 * the current locale, so a localized page can never link to a 404. This is why
 * in-content links must go through here rather than hardcoding `/${locale}/...`.
 */
export function localizedHref(locale: ContentLocale, pageId: PageId): string {
  if (locale === "en") return pageIdToPath(pageId);
  return isPublished(locale, pageId)
    ? localizedPageIdToPath(locale, pageId)
    : pageIdToPath(pageId);
}

/**
 * Header nav hrefs for a locale.
 *
 * Server-only, because it reads the publish gate: call it in the server page
 * and pass the result down to SiteHeader. A locale whose /pricing is not
 * reviewed yet gets the English /pricing here rather than a 404.
 */
export function navHrefs(locale: ContentLocale): NavHrefs {
  if (locale === "en") return EN_NAV_HREFS;
  return {
    home: localizedHref(locale, "home"),
    industries: localizedHref(locale, "industries"),
    pricing: localizedHref(locale, "pricing"),
  };
}
