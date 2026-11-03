import { serviceClient } from "./supabase";
import { isOwnedBy } from "./ownership";
import { isUuid } from "../uuid";
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
  /** No such booking, or not this owner's: a retry can never work. */
  notFound?: boolean;
  message: string;
}

/**
 * The HTTP status for a retry result. Not found is 404, not the 502 "try again"
 * of a failed sync, so the app stops retrying a booking it can never reach.
 */
export function retryResponseStatus(res: Pick<RetryResult, "ok" | "notFound">): 200 | 404 | 502 {
  if (res.ok) return 200;
  return res.notFound ? 404 : 502;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Re-attempt pushing a failed booking onto the calendar, scoped to the
 * signed-in owner. Strict (SEC-1, see isOwnedBy): the booking's call must name
 * `ownerId`, so a null `ownerId` or an owner-less call matches nothing outside
 * dev mode.
 */
export async function retryBookingSync(
  actionId: string,
  ownerId: string | null,
): Promise<RetryResult> {
  return retry(actionId, { ownerId });
}

/** The cron sweep only - never call it from a request. */
export async function retryBookingSyncUnscoped(actionId: string): Promise<RetryResult> {
  return retry(actionId, null);
}

// Only status "failed" rows are eligible: a "pending" row means a create may
// have landed despite a timeout, and retrying those could double-book the
// caller. `scope: null` is the system path (the sweep).
async function retry(
  actionId: string,
  scope: { ownerId: string | null } | null,
): Promise<RetryResult> {
  // A malformed id would make Postgres throw (22P02) and read as a failed sync.
  if (!isUuid(actionId)) return { ok: false, notFound: true, message: "booking not found" };
  const sb = serviceClient();
  const { data, error } = await sb
    .from("call_actions")
    .select("id,type,status,integration_id,payload,call:calls!inner(owner_id,from_number,to_number)")
    .eq("id", actionId)
    .eq("type", "booking")
    .maybeSingle();
  if (error) throw error;
  if (!data) return { ok: false, notFound: true, message: "booking not found" };

  const call = (Array.isArray(data.call) ? data.call[0] : data.call) as
    | Record<string, unknown>
    | null;
  if (!call) return { ok: false, notFound: true, message: "booking not found" };
  // Owner scoping: only the booking's owner may retry it.
  if (scope && !isOwnedBy(str(call.owner_id) || null, scope.ownerId)) {
    return { ok: false, notFound: true, message: "booking not found" };
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
