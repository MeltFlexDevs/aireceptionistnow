import { getCallLog } from "@/lib/dashboard/calls";
import { mobileRoute } from "@/lib/mobile/auth";
import { resolveTimezone } from "@/lib/mobile/timezone-param";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_PAGE = 50;
const MAX_PAGE = 100;

function pageSize(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return DEFAULT_PAGE;
  return Math.min(MAX_PAGE, Math.max(1, n));
}

/**
 * The Calls tab. Same filters as `/dashboard/calls`, scoped to the caller, one
 * page at a time: `?before=<nextCursor>` fetches the next page, and
 * `nextCursor` is null once there is nothing older. `timezone` is the owner's
 * zone - the one every `dateLabel` is in - so the app groups rows by the same
 * day the web and the call detail show. An account with no zone gets the
 * phone's `?tz=` instead of UTC, like the calendar route.
 */
export const GET = mobileRoute(async (userId, req) => {
  const params = new URL(req.url).searchParams;
  const log = await getCallLog(
    {
      q: params.get("q") ?? undefined,
      status: params.get("status") ?? undefined,
      // Inbound only, exactly like `/dashboard/calls` - which hardcodes the
      // same thing. Honouring a client-supplied direction here let outbound
      // rows (test calls, the cancellation callbacks placed by
      // `placeAgentCall`) into the phone's log that the web deliberately hides,
      // so the same account showed a different call history on each surface.
      direction: "inbound",
    },
    userId,
    undefined,
    // Older builds still send it; newer ones format from `timezone` themselves.
    params.get("locale") ?? undefined,
    // An unparseable `before` is ignored (first page) rather than rejected.
    { before: params.get("before") ?? undefined, limit: pageSize(params.get("limit")) },
    // The phone's `?tz=`, used only when the account has no zone of its own.
    resolveTimezone(null, req).timezone,
  );
  return {
    rows: log.rows,
    twilioConnected: log.twilioConnected,
    timezone: log.timezone,
    nextCursor: log.nextCursor,
  };
}, "calls");
