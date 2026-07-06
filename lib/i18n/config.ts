// Dashboard UI localization. Lightweight + App-Router-native: a locale cookie
// picks one of the message dictionaries below - no route restructuring, no
// middleware. Add a language by adding its dictionary file + an entry here.

export const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "dash_locale";

export function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}
