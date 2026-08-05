import { hasActiveCall } from "@/lib/dashboard/db";
import { getNotifications } from "@/lib/dashboard/notifications";
import { mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The app's poll target: recent-call notifications plus whether a call is live
 * right now. Folded into one route because the app polls both on the same timer
 * and a phone should not pay two round trips for one tick.
 */
export const GET = mobileRoute(async (userId) => {
  const [items, active] = await Promise.all([
    getNotifications(userId),
    hasActiveCall(userId).catch(() => false),
  ]);
  return { items, activeCall: active };
}, "notifications");
