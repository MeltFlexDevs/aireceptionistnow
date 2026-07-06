// Guess the caller's language from their phone number's country calling code, so
// the assistant can greet them in their own language before they've said a word.
// This is only a first guess: once the caller actually speaks, live STT language
// detection (see session onLanguageDetected) overrides it — speech is truth, the
// dialing code is a hint. Applies only in auto-language mode.

import { baseLanguage } from "./catalog";

// E.164 calling code -> dominant base language. For multilingual countries we
// pick the most common business language (e.g. CH/AT -> de, BE -> fr, CA -> en).
// Longest matching prefix wins, so 3-digit codes take precedence over 1-2 digit.
const CODE_TO_LANGUAGE: Record<string, string> = {
  // English
  "1": "en", // US / Canada
  "44": "en", // UK
  "61": "en", // Australia
  "64": "en", // New Zealand
  "353": "en", // Ireland
  "27": "en", // South Africa
  "63": "en", // Philippines
  "91": "en", // India (en for business)
  // German
  "49": "de",
  "43": "de", // Austria
  "41": "de", // Switzerland
  // French
  "33": "fr",
  "32": "fr", // Belgium
  // Spanish
  "34": "es",
  "52": "es", // Mexico
  "54": "es", // Argentina
  "57": "es", // Colombia
  "56": "es", // Chile
  "51": "es", // Peru
  // Portuguese
  "351": "pt",
  "55": "pt", // Brazil
  // Italian
  "39": "it",
  // Dutch
  "31": "nl",
  // Nordics
  "46": "sv",
  "47": "no",
  "45": "da",
  "358": "fi",
  // Central / Eastern Europe
  "421": "sk",
  "420": "cs",
  "48": "pl",
  "36": "hu",
  "40": "ro",
  "30": "el",
  "359": "bg",
  "385": "hr",
  "386": "sl",
  "380": "uk",
  "7": "ru", // Russia / Kazakhstan
  "90": "tr",
  // Middle East (Arabic / Hebrew)
  "972": "he",
  "971": "ar",
  "966": "ar",
  "962": "ar",
  "965": "ar",
  "974": "ar",
  "20": "ar", // Egypt
  "212": "ar", // Morocco
  // Asia
  "81": "ja",
  "82": "ko",
  "86": "zh",
  "852": "zh", // Hong Kong
  "886": "zh", // Taiwan
  "84": "vi",
  "66": "th",
  "62": "id",
  "60": "ms",
};

// Languages ElevenLabs accepts as an agent language / preset "additional
// language". Sourced from the API's own 422 validation error; anything outside
// this set (e.g. he, sl, th) is rejected — so we never greet a caller in, or
// enable, a language the agent can't actually speak. Shared with agent/sync.ts.
export const ELEVENLABS_LANGUAGES = new Set<string>([
  "en", "zh", "es", "hi", "pt", "fr", "de", "ja", "ar", "ko", "id", "it", "nl",
  "tr", "pl", "ru", "sv", "tl", "ms", "ro", "uk", "el", "cs", "da", "fi", "bg",
  "hr", "sk", "ta", "vi", "no", "hu", "pt-br", "fil",
]);

/** Distinct languages we can greet callers in (the values of CODE_TO_LANGUAGE),
 *  restricted to those ElevenLabs supports. Used to enable "additional
 *  languages" on a managed agent so it's multilingual and the per-caller
 *  language override is accepted. */
export const SUPPORTED_LANGUAGES: string[] = Array.from(
  new Set(Object.values(CODE_TO_LANGUAGE)),
).filter((l) => ELEVENLABS_LANGUAGES.has(l));

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  de: "German",
  fr: "French",
  es: "Spanish",
  pt: "Portuguese",
  it: "Italian",
  nl: "Dutch",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
  fi: "Finnish",
  sk: "Slovak",
  cs: "Czech",
  pl: "Polish",
  hu: "Hungarian",
  ro: "Romanian",
  el: "Greek",
  bg: "Bulgarian",
  hr: "Croatian",
  sl: "Slovenian",
  uk: "Ukrainian",
  ru: "Russian",
  tr: "Turkish",
  he: "Hebrew",
  ar: "Arabic",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
  ms: "Malay",
};

/**
 * Base language guessed from an E.164 caller number, or null when the number is
 * missing/malformed or the calling code isn't mapped. Tries the longest calling
 * code prefix first (4 digits down to 1) so specific codes beat shared ones.
 */
