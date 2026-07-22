import { after } from "next/server";
import { checkAvailability } from "./integrations/availability";
import { clearSnapshot } from "./integrations/snapshot-store";
import {
  providerRejectsConflicts,
  resolveCalendarById,
  resolveCalendarsForAccess,
  type CalendarAccessEntry,
  type ResolvedCalendar,
} from "./integrations/registry";
import { BOOKING_TIMEOUT_MS, withDeadline } from "./net";
import type { CallRepository } from "./persistence/types";
import { sendSms } from "./telephony";
import type { BookingRequest, NumberConfig } from "./types";

export interface ActionContext {
  callId: string;
  config: NumberConfig;
  from: string;
  to: string;
}

function clip(value: unknown, max = 500): string {
  return String(value ?? "")
    .replace(new RegExp("[\\u0000-\\u001F\\u007F]", "g"), " ")
    .trim()
    .slice(0, max);
}

export function calendarAccessFrom(config: NumberConfig): CalendarAccessEntry[] {
  return (
    (config.routing.calendar as { access?: CalendarAccessEntry[] } | undefined)
      ?.access ?? []
  );
}

// Shared by the live booking path and the retry sweep: both rebuild the
// provider request from the same (untrusted) tool-call payload shape.
export function bookingRequestFromPayload(
  input: Record<string, unknown>,
  fallbackPhone = "",
): BookingRequest {
  return {
    title: clip(input.title, 200) || "Appointment",
    startTime: clip(input.start_time, 64),
    endTime: clip(input.end_time, 64),
    attendeeName: input.attendee_name ? clip(input.attendee_name, 120) : undefined,
    attendeePhone: input.attendee_phone ? clip(input.attendee_phone, 40) : fallbackPhone,
    notes: input.notes ? clip(input.notes, 1000) : undefined,
  };
}

export async function checkAvailabilityAction(
  ctx: ActionContext,
  input: Record<string, unknown>,
): Promise<string> {
  const start = String(input.start_time ?? "");
  const end = String(input.end_time ?? "");
  if (!start || !end) {
    return "I need a specific start and end time to check availability.";
  }
  const calendars = resolveCalendarsForAccess(
    ctx.config.integrations,
    calendarAccessFrom(ctx.config),
  );
  const answer = await checkAvailability(calendars, start, end).catch((err) => {
    console.error("[actions] availability", err);
    return null;
  });
  if (!answer || !answer.ok) {
    console.error(
      `[actions] check_availability failed for call ${ctx.callId}: ${answer?.error ?? "no answer"}`,
    );
    return "I couldn't check the calendar right now. Offer to take a message or have someone from our team confirm, without guessing whether the time is free.";
  }
  if (answer.requestedFree) {
    return "That time is free. You can confirm it and book if the caller agrees.";
  }
  if (answer.alternatives.length === 0) {
    return "That time isn't available, and there are no nearby openings. Say only that it's unavailable and offer to take a message. Never reveal what is scheduled or why.";
  }
  return (
    "That time isn't available. Tell the caller only that the time is taken " +
    "(never what is scheduled or why) and offer these free times instead, " +
    `phrased naturally: ${answer.alternatives.join(", ")}.`
  );
}

// Positive approach: acknowledge the booking immediately and complete it in the
// background so the caller never waits for the calendar round-trip. On by
// default; set routing.optimisticBooking = false to require a synchronous
// confirmation (the caller hears the real outcome before moving on).
function optimisticBookingEnabled(config: NumberConfig): boolean {
  const r = config.routing as { optimisticBooking?: unknown };
  return r.optimisticBooking !== false;
}

// The only recovery channel for a deferred booking that couldn't be completed:
// the caller was already told it's being arranged, so the business needs an SMS.
async function notifyBookingIssue(
  ctx: ActionContext,
  req: BookingRequest,
  reason: string,
): Promise<void> {
  const r = ctx.config.routing as { transferTo?: string; smsAlerts?: boolean };
  if (!r.transferTo || r.smsAlerts === false) return;
  const who = req.attendeeName || ctx.from;
  const body =
    `Booking needs attention for ${ctx.config.businessName}: couldn't complete "${req.title}" ` +
    `for ${who} at ${req.startTime} - ${reason}. Please follow up.`;
  const send = sendSms(r.transferTo, ctx.to, body, ctx.config.businessName).catch((err) =>
    console.error("[actions] booking-issue sms failed", err),
  );
  await withDeadline(send, 3000, undefined);
}

