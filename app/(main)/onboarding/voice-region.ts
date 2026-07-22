// Maps a phone-number country to the base language its voices should come from.
// Unknown countries fall back to English. Used to filter the funnel voice
// picker to voices that sound native to the caller's country, while the
// American-English defaults are always offered on top.
const LANGUAGE_BY_COUNTRY: Record<string, string> = {
  US: "en",
  CA: "en",
  GB: "en",
  IE: "en",
  AU: "en",
  NZ: "en",
  NL: "nl",
  BE: "nl",
  FR: "fr",
  DE: "de",
  AT: "de",
  CH: "de",
  ES: "es",
  IT: "it",
  SE: "sv",
  PT: "pt",
  PL: "pl",
  CZ: "cs",
  SK: "sk",
};

export function languageForCountry(code: string | undefined): string {
  return LANGUAGE_BY_COUNTRY[(code ?? "").toUpperCase()] ?? "en";
}