export function languageFromPhone(e164: string): string | null {
  const digits = (e164 || "").replace(/[^\d]/g, "");
  if (!digits) return null;
  for (let len = 4; len >= 1; len--) {
    const prefix = digits.slice(0, len);
    const lang = CODE_TO_LANGUAGE[prefix];
    // Only guess a language the agent can actually speak — an unsupported code
    // (he/sl/th) would make ElevenLabs reject the per-caller language override.
    if (lang) return ELEVENLABS_LANGUAGES.has(lang) ? lang : null;
  }
  return null;
}

/** Human-readable language name for a code (for prompts). Falls back to the code
 *  itself so an unmapped-but-valid code still yields a usable instruction. */
export function languageName(code: string): string {
  const base = baseLanguage(code);
  return LANGUAGE_NAMES[base] ?? base;
}

// Dominant country (ISO 3166-1 alpha-2) per E.164 calling code, for showing a
// caller's flag in the dashboard. Multi-country codes pick the most common one
// (1 → US, 7 → RU). Longest matching prefix wins, same as the language map.
const CODE_TO_COUNTRY: Record<string, string> = {
  "1": "US", "44": "GB", "61": "AU", "64": "NZ", "353": "IE", "27": "ZA",
  "63": "PH", "91": "IN", "49": "DE", "43": "AT", "41": "CH", "33": "FR",
  "32": "BE", "34": "ES", "52": "MX", "54": "AR", "57": "CO", "56": "CL",
  "51": "PE", "351": "PT", "55": "BR", "39": "IT", "31": "NL", "46": "SE",
  "47": "NO", "45": "DK", "358": "FI", "421": "SK", "420": "CZ", "48": "PL",
  "36": "HU", "40": "RO", "30": "GR", "359": "BG", "385": "HR", "386": "SI",
  "380": "UA", "7": "RU", "90": "TR", "972": "IL", "971": "AE", "966": "SA",
  "962": "JO", "965": "KW", "974": "QA", "20": "EG", "212": "MA", "81": "JP",
  "82": "KR", "86": "CN", "852": "HK", "886": "TW", "84": "VN", "66": "TH",
  "62": "ID", "60": "MY",
};

/** The flag emoji for an ISO 3166-1 alpha-2 country code (e.g. "SK" → 🇸🇰), or
 *  "" for anything that isn't two ASCII letters. */
export function flagEmoji(iso: string): string {
  const cc = (iso || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(
    ...[...cc].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65),
  );
}

/** Caller's country (ISO + flag emoji) guessed from their E.164 number, or null
 *  when it's missing/malformed or the calling code isn't mapped. */
export function countryFromPhone(e164: string): { iso: string; flag: string } | null {
  const digits = (e164 || "").replace(/[^\d]/g, "");
  if (!digits) return null;
  for (let len = 4; len >= 1; len--) {
    const iso = CODE_TO_COUNTRY[digits.slice(0, len)];
    if (iso) return { iso, flag: flagEmoji(iso) };
  }
  return null;
}

/**
 * Human-readable display form of an E.164 number: NANP (+1) as `+1 (956) 738-3556`,
 * every other mapped calling code as `+<code> <national digits grouped in threes>`.
 * The calling code is detected with the same longest-prefix rule as country/flag,
 * so any caller's country — not just the purchasable set — is split correctly.
 * Input with no recognisable calling code (or no digits) is returned unchanged, so
 * it's safe to wrap fallback strings like "Unknown caller".
 * ponytail: generic 3-digit grouping, not each country's official national format
 * — swap in libphonenumber-js if carrier-exact grouping ever matters.
 */
export function formatPhone(e164: string): string {
  const digits = (e164 || "").replace(/[^\d]/g, "");
  if (!digits) return e164;
  let code = "";
  for (let len = 4; len >= 1; len--) {
    if (CODE_TO_COUNTRY[digits.slice(0, len)]) {
      code = digits.slice(0, len);
      break;
    }
  }
  if (!code) return e164;
  const national = digits.slice(code.length);
  if (code === "1" && national.length === 10) {
    return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
  }
  const grouped = national.replace(/(\d{3})(?=\d)/g, "$1 ");
  return `+${code} ${grouped}`.trim();
}
