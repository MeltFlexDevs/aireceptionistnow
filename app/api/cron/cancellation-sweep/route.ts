import { serviceClient } from "@/lib/dashboard/supabase";
import {
  resolveCancellationNotify,
  type CancellationState,
} from "@/lib/dashboard/booking-cancel";
import {
  bookingSyncState,
  retryBookingSync,
  MAX_SYNC_ATTEMPTS,
} from "@/lib/dashboard/booking-retry";

export const dynamic = "force-dynamic";

// If the outbound cancellation call never produces a post-call webhook (call
// not connected, carrier rejection, lost event), the state sticks at
// "calling" and the customer hears nothing. This sweep texts them instead.
const STALE_MS = 3 * 60_000;

// Failed calendar syncs get automatic re-attempts: recent enough to still
// matter, spaced out so a hard failure isn't hammered every 5 minutes.
const RETRY_MAX_AGE_MS = 48 * 60 * 60_000;
const RETRY_SPACING_MS = 10 * 60_000;

async function retryFailedBookings(now: number): Promise<{ checked: number; retried: number; synced: number }> {
  const { data, error } = await serviceClient()
    .from("call_actions")
    .select("id, payload")
    .eq("type", "booking")
    .eq("status", "failed")
    .not("integration_id", "is", null)
    .gte("created_at", new Date(now - RETRY_MAX_AGE_MS).toISOString())
    .limit(25);
  if (error) {
    console.error("[booking-retry-sweep] list failed", error);
    return { checked: 0, retried: 0, synced: 0 };
  }

  const due = (data ?? []).filter((row) => {
    const sync = bookingSyncState((row.payload as Record<string, unknown>) ?? {});
    if (sync.attempts >= MAX_SYNC_ATTEMPTS) return false;
    const lastAt = Date.parse(sync.lastAt ?? "");
    return !Number.isFinite(lastAt) || now - lastAt >= RETRY_SPACING_MS;
  });

  let synced = 0;
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(3, due.length) }, async () => {
      while (next < due.length) {
        const id = String(due[next++].id);
        const res = await retryBookingSync(id, null).catch((err) => {
          console.error("[booking-retry-sweep] retry threw", id, err);
          return { ok: false as const, message: "threw" };
        });
        if (res.ok) synced++;
      }
    }),
  );
  return { checked: data?.length ?? 0, retried: due.length, synced };
}

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
  // The two sweeps are independent - run the booking retries alongside.
  const [retry] = await Promise.all([
    retryFailedBookings(now),
    Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, stale.length) }, async () => {
        while (next < stale.length) {
          const { id, state } = stale[next++];
          await resolveCancellationNotify(id, state, false).catch((err) =>
            console.error("[cancel-sweep] resolve failed", id, err),
          );
          swept++;
        }
      }),
    ),
  ]);
  return new Response(
    JSON.stringify({ checked: data?.length ?? 0, swept, bookingRetries: retry }),
    { headers: { "content-type": "application/json" } },
  );
}
