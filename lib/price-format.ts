import { INTL_LOCALE, type ContentLocale } from "@/lib/i18n/marketing/locales";

/**
 * Formats a euro amount in the page locale: "€299" in English, "299 €" in
 * Slovak. The currency is always EUR. Without fractionDigits, a whole amount
 * shows no decimals and any other amount shows two.
 */
export function formatEur(amount: number, locale: ContentLocale, fractionDigits?: number): string {
  const digits = fractionDigits ?? (Number.isInteger(amount) ? 0 : 2);
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}
