import { listBookings } from "@/lib/dashboard/calendar";
import { ownerTimezone } from "@/lib/dashboard/timezone";
import { mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The Calendar tab: every appointment the receptionist booked, newest start
 * first, plus the owner's display timezone so the app formats times the same
 * way the dashboard does rather than in the phone's local zone.
 */
export const GET = mobileRoute(async (userId) => {
  const [bookings, timezone] = await Promise.all([
    listBookings(userId),
    ownerTimezone(userId),
  ]);
  return {
    bookings: bookings
      .slice()
      .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime)),
    timezone,
  };
}, "calendar");