const E164 = /^\+\d{7,15}$/;

// Prefer the callback number the caller gave, but only if it's a sendable
// E.164; otherwise fall back to the verified caller ID. "" if neither is valid.
function smsRecipient(preferred: string | undefined, fallback: string): string {
  const p = (preferred ?? "").trim();
  if (E164.test(p)) return p;
  const f = (fallback ?? "").trim();
  return E164.test(f) ? f : "";
}

// Friendly wall-clock rendering of the appointment start. The agent passes ISO
// with an explicit offset, so the offset in the string is the local time the
// caller agreed to - format it directly rather than guessing a zone.
function friendlyWhen(iso: string, locale: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "";
  let offsetMin: number;
  if (/[zZ]$/.test(iso)) offsetMin = 0;
  else {
    const m = iso.match(/([+-])(\d{2}):?(\d{2})$/);
    offsetMin = m
      ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]))
      : -new Date(ms).getTimezoneOffset();
  }
  const shifted = new Date(ms + offsetMin * 60_000);
  const opts = {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  } as const;
  // A malformed ownerLocale would make toLocaleString throw - fall back to en-US.
  try {
    return shifted.toLocaleString(locale || "en-US", opts);
  } catch {
    return shifted.toLocaleString("en-US", opts);
  }
}

// Text the caller a booking confirmation once the event is actually on the
// calendar - this is the "confirmation shortly" the agent promised. Best-effort;
// on by default, disabled with routing.bookingConfirmationSms = false. Note: the
// appointment reason/notes are deliberately NOT included (could be sensitive).
async function sendBookingConfirmationSms(ctx: ActionContext, req: BookingRequest): Promise<void> {
  const r = ctx.config.routing as {
    bookingConfirmationSms?: boolean;
    location?: unknown;
    address?: unknown;
  };
  if (r.bookingConfirmationSms === false) return;
  const to = smsRecipient(req.attendeePhone, ctx.from);
  if (!to) return;
  const when = friendlyWhen(req.startTime, ctx.config.ownerLocale);
  if (!when) return;
  const locationRaw =
    typeof r.location === "string" ? r.location : typeof r.address === "string" ? r.address : "";
  const location = locationRaw.trim();
  const first = (req.attendeeName ?? "").trim().split(/\s+/)[0];
  const greeting = first ? `Hi ${first}, ` : "";
  const where = location ? ` at ${location}` : "";
  const body = `${greeting}you're booked with ${ctx.config.businessName} for ${when}${where}. See you then!`;
  const send = sendSms(to, ctx.to, body, ctx.config.businessName).catch((err) =>
    console.error("[actions] booking confirmation sms failed", err),
  );
  await withDeadline(send, 3000, undefined);
}

