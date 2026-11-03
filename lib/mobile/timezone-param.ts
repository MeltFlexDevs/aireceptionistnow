/**
 * The zone a mobile screen shows times in.
 *
 * The account timezone wins when it is set. When it is not - every account made
 * through the funnel, which never asks - the app sends the phone's own zone as
 * `?tz=`, the same way the web falls back to the browser zone captured in the
 * `tz` cookie (lib/dashboard/display-timezone.ts). UTC only when neither is
 * usable. `timezoneIsAccount` lets the app say "this phone's time" when the
 * zone did not come from the account.
 *
 * Display only: never feed the result into anything a call reads (prompts,
 * transfer hours) - a viewer's phone zone must not leak into the business.
 */

// Same rule as display-timezone.ts, which keeps its copy private.
function isValidTimezone(tz: string): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function resolveTimezone(
  accountTz: string | null | undefined,
  req: Request,
): { timezone: string; timezoneIsAccount: boolean } {
  const account = (accountTz ?? "").trim();
  if (account) return { timezone: account, timezoneIsAccount: true };

  const raw = (new URL(req.url).searchParams.get("tz") ?? "").trim();
  if (raw.length <= 64 && isValidTimezone(raw)) {
    return {
      timezone: new Intl.DateTimeFormat("en-US", { timeZone: raw }).resolvedOptions().timeZone,
      timezoneIsAccount: false,
    };
  }
  return { timezone: "UTC", timezoneIsAccount: false };
}
