import type { Dictionary } from "../../i18n/dictionaries/en";

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

/**
 * A booking's day and time range on the call detail, in the zone the rest of
 * the page uses. The stored instant is parsed as it is ("Z" or an offset) and
 * read on `tz`'s clock; a bad zone falls back to UTC.
 */
export function bookingWhenLabel(startIso: string, endIso: string, locale: string, tz: string): string {
  const start = Date.parse(startIso);
  if (!Number.isFinite(start)) return "";
  const dayOpts = { weekday: "short", month: "short", day: "numeric" } as const;
  const timeOpts = { hour: "2-digit", minute: "2-digit" } as const;
  let day: Intl.DateTimeFormat;
  let time: Intl.DateTimeFormat;
  try {
    day = new Intl.DateTimeFormat(locale, { timeZone: tz || "UTC", ...dayOpts });
    time = new Intl.DateTimeFormat(locale, { timeZone: tz || "UTC", ...timeOpts });
  } catch {
    day = new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...dayOpts });
    time = new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...timeOpts });
  }
  const end = Date.parse(endIso);
  return `${day.format(start)} · ${time.format(start)}${Number.isFinite(end) ? ` - ${time.format(end)}` : ""}`;
}

export function statusLabel(raw: string): string {
  if (!raw) return "-";
  return raw.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function normalizeDirection(dir: string | null | undefined): string {
  return (dir ?? "").startsWith("outbound") ? "outbound" : "inbound";
}

export type StatusBucket = "completed" | "unanswered" | "active";

/**
 * The one "is this call still live" age limit. A row still reading
 * in-progress/ringing after this long lost its end webhook; every live check -
 * the log's status bucket, the detail's live flag, the recording guard and the
 * Home live banner (activeCallId) - treats it as over instead of live forever.
 */
export const LIVE_MAX_AGE_MS = 4 * 60 * 60 * 1000;
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

export const LIVE_STATUSES = ["in-progress", "in_progress", "ringing", "queued", "initiated"];
export function isLiveStatus(raw: string, dateIso?: string): boolean {
  return LIVE_STATUSES.includes(raw.toLowerCase()) && !staleLive(dateIso);
}

/**
 * Whether a call row belongs in the call log (the web list and the app's Calls
 * tab). It needs an assistant: a Twilio-only row is not the receptionist's call.
 * A row with length is a real conversation. A 0-second row stays when it is live
 * now or reached an end state: answered, missed, failed, or stuck "live" after a
 * lost end webhook (over, so it reads Missed, as on Home and the detail page).
 * Only a 0-second row that is neither live nor ended is noise.
 */
export function showInCallLog(r: {
  assistant: string | null;
  durationSec: number;
  status: string;
  date: string;
}): boolean {
  if (!r.assistant) return false;
  if (r.durationSec > 0) return true;
  return isLiveStatus(r.status, r.date) || statusBucket(r.status, r.date) !== "active";
}

/**
 * The one headline for what became of a call, shared by Home's activity feed,
 * the call list and the call detail. The status comes first, so a missed,
 * failed or stuck call never reads "Call handled". Only an answered call falls
 * through to what the receptionist did: the raw DB outcome, which analytics.ts
 * leaves unlocalized (its cache has no locale in the key).
 */
export function callOutcomeLabel(
  d: Dictionary["data"],
  status: string,
  outcome: string | null,
  dateIso?: string,
): string {
  const bucket = statusBucket(status, dateIso);
  if (bucket === "unanswered") return d.outcomeMissed;
  if (bucket === "active") return d.outcomeLive;
  switch ((outcome ?? "").toLowerCase()) {
    case "booked":
      return d.outcomeBooked;
    case "message":
      return d.outcomeMessage;
    case "transferred":
      return d.outcomeTransferred;
    case "resolved":
      return d.outcomeResolved;
    case "abandoned":
      return d.outcomeAbandoned;
    default:
      return d.outcomeUnknown;
  }
}

/**
 * The call the Calls split view opens. The one the URL asks for wins even when
 * the list does not show it, so a deep link never silently opens another call;
 * the pane loads it by id (owner-checked) or says it was not found. Without
 * one, the newest row that has a stored record.
 */
export function pickActiveCallId(selected: string, rows: readonly { dbId: string | null }[]): string {
  if (selected) return selected;
  return rows.find((r) => r.dbId)?.dbId ?? "";
}