// The guard + calendar create + persistence. Returns the spoken stage-direction
// for the synchronous path; in deferred mode the return is unused (the caller
// was already acknowledged) and any failure notifies the business by SMS.
async function runBooking(
  ctx: ActionContext,
  repo: CallRepository,
  resolved: ResolvedCalendar,
  writeProvider: string,
  req: BookingRequest,
  input: Record<string, unknown>,
  access: CalendarAccessEntry[],
  deferred: boolean,
): Promise<string> {
  const readable = resolveCalendarsForAccess(ctx.config.integrations, access);
  const tGuardStart = Date.now();
  if (readable.length > 0) {
    // Trust a <45s snapshot ONLY when every calendar being checked IS the write
    // calendar AND that provider refuses a taken slot at create time (Cal.com).
    // A read-only calendar has no booking backstop, and Google/Outlook create
    // events unconditionally - so with any of those among the readable set the
    // guard must read live, or a stale snapshot lets a slot that's busy on
    // another calendar through as a silent cross-calendar double-book.
    const snapshotSafe =
      providerRejectsConflicts(writeProvider) &&
      readable.every((c) => c.integrationId === resolved.integrationId);
    const guardOpts = snapshotSafe ? { maxSnapshotAgeMs: 45_000 } : { fresh: true as const };
    const check = await checkAvailability(readable, req.startTime, req.endTime, guardOpts).catch(
      () => null,
    );
    if (check?.ok && !check.requestedFree) {
      if (deferred) {
        // Record failure best-effort, but never let a DB error swallow the
        // owner alert - the caller was already told it's being arranged.
        await repo
          .recordAction(
            ctx.callId,
            { type: "booking", status: "failed", payload: input, error: "slot no longer free" },
            resolved.integrationId,
          )
          .catch((e) => console.error(`[actions] deferred guard-fail record failed ${ctx.callId}`, e));
        await notifyBookingIssue(ctx, req, "the requested time was no longer free");
        return "";
      }
      return "That time was just taken. Apologize briefly and offer the caller a different time - never say what else is scheduled.";
    }
  }
  const guardMs = Date.now() - tGuardStart;

  const tCreateStart = Date.now();
  const result = await withDeadline(resolved.provider.createEvent(req), BOOKING_TIMEOUT_MS, {
    ok: false as const,
    error: "timeout",
  });
  const createMs = Date.now() - tCreateStart;
  if (!result.ok) {
    console.error(
      `[actions] book_appointment failed for call ${ctx.callId} on ${resolved.integrationId}: ${result.error ?? "unknown"}`,
    );
  }
  // A timed-out create keeps running and may still land on the calendar, so
  // record it as pending (the team confirms) instead of failed.
  const unconfirmed = !result.ok && result.error === "timeout";
  // Both must land before we tell the caller the booking is confirmed: the
  // dashboard (and cancel flow) reads the action row, and the stale busy-window
  // snapshot must be gone so no later check reads pre-booking data. They are
  // independent, so run them in parallel to shave a round trip off the reply.
  const tPersistStart = Date.now();
  const record = repo.recordAction(
    ctx.callId,
    {
      type: "booking",
      status: result.ok ? "done" : unconfirmed ? "pending" : "failed",
      externalId: result.externalId,
      // Stash the event's web link so the post-call summary email can offer a
      // "view booking" button straight to the calendar entry.
      payload: result.ok && result.url ? { ...input, event_url: result.url } : input,
      // Give the dashboard enough context to reconcile a timed-out create,
      // which may or may not have landed on the calendar.
      error: unconfirmed
        ? "timeout - the event may still exist on the calendar; confirm manually"
        : result.error,
    },
    resolved.integrationId,
  );
  // Swallow a record failure only when it's safe: a landed booking (result.ok)
  // must not be reported as failed; a timed-out create is pending anyway; and
  // the deferred path must reach its recovery SMS below. A synchronous HARD
  // failure must still propagate the DB error, so we never falsely tell the
  // caller it was "saved as a request" with no durable record and no alert.
  const swallowRecordError = deferred || result.ok || unconfirmed;
  await Promise.all([
    result.ok || unconfirmed ? clearSnapshot(resolved.integrationId) : Promise.resolve(),
    swallowRecordError
      ? record.catch((e) => console.error(`[actions] booking recordAction failed ${ctx.callId}`, e))
      : record,
  ]);
  // Phase timings for the booking hot path (5.6): correlate against
  // ElevenLabs' per-call latency medians to find the real p50/p99.
  console.log("[actions] book_appointment timing", {
    callId: ctx.callId,
    integrationId: resolved.integrationId,
    guardMs,
    createMs,
    persistMs: Date.now() - tPersistStart,
    ok: result.ok,
    unconfirmed,
    deferred,
  });

  if (result.ok) {
    // Text the caller the confirmation the agent promised. In deferred mode we
    // are already in background, so await it; in the synchronous path schedule
    // it via after() so the SMS never delays the tool response. Never let a
    // confirmation-SMS failure propagate - the booking itself succeeded, so it
    // must not trigger the deferred error alert.
    if (deferred) await sendBookingConfirmationSms(ctx, req).catch(() => {});
    else after(() => sendBookingConfirmationSms(ctx, req));
    return "Booked and confirmed. Tell the caller it's all set (repeat the day and time naturally), then ask if there's anything else you can help with. If not, wish them well and end the call.";
  }
  if (deferred) {
    // The caller was already told it's being arranged - the only recovery is
    // to alert the business, since we cannot re-open the closed conversation.
    await notifyBookingIssue(
      ctx,
      req,
      unconfirmed ? "the calendar timed out (it may still have landed)" : result.error ?? "calendar error",
    );
    return "";
  }
  return unconfirmed
    ? "The calendar is responding slowly, so the booking isn't confirmed yet. Tell the caller the team will double-check and confirm it shortly - never claim it is booked."
    : "I couldn't reach the calendar, so I've saved it as a request to confirm. Tell the caller the team will confirm it shortly.";
}

