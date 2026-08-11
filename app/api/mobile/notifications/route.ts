import { activeCallId } from "@/lib/dashboard/db";
import { getNotifications } from "@/lib/dashboard/notifications";
import { mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The app's poll target: recent-call notifications plus the call that is live
 * right now. Folded into one route because the app polls both on the same timer
 * and a phone should not pay two round trips for one tick.
 *
 * This is deliberately the cheap endpoint - Home polls it on a timer while it
 * is focused, which /api/mobile/overview (a seven-way fan-out) could not carry.
 * Keep it that way: anything expensive added here runs every fifteen seconds on
 * every foregrounded phone.
 */
export const GET = mobileRoute(async (userId, req) => {
  // `?live=1` is Home's fifteen-second poll, which reads nothing but the live
  // call id. Building the notification list for it meant a second owned-numbers
  // lookup plus an eight-row call query every tick, on every foregrounded
  // phone, to produce a payload that screen discards.
  if (new URL(req.url).searchParams.get("live") === "1") {
    const liveId = await activeCallId(userId).catch(() => null);
    return { items: [], activeCall: Boolean(liveId), activeCallId: liveId };
  }

  const [items, liveId] = await Promise.all([
    getNotifications(userId),
    activeCallId(userId).catch(() => null),
  ]);
  return { items, activeCall: Boolean(liveId), activeCallId: liveId };
}, "notifications");
