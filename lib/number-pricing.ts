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
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", perMinuteUsd: 0.01 },
  { code: "IE", name: "Ireland", flag: "🇮🇪", perMinuteUsd: 0.01 },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", perMinuteUsd: 0.01 },
  { code: "FR", name: "France", flag: "🇫🇷", perMinuteUsd: 0.011 },
  { code: "DE", name: "Germany", flag: "🇩🇪", perMinuteUsd: 0.011 },
  { code: "ES", name: "Spain", flag: "🇪🇸", perMinuteUsd: 0.011 },
  { code: "IT", name: "Italy", flag: "🇮🇹", perMinuteUsd: 0.012 },
  { code: "SE", name: "Sweden", flag: "🇸🇪", perMinuteUsd: 0.013 },
  { code: "PT", name: "Portugal", flag: "🇵🇹", perMinuteUsd: 0.013 },
  { code: "BE", name: "Belgium", flag: "🇧🇪", perMinuteUsd: 0.013 },
  { code: "PL", name: "Poland", flag: "🇵🇱", perMinuteUsd: 0.014 },
  { code: "AU", name: "Australia", flag: "🇦🇺", perMinuteUsd: 0.016 },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", perMinuteUsd: 0.02 },
  { code: "AT", name: "Austria", flag: "🇦🇹", perMinuteUsd: 0.02 },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", perMinuteUsd: 0.02 },
  { code: "CZ", name: "Czechia", flag: "🇨🇿", perMinuteUsd: 0.03 },
  { code: "SK", name: "Slovakia", flag: "🇸🇰", perMinuteUsd: 0.085 },
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

/** E.164 dialing prefixes for the supported countries. No prefix here is a
 *  prefix of another, so first-match is unambiguous. +1 (NANP) resolves to US —
 *  Canadian numbers share it and can't be told apart from the number alone. */
const DIAL_PREFIXES: { dial: string; code: string }[] = [
  { dial: "+1", code: "US" },
  { dial: "+44", code: "GB" },
  { dial: "+353", code: "IE" },
  { dial: "+31", code: "NL" },
  { dial: "+33", code: "FR" },
  { dial: "+49", code: "DE" },
  { dial: "+34", code: "ES" },
  { dial: "+39", code: "IT" },
  { dial: "+46", code: "SE" },
  { dial: "+351", code: "PT" },
  { dial: "+32", code: "BE" },
  { dial: "+48", code: "PL" },
  { dial: "+61", code: "AU" },
  { dial: "+64", code: "NZ" },
  { dial: "+43", code: "AT" },
  { dial: "+41", code: "CH" },
  { dial: "+420", code: "CZ" },
  { dial: "+421", code: "SK" },
];

/** Country (flag + name) inferred from an E.164 number's dialing prefix, or a
 *  globe fallback when no supported prefix matches. */
export function countryForE164(e164: string): { flag: string; name: string } {
  const match = DIAL_PREFIXES.find((p) => e164.startsWith(p.dial));
  if (!match) return { flag: "🌐", name: "Unknown" };
  const c = getCountryPricing(match.code);
  return { flag: c.flag, name: c.name };
}
