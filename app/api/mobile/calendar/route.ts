import { fetchExternalEventsStatus } from "@/lib/dashboard/calendar-events";
import { listBookingsInWindow } from "@/lib/dashboard/calendar";
import { getAccountSettings } from "@/lib/dashboard/account";
import { listIntegrations } from "@/lib/dashboard/db";
import { mobileRoute } from "@/lib/mobile/auth";
import { resolveTimezone } from "@/lib/mobile/timezone-param";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
// Per calendar, so one slow calendar costs only its own events.
const PER_CALENDAR_MS = 4000;

/**
 * The Calendar tab: what the receptionist booked AND what is already on the
 * connected calendar, plus the owner's display timezone so the app formats
 * times the way the dashboard does rather than in the phone's local zone. An
 * account with no zone set falls back to the phone's `?tz=` (see
 * lib/mobile/timezone-param.ts), never silently to UTC.
 *
 * The external events are not decoration. The dashboard's calendar merges them
 * in, so a phone that showed bookings alone reported a different day than the
 * web did for the same account - "nothing until Thursday" on one screen and a
 * full afternoon on the other. Same source, same merge.
 *
 * Window: the web fetches whatever its month grid spans. The app renders a
 * rolling agenda instead, so it asks for a week back (recent past stays
 * readable) and sixty days forward, which covers anything an agenda scrolls to.
 * Bookings use the same window (plus undated ones), so the cap on how many
 * come back never drops a booking that is on screen.
 */
export const GET = mobileRoute(async (userId, req) => {
  const now = Date.now();
  const timeMin = new Date(now - 7 * DAY_MS).toISOString();
  const timeMax = new Date(now + 60 * DAY_MS).toISOString();

  const [bookings, accountTz, integrations] = await Promise.all([
    listBookingsInWindow(userId, timeMin, timeMax),
    getAccountSettings(userId)
      .then((a) => a.timezone)
      .catch(() => ""),
    listIntegrations(userId).catch(() => []),
  ]);
  const { timezone, timezoneIsAccount } = resolveTimezone(accountTz, req);

  // Each provider is a network call that can hang or 401 on a stale token,
  // and the app refetches whenever the Calendar tab comes forward. Each
  // calendar gets its own deadline, so one slow calendar no longer drops the
  // others' events, and the user's own bookings never wait past it. A
  // calendar that could not be read is named in `eventsUnavailable`, so the
  // app warns instead of showing a free afternoon.
  const { events, unavailable } = await fetchExternalEventsStatus(
    integrations,
    timeMin,
    timeMax,
    PER_CALENDAR_MS,
  );

  return {
    bookings: bookings
      .slice()
      .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime)),
    events,
    eventsUnavailable: unavailable,
    timezone,
    timezoneIsAccount,
  };
}, "calendar");
