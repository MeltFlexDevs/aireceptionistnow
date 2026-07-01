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

/** Distinct languages we can greet callers in (the values of CODE_TO_LANGUAGE).
 *  Used to enable "additional languages" on a managed agent so it's multilingual
 *  and the per-caller language override is accepted. */
export const SUPPORTED_LANGUAGES: string[] = Array.from(
  new Set(Object.values(CODE_TO_LANGUAGE)),
);

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
    if (lang) return lang;
  }
  return null;
}

/** Human-readable language name for a code (for prompts). Falls back to the code
 *  itself so an unmapped-but-valid code still yields a usable instruction. */
export function languageName(code: string): string {
  const base = baseLanguage(code);
  return LANGUAGE_NAMES[base] ?? base;
}
