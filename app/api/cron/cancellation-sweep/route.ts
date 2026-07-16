import { serviceClient } from "@/lib/dashboard/supabase";
import {
  resolveCancellationNotify,
  type CancellationState,
} from "@/lib/dashboard/booking-cancel";

export const dynamic = "force-dynamic";

// If the outbound cancellation call never produces a post-call webhook (call
// not connected, carrier rejection, lost event), the state sticks at
// "calling" and the customer hears nothing. This sweep texts them instead.
const STALE_MS = 3 * 60_000;

export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET || process.env.AGENT_WEBHOOK_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const { data, error } = await serviceClient()
    .from("call_actions")
    .select("id, payload")
    .eq("type", "booking")
    .eq("payload->cancellation->>notifyStatus", "calling")
    .limit(50);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let swept = 0;
  const now = Date.now();
  for (const row of data ?? []) {
    const state = ((row.payload as Record<string, unknown>)?.cancellation ??
      {}) as CancellationState;
    const placedAt = Date.parse(state.notifyAt ?? state.at ?? "");
    // No usable timestamp counts as stale - better a late SMS than none.
    if (Number.isFinite(placedAt) && now - placedAt < STALE_MS) continue;
    await resolveCancellationNotify(String(row.id), state, false).catch((err) =>
      console.error("[cancel-sweep] resolve failed", row.id, err),
    );
    swept++;
  }
  return new Response(JSON.stringify({ checked: data?.length ?? 0, swept }), {
    headers: { "content-type": "application/json" },
  });
}
