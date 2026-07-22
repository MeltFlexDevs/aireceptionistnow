
export function supportedTimezones(): string[] {
  const withValues = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
  try {
    return withValues.supportedValuesOf?.("timeZone") ?? [];
  } catch {
    return [];
  }
}

export function normalizeTimezone(raw: string): string {
  const input = raw.trim();
  if (!input) return "";

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
