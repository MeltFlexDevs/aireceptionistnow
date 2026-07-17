import { serviceClient } from "./supabase";
import { bookingRequestFromPayload, calendarAccessFrom } from "../call-engine/actions";
import { checkAvailability } from "../call-engine/integrations/availability";
import { clearSnapshot } from "../call-engine/integrations/snapshot-store";
import {
  resolveCalendarById,
  resolveCalendarsForAccess,
} from "../call-engine/integrations/registry";
import { BOOKING_TIMEOUT_MS, withDeadline } from "../call-engine/net";
import { getRepository } from "../call-engine/persistence/supabase";

// Automatic retries stop after this many attempts; the dashboard button can
// always retry manually on top.
export const MAX_SYNC_ATTEMPTS = 3;

// Sync bookkeeping stored on the action payload, so attempts survive restarts
// and both the sweep and the dashboard read the same state.
export interface BookingSyncState {
  attempts: number;
  lastAt?: string;
  lastError?: string;
}

export function bookingSyncState(payload: Record<string, unknown>): BookingSyncState {
  const s = payload.sync as Partial<BookingSyncState> | undefined;
  return { attempts: typeof s?.attempts === "number" ? s.attempts : 0, lastAt: s?.lastAt, lastError: s?.lastError };
}

export interface RetryResult {
  ok: boolean;
  message: string;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

// Re-attempt pushing a failed booking onto the calendar. Only status "failed"
// rows are eligible: a "pending" row means a create may have landed despite a
// timeout, and retrying those could double-book the caller.
export async function retryBookingSync(
  actionId: string,
  ownerId: string | null,
): Promise<RetryResult> {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("call_actions")
    .select("id,type,status,integration_id,payload,call:calls!inner(owner_id,from_number,to_number)")
    .eq("id", actionId)
    .eq("type", "booking")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ok: false, message: "booking not found" };

  const call = (Array.isArray(data.call) ? data.call[0] : data.call) as
    | Record<string, unknown>
    | null;
  if (!call) return { ok: false, message: "booking not found" };
  // Owner scoping: with auth on, only the booking's owner may retry it.
  if (ownerId && str(call.owner_id) && str(call.owner_id) !== ownerId) {
    return { ok: false, message: "booking not found" };
  }
  if (data.status !== "failed") {
    return { ok: false, message: "only failed bookings can be retried" };
  }
  if (!data.integration_id) {
    return { ok: false, message: "no calendar was attached to this booking" };
  }

  const payload = ((data.payload as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const sync = bookingSyncState(payload);
  const recordAttempt = async (patch: {
    status?: string;
    externalId?: string;
    error?: string | null;
  }): Promise<void> => {
    const { error: upErr } = await sb
      .from("call_actions")
      .update({
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.externalId ? { external_id: patch.externalId } : {}),
        error: patch.error ?? null,
        payload: {
          ...payload,
          sync: {
            attempts: sync.attempts + 1,
            lastAt: new Date().toISOString(),
            ...(patch.error ? { lastError: patch.error } : {}),
          },
        },
      })
      .eq("id", actionId);
    if (upErr) console.error("[booking-retry] recording attempt failed", actionId, upErr);
  };

  const config = await getRepository()
    .resolveInboundNumber(str(call.to_number))
    .catch(() => null);
  const resolved = config
    ? resolveCalendarById(config.integrations, String(data.integration_id))
    : null;
  if (!config || !resolved) {
    return { ok: false, message: "the calendar integration is no longer connected" };
  }

  const req = bookingRequestFromPayload(payload, str(call.from_number));
  const startMs = Date.parse(req.startTime);
  const endMs = Date.parse(req.endTime);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return { ok: false, message: "the booking has no valid time to sync" };
  }
  if (endMs < Date.now()) {
    return { ok: false, message: "the appointment time has already passed" };
  }

  // The slot may have been taken since the call - never sync over a conflict.
  const readable = resolveCalendarsForAccess(config.integrations, calendarAccessFrom(config));
  const check = await checkAvailability(readable, req.startTime, req.endTime, {
    fresh: true,
  }).catch(() => null);
  if (check?.ok && !check.requestedFree) {
    const message = "the time slot is no longer free - rebook with the caller";
    await recordAttempt({ error: message });
    return { ok: false, message };
  }

  const result = await withDeadline(resolved.provider.createEvent(req), BOOKING_TIMEOUT_MS, {
    ok: false as const,
    error: "timeout",
  });
  if (result.ok) {
    await recordAttempt({ status: "done", externalId: result.externalId, error: null });
    await clearSnapshot(resolved.integrationId).catch(() => {});
    return { ok: true, message: "appointment synced to the calendar" };
  }
  await recordAttempt({ error: result.error ?? "unknown error" });
  return { ok: false, message: result.error ?? "unknown error" };
}
