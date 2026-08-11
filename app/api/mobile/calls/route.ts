import { getCallLog } from "@/lib/dashboard/calls";
import { mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The Calls tab. Same filters as `/dashboard/calls`, scoped to the caller. */
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
    params.get("locale") ?? undefined,
  );
  // A phone list does not page yet, so cap the payload rather than shipping a
  // 1000-row filtered scan over a cellular connection.
  return { rows: log.rows.slice(0, 100), twilioConnected: log.twilioConnected };
}, "calls");
