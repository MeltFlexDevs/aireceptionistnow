import type { ContentLocale } from "./locales";

/**
 * Fallback dial code for the hero test-call form, by page locale.
 *
 * PRECEDENCE (do not reorder):
 *   1. a code the visitor picked by hand   - never overridden
 *   2. geo (x-vercel-ip-country)           - most accurate
 *   3. this locale default                 - used when geo is unavailable
 *
 * Locale deliberately does NOT beat geo. The visitor types their OWN number,
 * so where they physically are determines its country code: a German speaker
 * in Austria on /de should get +43, not +49. This only replaces the previous
 * hardcoded "+1", which showed a US flag to every visitor whose country header
 * was missing or outside the map in app/api/geo/route.ts.
 *
 * Each locale maps to its primary market, since a locale covers several
 * countries (de -> DE/AT/CH, fr -> FR/BE/CH, es -> ES plus LatAm) and geo
 * resolves the difference whenever it is available.
 */
export const LOCALE_DIAL_CODE: Record<ContentLocale, string> = {
  en: "+1",
  es: "+34",
  de: "+49",
  fr: "+33",
  sk: "+421",
  it: "+39",
  pt: "+351",
  nl: "+31",
};

/** ISO country whose flag pairs with the locale default above. */
export const LOCALE_DIAL_COUNTRY: Record<ContentLocale, string> = {
  en: "US",
  es: "ES",
  de: "DE",
  fr: "FR",
  sk: "SK",
  it: "IT",
  pt: "PT",
  nl: "NL",
};
