/**
 * A receipt time on the business's clock, with the zone's short name ("CDT",
 * "UTC") so a caller reading the link anywhere knows which clock it is. The
 * server's own zone must never show. A bad zone falls back to UTC.
 */
export function receiptWhen(iso: string, lang: string, timeZone: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const opts = {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  } as const;
  for (const zone of [timeZone || "UTC", "UTC"]) {
    try {
      return d.toLocaleString(lang, { ...opts, timeZone: zone });
    } catch {
      // A bad zone or language tag: try UTC, then the plain stamp below.
    }
  }
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
