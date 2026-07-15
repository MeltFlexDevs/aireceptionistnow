export function fmtDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

/**
 * Call timestamps in the user's own timezone (Settings → Time zone), matching the
 * Calendar and Analytics.
 *
 * This used to call toLocaleString with no timeZone, which formats in the
 * SERVER's zone - UTC in production. A 21:37 call in Bratislava rendered as
 * "7:37 PM", so every call in the log and on the transcript was silently wrong
 * by the user's UTC offset, while the Calendar right next to it was right.
 * An empty/invalid tz (the settings field is free text) falls back to UTC.
 */
export function dateTimeFmt(tz: string): (iso: string) => string {
  const opts = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  } as const;
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat("en-US", { timeZone: tz || "UTC", ...opts });
  } catch {
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

// A call can only really be live for a few hours; an older "live" row is a
// call whose post-call webhook never arrived. Callers that pass the row date
// get such rows treated as dead (unanswered) instead of eternally active.
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
