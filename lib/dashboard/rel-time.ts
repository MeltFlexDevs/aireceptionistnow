/**
 * Relative timestamps ("2 min ago", "vor 2 Min.") formatted in the viewer's
 * locale.
 *
 * These live here rather than in the analytics layer on purpose: those results
 * are cached with no locale in the cache key, so a timestamp baked in there
 * would leak one user's language to the next. Format at render.
 */

function format(minutes: number, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (minutes < 1) return rtf.format(0, "minute");
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.floor(hours / 24), "day");
}

/** Minutes elapsed -> localized "N minutes ago". */
export function relTimeFrom(minutes: number, locale: string): string {
  return format(Math.max(0, Math.round(minutes)), locale);
}

/** ISO timestamp -> localized "N minutes ago". Empty string when unparseable. */
export function relTimeOf(iso: string, locale: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "";
  return format(Math.max(0, Math.floor((Date.now() - ms) / 60000)), locale);
}
