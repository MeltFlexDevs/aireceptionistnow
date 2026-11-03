
const ANCHOR_USD_PER_MINUTE = 0.0085;

export interface NumberCountry {
  code: string;
  name: string;
  flag: string;
  perMinuteUsd: number;
}

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

export function creditsPerMinute(perMinuteUsd: number): number {
  return Math.max(1, Math.round(perMinuteUsd / ANCHOR_USD_PER_MINUTE));
}

export interface CountryPricing extends NumberCountry {
  creditsPerMinute: number;
}

export const NUMBER_COUNTRIES: CountryPricing[] = COUNTRY_RATES.map((c) => ({
  ...c,
  creditsPerMinute: creditsPerMinute(c.perMinuteUsd),
}));

export const DEFAULT_COUNTRY = NUMBER_COUNTRIES[0].code;

// Which number country to preselect for a given UI locale. Every target here
// exists in COUNTRY_RATES; unknown locales fall back to DEFAULT_COUNTRY.
const LOCALE_COUNTRY: Record<string, string> = {
  en: "US",
  es: "ES",
  de: "DE",
  fr: "FR",
  sk: "SK",
  it: "IT",
  pt: "PT",
  nl: "NL",
};

export function countryForLocale(locale: string): string {
  const base = (locale || "").split("-")[0].toLowerCase();
  const code = LOCALE_COUNTRY[base];
  return code && NUMBER_COUNTRIES.some((c) => c.code === code) ? code : DEFAULT_COUNTRY;
}

export function getCountryPricing(code: string): CountryPricing {
  return (
    NUMBER_COUNTRIES.find((c) => c.code === code.toUpperCase()) ??
    NUMBER_COUNTRIES[0]
  );
}

export function minutesForCredits(credits: number, perMinute: number): number {
  if (perMinute <= 0) return 0;
  return Math.floor(credits / perMinute);
}

// example: a local number for the phone field's placeholder, in national format
// without the trunk "0" (the prefix picker shows the +code). Fictional or
// reserved ranges where the country has one (NANP 555-01xx, UK 07700 900xxx).
const DIAL_PREFIXES: { dial: string; code: string; example: string }[] = [
  { dial: "+1", code: "US", example: "415 555 0142" },
  { dial: "+1", code: "CA", example: "416 555 0142" },
  { dial: "+44", code: "GB", example: "7700 900123" },
  { dial: "+353", code: "IE", example: "85 012 3456" },
  { dial: "+31", code: "NL", example: "6 12345678" },
  { dial: "+33", code: "FR", example: "6 12 34 56 78" },
  { dial: "+49", code: "DE", example: "1512 3456789" },
  { dial: "+34", code: "ES", example: "612 34 56 78" },
  { dial: "+39", code: "IT", example: "312 345 6789" },
  { dial: "+46", code: "SE", example: "70 123 45 67" },
  { dial: "+351", code: "PT", example: "912 345 678" },
  { dial: "+32", code: "BE", example: "470 12 34 56" },
  { dial: "+48", code: "PL", example: "512 345 678" },
  { dial: "+61", code: "AU", example: "412 345 678" },
  { dial: "+64", code: "NZ", example: "21 123 4567" },
  { dial: "+43", code: "AT", example: "664 1234567" },
  { dial: "+41", code: "CH", example: "78 123 45 67" },
  { dial: "+420", code: "CZ", example: "601 123 456" },
  { dial: "+421", code: "SK", example: "903 123 456" },
];

export interface DialOption {
  code: string;
  name: string;
  flag: string;
  dial: string;
  example: string;
}

// Country + international dialling prefix, for the phone field's prefix picker.
// Order follows NUMBER_COUNTRIES; entries without a known dial code are dropped.
export const DIAL_OPTIONS: DialOption[] = NUMBER_COUNTRIES.map((c) => ({
  code: c.code,
  name: c.name,
  flag: c.flag,
  dial: DIAL_PREFIXES.find((d) => d.code === c.code)?.dial ?? "",
  example: DIAL_PREFIXES.find((d) => d.code === c.code)?.example ?? "",
})).filter((d) => d.dial);

// Longest dial first, so "+421" wins over a shorter overlapping prefix.
const DIAL_OPTIONS_BY_LENGTH = [...DIAL_OPTIONS].sort((a, b) => b.dial.length - a.dial.length);

// Split a stored E.164 number into a country selection + local remainder for the
// prefix picker. Blank or unrecognized numbers fall back to the given country.
export function splitPhone(value: string, fallbackCode: string): { code: string; local: string } {
  const v = (value || "").replace(/[\s().-]/g, "");
  if (v.startsWith("+")) {
    const opt = DIAL_OPTIONS_BY_LENGTH.find((d) => v.startsWith(d.dial));
    if (opt) return { code: opt.code, local: v.slice(opt.dial.length) };
  }
  return { code: fallbackCode, local: v.replace(/^\+/, "") };
}

// Combine a selected dial prefix with a typed number. A number typed in full
// (leading "+" or "00") wins; otherwise the prefix is prepended and a single
// national trunk "0" is dropped. Returns "" when nothing was entered.
export function joinPhone(dial: string, local: string): string {
  const raw = (local || "").replace(/[\s().-]/g, "");
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("00")) return "+" + raw.slice(2);
  return dial + raw.replace(/^0/, "");
}
