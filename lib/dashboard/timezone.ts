import { getAccountSettings } from "./account";

// Day bucketing and absolute-time formatting in the user's own timezone, shared
// by analytics and the booking calendar. Both must agree on where a day starts:
// an evening booking has to land on the day the user saw it, not the server's.

/** The user's configured timezone (account settings), or UTC. */
export async function ownerTimezone(ownerId?: string | null): Promise<string> {
  if (!ownerId) return "UTC";
  return (await getAccountSettings(ownerId)).timezone.trim() || "UTC";
}

/**
 * Days are bucketed in the user's timezone, not the server's. en-CA formats
 * dates as ISO "YYYY-MM-DD"; an empty or invalid timezone (the settings field
 * is free text) falls back to UTC.
 */
export function dayKeyFn(tz: string): (d: Date) => string {
  const opts = { year: "numeric", month: "2-digit", day: "2-digit" } as const;
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz || "UTC", ...opts });
  } catch {
    fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", ...opts });
  }
  return (d) => fmt.format(d);
}

/** Absolute timestamp in the user's timezone, for tooltips next to "2 hr ago". */
export function timeFmt(tz: string): (iso: string) => string {
  const opts = { dateStyle: "medium", timeStyle: "short" } as const;
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz || "UTC", ...opts });
  } catch {
    fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts });
  }
  return (iso) => fmt.format(new Date(iso));
}

/** Clock time only ("14:30"), in the user's timezone - for calendar cells. */
export function clockFmt(tz: string): (iso: string) => string {
  const opts = { hour: "2-digit", minute: "2-digit", hour12: false } as const;
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz || "UTC", ...opts });
  } catch {
    fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts });
  }
  return (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "" : fmt.format(d);
  };
}
