// Marketing-site locales. Deliberately separate from lib/i18n/config.ts, which
// is the DASHBOARD locale set (cookie: dash_locale) covering the authenticated
// product UI. That surface is robots-disallowed and cannot rank; this one is
// the public, indexable marketing tree. The two must not be merged: they have
// different locale lists, different storage, and different SEO consequences.

// Mirrors the non-English half of LOCALES in lib/i18n/config.ts (the dashboard
// set), so the language menu offers the same 8 languages everywhere. Flags and
// labels are read from that same config rather than duplicated here.
export const MARKETING_LOCALES = [
  "es",
  "de",
  "fr",
  "sk",
  "it",
  "pt",
  "nl",
] as const;

export type MarketingLocale = (typeof MARKETING_LOCALES)[number];

/** English is the default and lives at the root, with no /en prefix. */
export type ContentLocale = "en" | MarketingLocale;

export function isMarketingLocale(value: string): value is MarketingLocale {
  return (MARKETING_LOCALES as readonly string[]).includes(value);
}

// og:locale values. Metadata merging is shallow, so a localized page that sets
// openGraph without these would inherit the root layout's "en_US".
export const OG_LOCALE: Record<ContentLocale, string> = {
  en: "en_US",
  es: "es_ES",
  de: "de_DE",
  fr: "fr_FR",
  sk: "sk_SK",
  it: "it_IT",
  pt: "pt_PT",
  nl: "nl_NL",
};

// Intl tags. "en" maps to en-IE to preserve the existing EUR formatting on the
// pricing page byte-for-byte.
export const INTL_LOCALE: Record<ContentLocale, string> = {
  en: "en-IE",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
  sk: "sk-SK",
  it: "it-IT",
  pt: "pt-PT",
  nl: "nl-NL",
};
