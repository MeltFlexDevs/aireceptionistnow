import type { PageId, TranslationEntry } from "@/content/i18n/_types";
import { de } from "@/content/i18n/de/manifest";
import { es } from "@/content/i18n/es/manifest";
import { fr } from "@/content/i18n/fr/manifest";
import { sk } from "@/content/i18n/sk/manifest";
import { it } from "@/content/i18n/it/manifest";
import { pt } from "@/content/i18n/pt/manifest";
import { nl } from "@/content/i18n/nl/manifest";
import { MARKETING_LOCALES, type MarketingLocale } from "./locales";

// STRUCTURAL RULE: this module imports manifests (flat {pageId, status} data)
// and nothing else. It must never import a content module, so that the client
// -rendered SiteFooter can call localizedHref without dragging translated page
// copy into the browser bundle. Same constraint that _industries/nav.ts exists
// to enforce for the industry registry.

const MANIFESTS: Record<MarketingLocale, TranslationEntry[]> = { es, de, fr, sk, it, pt, nl };

/**
 * Preview mode. Set NEXT_PUBLIC_I18N_PREVIEW=1 to make DRAFT translations
 * routable, so a reviewer reads the real rendered page instead of a spreadsheet
 * of strings. Without it there is no way to see a translation before approving
 * it, which makes the review step unusable.
 *
 * next.config.ts sends X-Robots-Tag: noindex on every route when this is on, so
 * a preview deploy cannot be indexed even if someone links to it. Never set it
 * in production.
 */
export const I18N_PREVIEW = process.env.NEXT_PUBLIC_I18N_PREVIEW === "1";

/**
 * THE GATE as a pure function of a manifest, kept separate from the live
 * MANIFESTS so the RULE can be tested against synthetic entries.
 *
 * The separation was earned: the original tests asserted "nothing is published",
 * which was true of the data on the day they were written rather than of the
 * rule, so they passed for the wrong reason and all had to be deleted the first
 * time a locale actually shipped. A test over `gate` keeps working no matter
 * what the manifests say.
 */
export function gate(entries: TranslationEntry[], pageId: PageId): boolean {
  // Chrome gate: every page depends on translated nav/footer/CTA copy.
  const ui = entries.find((e) => e.pageId === "ui");
  const uiOk = I18N_PREVIEW ? ui !== undefined : ui?.status === "reviewed";
  if (!uiOk) return false;

  const entry = entries.find((e) => e.pageId === pageId);
  if (!entry) return false;
  // In preview, anything present in the manifest is routable regardless of
  // status. In production, only "reviewed" publishes.
  return I18N_PREVIEW ? true : entry.status === "reviewed";
}

/**
 * The gate applied to the real manifests. The router, sitemap, hreflang builder
 * and locale switcher all call this and nothing else, so a page cannot be
 * routable in one place and hidden in another.
 *
 * Unreviewed means a hard 404, not merely absent from the sitemap.
 */
export function isPublished(locale: MarketingLocale, pageId: PageId): boolean {
  return gate(MANIFESTS[locale] ?? [], pageId);
}

/** Locales in which this page is live. Drives hreflang and the switcher. */
export function localesFor(pageId: PageId): MarketingLocale[] {
  return MARKETING_LOCALES.filter((l) => isPublished(l, pageId));
}

/** Every published page id for a locale. Drives the sitemap. */
export function publishedPages(locale: MarketingLocale): PageId[] {
  return (MANIFESTS[locale] ?? [])
    .map((e) => e.pageId)
    .filter((p) => p !== "ui" && isPublished(locale, p));
}
