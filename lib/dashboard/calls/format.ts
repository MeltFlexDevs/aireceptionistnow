export function fmtDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

/**
 * `locale` defaults to en-US so existing callers are unaffected; the dashboard
 * threads the viewer's locale in. The customer-facing SMS path deliberately
 * does NOT - there the date must follow the caller's language, not the owner's
 * UI (see lib/dashboard/booking-cancel.ts).
 */
export function dateTimeFmt(tz: string, locale = "en-US"): (iso: string) => string {
  const opts = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  } as const;
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat(locale, { timeZone: tz || "UTC", ...opts });
  } catch {
    // Bad time zone, or a locale tag Intl rejects - fall back to both defaults.
    fmt = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts });
  }
  return (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "-" : fmt.format(d);
  };
}

export function statusLabel(raw: string): string {
  if (!raw) return "-";
  return raw.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function normalizeDirection(dir: string | null | undefined): string {
  return (dir ?? "").startsWith("outbound") ? "outbound" : "inbound";
}

export type StatusBucket = "completed" | "unanswered" | "active";

const LIVE_MAX_AGE_MS = 4 * 60 * 60 * 1000;
function staleLive(dateIso?: string): boolean {
  if (!dateIso) return false;
  const t = Date.parse(dateIso);
  return Number.isFinite(t) && Date.now() - t > LIVE_MAX_AGE_MS;
}

export function statusBucket(raw: string, dateIso?: string): StatusBucket {
  const s = raw.toLowerCase();
  if (["busy", "no-answer", "failed", "canceled", "cancelled", "abandoned"].includes(s)) {
    return "unanswered";
  }
  if (["completed", "resolved", "booked", "answered"].includes(s)) return "completed";
  return staleLive(dateIso) ? "unanswered" : "active";
}

const LIVE = ["in-progress", "in_progress", "ringing", "queued", "initiated"];
export function isLiveStatus(raw: string, dateIso?: string): boolean {
  return LIVE.includes(raw.toLowerCase()) && !staleLive(dateIso);
}
