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

  // "pending": the cancel action's deferred notify work died before placing
  // the call. "calling": the outbound call never produced a webhook.
  // "sms_sending": a resolver claimed the send and died - retryable once the
  // claim goes stale. In every case the customer heard nothing yet.
  const { data, error } = await serviceClient()
    .from("call_actions")
    .select("id, payload")
    .eq("type", "booking")
    .or(
      "payload->cancellation->>notifyStatus.eq.pending,payload->cancellation->>notifyStatus.eq.calling,payload->cancellation->>notifyStatus.eq.sms_sending",
    )
    .limit(50);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const now = Date.now();
  const stale = (data ?? []).flatMap((row) => {
    const state = ((row.payload as Record<string, unknown>)?.cancellation ??
      {}) as CancellationState;
    // For a claimed send, staleness is measured from the claim; for a placed
    // call, from when it was placed. No usable timestamp counts as stale -
    // better a late SMS than none.
    const since =
      state.notifyStatus === "sms_sending"
        ? Date.parse(state.claimedAt ?? "")
        : Date.parse(state.notifyAt ?? state.at ?? "");
    if (Number.isFinite(since) && now - since < STALE_MS) return [];
    return [{ id: String(row.id), state }];
  });

  // Each resolve is several DB round trips + a translation + a Twilio send;
  // strictly sequential processing can outlive the function budget and starve
  // the tail of the batch. Run a few at a time instead.
  const CONCURRENCY = 5;
  let swept = 0;
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, stale.length) }, async () => {
      while (next < stale.length) {
        const { id, state } = stale[next++];
        await resolveCancellationNotify(id, state, false).catch((err) =>
          console.error("[cancel-sweep] resolve failed", id, err),
        );
        swept++;
      }
    }),
  );
  return new Response(JSON.stringify({ checked: data?.length ?? 0, swept }), {
    headers: { "content-type": "application/json" },
  });
}
