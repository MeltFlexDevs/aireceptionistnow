
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

export function countryForE164(e164: string): { flag: string; name: string } {
  const match = DIAL_PREFIXES.find((p) => e164.startsWith(p.dial));
  if (!match) return { flag: "🌐", name: "Unknown" };
  const c = getCountryPricing(match.code);
  return { flag: c.flag, name: c.name };
}
