// Timezone helpers shared by the settings picker and the save action.
//
// The field used to be free text with an "America/New_York" placeholder, so
// "bratislava" (or a typo, or a blank) sailed through and every timestamp on the
// dashboard silently rendered in UTC - Intl throws on an invalid zone and each
// formatter falls back. A timezone is not something a user should have to spell.

/** Every IANA zone this runtime knows, e.g. "Europe/Bratislava". */
export function supportedTimezones(): string[] {
  const withValues = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
  try {
    return withValues.supportedValuesOf?.("timeZone") ?? [];
  } catch {
    return [];
  }
}

/** True when Intl can actually format in this zone - the only test that matters,
 *  since that's what every formatter does with it. */
export function isValidTimezone(tz: string): boolean {
  if (!tz.trim()) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Best-effort repair of a human-entered zone: "bratislava" → "Europe/Bratislava",
 * "prague" → "Europe/Prague". Matches on the city part so an existing bad value
 * is salvaged rather than silently ignored. Returns "" when nothing matches.
 */
export function normalizeTimezone(raw: string): string {
  const input = raw.trim();
  if (!input) return "";

  // Intl accepts a zone case-insensitively ("europe/bratislava" formats fine),
  // but resolvedOptions hands back the canonical "Europe/Bratislava" - which is
  // what the picker's option list is keyed on. Returning the raw spelling would
  // store a working zone the <select> couldn't match, and it'd be reported as
  // invalid on a page that formats with it correctly.
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: input }).resolvedOptions().timeZone;
  } catch {
    // Not a zone Intl knows - try to salvage it from the city below.
  }

  const zones = supportedTimezones();
  const key = input.toLowerCase().replace(/[\s_]+/g, "");
  const cityOf = (z: string) => z.split("/").pop()!.toLowerCase().replace(/[\s_]+/g, "");

  // Exact zone match ignoring case/underscores, then a unique city match.
  const exact = zones.find((z) => z.toLowerCase().replace(/[\s_]+/g, "") === key);
  if (exact) return exact;
  const byCity = zones.filter((z) => cityOf(z) === key);
  return byCity.length === 1 ? byCity[0] : "";
}
