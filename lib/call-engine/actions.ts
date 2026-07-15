import { checkAvailability } from "./integrations/availability";
import {
  resolveCalendarById,
  resolveCalendarsForAccess,
  type CalendarAccessEntry,
} from "./integrations/registry";
import type { CallRepository } from "./persistence/types";
import { sendSms } from "./telephony";
import type { BookingRequest, NumberConfig } from "./types";

// Transport-agnostic receptionist actions. This is the shared business core:
// the tier-B media server (CallSession) executes tools by calling these, and the
// tier-A managed-agent webhooks (ElevenLabs server tools) call the exact same
// functions. One source of truth for "what the receptionist can do" - the two
// tiers differ only in who runs the voice + LLM, never in the actions.
//
// Every function returns the natural-language string the assistant should speak
// (or hand back to the ElevenLabs agent as the tool result), and persists the
// action so it shows up on the dashboard and in the post-call summary.

/** The minimum a call carries for an action to run, independent of transport. */
export interface ActionContext {
  callId: string;
  config: NumberConfig;
  /** Caller's number - fallback attendee phone + who a message is from. */
  from: string;
  /** Dialed business number - the "from" when we text the owner. */
  to: string;
}

/** Coerce a tool argument to a bounded, control-char-free string. Tool inputs
 *  come from the agent webhook (untrusted), so anything that lands in a stored
 *  payload, a calendar event, or an outbound SMS is clipped and stripped of
 *  control characters (defends against injected/oversized values). */
function clip(value: unknown, max = 500): string {
  return String(value ?? "")
    .replace(new RegExp("[\\u0000-\\u001F\\u007F]", "g"), " ")
    .trim()
    .slice(0, max);
}

/** Calendars this assistant may read for availability (any granted level). */
export function calendarAccessFrom(config: NumberConfig): CalendarAccessEntry[] {
  return (
    (config.routing.calendar as { access?: CalendarAccessEntry[] } | undefined)
      ?.access ?? []
  );
}

/** True when the assistant can read at least one calendar (drives whether the
 *  check_availability tool is even offered). */
export function canCheckAvailability(config: NumberConfig): boolean {
  return calendarAccessFrom(config).length > 0;
}

/**
 * Read-only availability check across every calendar this assistant may read.
 * Returns guidance the model speaks; it deliberately surfaces only free/busy and
 * free alternatives - never what is scheduled, who, or why.
 */
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

/**
 * Book an appointment on the calendar this assistant was granted WRITE access to.
 * With only read access (or none), nothing is written: the booking is recorded as
 * a pending request for a human to confirm. Records the action either way, so a
 * request the assistant couldn't fulfil still surfaces on the dashboard.
 */
export async function bookAppointmentAction(
  ctx: ActionContext,
  repo: CallRepository,
  input: Record<string, unknown>,
): Promise<string> {
  const access = calendarAccessFrom(ctx.config);
  const writeEntry = access.find((a) => a.level === "write");

  const req: BookingRequest = {
    title: clip(input.title, 200) || "Appointment",
    startTime: clip(input.start_time, 64),
    endTime: clip(input.end_time, 64),
    attendeeName: input.attendee_name ? clip(input.attendee_name, 120) : undefined,
    attendeePhone: input.attendee_phone ? clip(input.attendee_phone, 40) : ctx.from,
    notes: input.notes ? clip(input.notes, 1000) : undefined,
  };

  // Reject garbage before it reaches a provider - a malformed range would fail
  // opaquely there and be spoken as an outage instead of a re-ask.
  const startMs = Date.parse(req.startTime);
  const endMs = Date.parse(req.endTime);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return "I need a valid start and end time to book - please confirm the exact date and time with the caller.";
  }

  // Write access is the ONLY way to reach createEvent. This used to fall back to
  // resolveCalendarProvider ("the first enabled calendar") whenever there was no
  // write grant, which quietly booked into a calendar the assistant was allowed
  // only to read - or was never granted at all - and could even pick a different
  // calendar than the one the user granted. No grant, no write: the request is
  // recorded as pending and a human confirms it.
  const resolved = writeEntry
    ? resolveCalendarById(ctx.config.integrations, writeEntry.integrationId)
    : null;
  if (!resolved) {
    await repo.recordAction(ctx.callId, {
      type: "booking",
      status: "pending",
      payload: input,
    });
    return "Saved the appointment request; our team will confirm shortly.";
  }

  // Last-moment conflict re-check: nothing guarantees check_availability was
  // called, or that its answer is still current. Providers create overlapping
  // events without complaint, so re-verify on every readable calendar right
  // before writing. ponytail: narrows the race, can't eliminate it - no
  // conflict-rejecting atomic create exists on Google/Graph.
  const readable = resolveCalendarsForAccess(ctx.config.integrations, access);
  if (readable.length > 0) {
    const check = await checkAvailability(readable, req.startTime, req.endTime).catch(() => null);
    if (check?.ok && !check.requestedFree) {
      return "That time was just taken. Apologize briefly and offer the caller a different time - never say what else is scheduled.";
    }
  }

  const result = await resolved.provider.createEvent(req);
  await repo.recordAction(
    ctx.callId,
    {
      type: "booking",
      status: result.ok ? "done" : "failed",
      externalId: result.externalId,
      payload: input,
      error: result.error,
    },
    resolved.integrationId,
  );
  return result.ok
    ? "The appointment is booked and confirmed."
    : "I couldn't reach the calendar, so I've saved it as a request to confirm.";
}

/** Record a message and text the owner's personal number if alerts are on. */
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
  await repo.recordAction(ctx.callId, {
    type: "message",
    status: "done",
    payload,
  });
  await alertOwner(ctx, payload);
  return "Got it - I've saved your message.";
}

/** Text the owner's personal number when a message is taken (if enabled). Input
 *  is already clipped/sanitized by the caller. */
async function alertOwner(
  ctx: ActionContext,
  input: { caller_name: string; callback_number: string; message: string },
): Promise<void> {
  const r = ctx.config.routing as { transferTo?: string; smsAlerts?: boolean };
  if (!r.transferTo || r.smsAlerts === false) return;
  const who = input.caller_name || ctx.from;
  const cb = input.callback_number ? ` (${input.callback_number})` : "";
  const body = `New message for ${ctx.config.businessName}: ${input.message} - from ${who}${cb}`;
  try {
    await sendSms(r.transferTo, ctx.to, body);
  } catch (err) {
    console.error("[actions] sms alert", err);
  }
}
