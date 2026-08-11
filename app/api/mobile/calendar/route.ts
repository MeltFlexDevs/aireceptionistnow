import { withDeadline } from "@/lib/call-engine/net";
import { fetchExternalEvents } from "@/lib/dashboard/calendar-events";
import { listBookings } from "@/lib/dashboard/calendar";
import { listIntegrations } from "@/lib/dashboard/db";
import { ownerTimezone } from "@/lib/dashboard/timezone";
import { mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

/**
 * The Calendar tab: what the receptionist booked AND what is already on the
 * connected calendar, plus the owner's display timezone so the app formats
 * times the way the dashboard does rather than in the phone's local zone.
 *
 * The external events are not decoration. The dashboard's calendar merges them
 * in, so a phone that showed bookings alone reported a different day than the
 * web did for the same account - "nothing until Thursday" on one screen and a
 * full afternoon on the other. Same source, same merge.
 *
 * Window: the web fetches whatever its month grid spans. The app renders a
 * rolling agenda instead, so it asks for a week back (recent past stays
 * readable) and sixty days forward, which covers anything an agenda scrolls to.
 */
export const GET = mobileRoute(async (userId) => {
  const now = Date.now();
  const timeMin = new Date(now - 7 * DAY_MS).toISOString();
  const timeMax = new Date(now + 60 * DAY_MS).toISOString();

  const [bookings, timezone, integrations] = await Promise.all([
    listBookings(userId),
    ownerTimezone(userId),
    listIntegrations(userId).catch(() => []),
  ]);

  // Each provider is a network call that can hang or 401 on a stale token.
  // `fetchExternalEvents` already swallows a per-calendar failure into an empty
  // list, but not a slow one - and unlike the web page, which renders this once
  // per navigation, the app refetches whenever the Calendar tab comes forward.
  // A deadline keeps somebody else's calendar API off the critical path: the
  // user's own bookings are already in hand and must not wait on it.
  const events = await withDeadline(
    fetchExternalEvents(integrations, timeMin, timeMax),
    4000,
    [] as Awaited<ReturnType<typeof fetchExternalEvents>>,
  );

  return {
    bookings: bookings
      .slice()
      .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime)),
    events,
    timezone,
  };
}, "calendar");
