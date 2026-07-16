import { getAccountSettings } from "./account";

export async function ownerTimezone(ownerId?: string | null): Promise<string> {
  if (!ownerId) return "UTC";
  return (await getAccountSettings(ownerId)).timezone.trim() || "UTC";
}

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

export function clockSecFmt(tz: string): (iso: string) => string {
  const opts = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false } as const;
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
