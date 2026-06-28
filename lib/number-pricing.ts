/**
 * Per-country phone-number pricing expressed in account "credits".
 *
 * A plan's included talk minutes are spent as credits: a number's country sets
 * how many credits each minute of talk costs. The US is the cheapest carrier
 * rate, so it anchors the scale at 1 credit/minute — meaning a 1,000-credit plan
 * buys exactly 1,000 US minutes. Pricier countries cost proportionally more
 * credits per minute, so the same pool buys fewer minutes there.
 *
 * `perMinuteUsd` is the underlying Twilio inbound local-voice rate (the real
 * cost we pay). `creditsPerMinute` is derived from it — rounded relative to the
 * US anchor — so the credit cost a customer sees and the carrier cost we pay can
 * never drift apart. Adjust a rate in one place and the credit cost follows.
 */

/** Twilio inbound local-voice rate that anchors the credit scale (US, USD/min). */
const ANCHOR_USD_PER_MINUTE = 0.0085;

export interface NumberCountry {
  /** ISO 3166-1 alpha-2 code passed to Twilio when buying the number. */
  code: string;
  name: string;
  flag: string;
  /** Underlying Twilio inbound local-voice rate, USD per minute. */
  perMinuteUsd: number;
}

/**
 * Source-of-truth rate table. Order is cheapest → priciest so the dropdown reads
 * as a price ladder. Rates are Twilio inbound local-voice prices (approximate;
 * refresh from twilio.com/voice/pricing when they change).
 */
const COUNTRY_RATES: NumberCountry[] = [
  { code: "US", name: "United States", flag: "🇺🇸", perMinuteUsd: 0.0085 },
  { code: "CA", name: "Canada", flag: "🇨🇦", perMinuteUsd: 0.0085 },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", perMinuteUsd: 0.0100 },
  { code: "AU", name: "Australia", flag: "🇦🇺", perMinuteUsd: 0.0160 },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", perMinuteUsd: 0.0850 },
];

/** Credits charged per talk-minute for a number in this country (US = 1). */
export function creditsPerMinute(perMinuteUsd: number): number {
  return Math.max(1, Math.round(perMinuteUsd / ANCHOR_USD_PER_MINUTE));
}

export interface CountryPricing extends NumberCountry {
  /** Credits charged per talk-minute (US anchored at 1). */
  creditsPerMinute: number;
}

/** The selectable countries with their derived per-minute credit cost. */
export const NUMBER_COUNTRIES: CountryPricing[] = COUNTRY_RATES.map((c) => ({
  ...c,
  creditsPerMinute: creditsPerMinute(c.perMinuteUsd),
}));

/** Default country (the cheapest / anchor). */
export const DEFAULT_COUNTRY = NUMBER_COUNTRIES[0].code;

/** Look a country up by ISO code (falls back to the default). */
export function getCountryPricing(code: string): CountryPricing {
  return (
    NUMBER_COUNTRIES.find((c) => c.code === code.toUpperCase()) ??
    NUMBER_COUNTRIES[0]
  );
}

/** Whole talk-minutes a credit balance buys at the given per-minute cost. */
export function minutesForCredits(credits: number, perMinute: number): number {
  if (perMinute <= 0) return 0;
  return Math.floor(credits / perMinute);
}
