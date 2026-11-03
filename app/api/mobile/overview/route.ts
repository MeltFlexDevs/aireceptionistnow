import { getAnalyticsCached, getOverviewCached } from "@/lib/dashboard/analytics";
import { listBookings, undatedBookings } from "@/lib/dashboard/calendar";
import { getOwnedNumbers, listAssistants, listIntegrations } from "@/lib/dashboard/db";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { ownerTimezone } from "@/lib/dashboard/timezone";
import { mobileRoute } from "@/lib/mobile/auth";
import { resolveTimezone } from "@/lib/mobile/timezone-param";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Everything the app's Home tab renders, in one round trip.
 *
 * The web overview page fans out nine parallel reads and composes them in the
 * server component. A phone on a slow connection cannot afford nine requests,
 * so the same fan-out happens here and ships as one payload.
 */
export const GET = mobileRoute(async (userId, req) => {
  // The app's range toggle, mirroring `/dashboard?range=month`. Like the web
  // page, today's view skips the 30-day rollup entirely rather than paying for
  // a query it will not render.
  const month = new URL(req.url).searchParams.get("range") === "month";
  // The phone's `?tz=`, used only when the account has no zone of its own.
  const phoneTz = resolveTimezone(null, req).timezone;

  const [overview, analytics, assistants, numbers, integrations, plan, tz, bookings] =
    await Promise.all([
      getOverviewCached(userId, phoneTz),
      month ? getAnalyticsCached(userId, null, null, phoneTz).catch(() => null) : Promise.resolve(null),
      listAssistants(userId).catch(() => []),
      getOwnedNumbers(userId).catch(() => []),
      listIntegrations(userId).catch(() => []),
      getPlanContextCached(userId).catch(() => null),
      ownerTimezone(userId, phoneTz),
      listBookings(userId).catch(() => []),
    ]);

  const now = Date.now();
  const upcoming = bookings
    .filter((b) => b.status !== "cancelled" && Date.parse(b.startTime) >= now)
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime))
    .slice(0, 5);

  return {
    today: overview.today,
    monthUsage: overview.monthUsage,
    latency: overview.latency,
    // Home renders six; the Activity screen behind the bell has its own route.
    // Twenty was shipping fourteen rows nothing reads over a cellular link.
    // Each row carries the raw `status` and ISO `startedAt` next to the `at`
    // label, so the app can tell a live call from a row stuck in a live status.
    recentCalls: overview.recentCalls.slice(0, 6),
    /**
     * The month view, or null when it was not asked for. Same shape the web's
     * `?range=month` renders: four totals, a 30-day volume series and the
     * sentiment split behind the donut.
     */
    analytics: analytics
      ? {
          totals: analytics.totals,
          volume: analytics.volume,
          sentiment: analytics.sentiment,
        }
      : null,
    assistant: assistants[0]
      ? {
          id: assistants[0].id,
          name: assistants[0].name,
          enabled: assistants[0].enabled,
        }
      : null,
    assistantCount: assistants.length,
    online: assistants.some((a) => a.enabled),
    number: numbers[0]?.e164 ?? "",
    calendarConnected: integrations.some((i) => i.type === "calendar" && i.enabled),
    plan: plan
      ? {
          name: plan.planName,
          active: plan.active,
          // Infinity does not survive JSON.stringify (it becomes null), and the
          // app renders "unlimited" off this, so send 0 for an uncapped tier and
          // let the client treat 0 as no cap.
          minutesIncluded: Number.isFinite(plan.limits.minutesIncluded)
            ? plan.limits.minutesIncluded
            : 0,
        }
      : null,
    upcoming,
    /**
     * Booking requests with no usable date, waiting on a person to confirm -
     * the same count as the web overview's "to confirm" nudge. `upcoming`
     * cannot show them: it is sorted by a start time they do not have.
     */
    toConfirm: undatedBookings(bookings).length,
    timezone: tz,
  };
}, "overview");