export async function bookAppointmentAction(
  ctx: ActionContext,
  repo: CallRepository,
  input: Record<string, unknown>,
): Promise<string> {
  const access = calendarAccessFrom(ctx.config);
  const writeEntry = access.find((a) => a.level === "write");

  const req = bookingRequestFromPayload(input, ctx.from);

  const startMs = Date.parse(req.startTime);
  const endMs = Date.parse(req.endTime);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return "I need a valid start and end time to book - please confirm the exact date and time with the caller.";
  }

  const resolved = writeEntry
    ? resolveCalendarById(ctx.config.integrations, writeEntry.integrationId)
    : null;
  if (!resolved) {
    await repo.recordAction(ctx.callId, {
      type: "booking",
      status: "pending",
      payload: input,
    });
    return "Saved the appointment request; our team will confirm shortly. Tell the caller that, then ask if there's anything else you can help with.";
  }

  const writeProvider =
    ctx.config.integrations.find((i) => i.id === resolved.integrationId)?.provider ?? "";

  if (optimisticBookingEnabled(ctx.config)) {
    // Acknowledge now; do the real guard + create + persist in the background
    // right after this response (Next after(), reliable server-side - not a
    // fire-and-forget ElevenLabs async tool, whose failures are unrecoverable).
    after(() =>
      runBooking(ctx, repo, resolved, writeProvider, req, input, access, true).catch(async (err) => {
        console.error(`[actions] deferred booking crashed for call ${ctx.callId}`, err);
        // Belt-and-suspenders: even on an unexpected throw, don't leave the
        // caller's "arranging it" promise silently unmet - alert the business.
        await notifyBookingIssue(ctx, req, "an internal error interrupted the booking").catch(
          () => {},
        );
      }),
    );
    return "Great - I'm getting that booked now. Tell the caller warmly that you're arranging it for the day and time they gave and they'll get a confirmation shortly. Do NOT say it's already confirmed. Then ask if there's anything else you can help with.";
  }

  return runBooking(ctx, repo, resolved, writeProvider, req, input, access, false);
}

export async function takeMessageAction(
  ctx: ActionContext,
  repo: CallRepository,
  input: Record<string, unknown>,
): Promise<string> {
  // Clip/sanitize before storing or texting - these fields are untrusted tool args.
  const payload = {
    caller_name: clip(input.caller_name, 120),
    callback_number: clip(input.callback_number, 40),
    message: clip(input.message, 1000),
    urgency: clip(input.urgency, 20),
  };
  // The insert IS the saved message - it must land before we claim success.
  // Only the best-effort SMS alert (up to 3s) runs after the response.
  await repo.recordAction(ctx.callId, { type: "message", status: "done", payload });
  after(() => alertOwner(ctx, payload));
  return "Message saved. Reassure the caller it's been passed on, then ask if there's anything else you can help with.";
}

async function alertOwner(
  ctx: ActionContext,
  input: { caller_name: string; callback_number: string; message: string },
): Promise<void> {
  const r = ctx.config.routing as { transferTo?: string; smsAlerts?: boolean };
  if (!r.transferTo || r.smsAlerts === false) return;
  const who = input.caller_name || ctx.from;
  const cb = input.callback_number ? ` (${input.callback_number})` : "";
  const body = `New message for ${ctx.config.businessName}: ${input.message} - from ${who}${cb}`;
  // Log on the promise itself: withDeadline swallows rejections into its
  // fallback, so a try/catch around it would never see the Twilio error.
  const send = sendSms(r.transferTo, ctx.to, body, ctx.config.businessName).catch((err) =>
    console.error("[actions] sms alert failed", err),
  );
  await withDeadline(send, 3000, undefined);
}
