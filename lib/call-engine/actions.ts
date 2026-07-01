import { checkAvailability } from "./integrations/availability";
import {
  resolveCalendarById,
  resolveCalendarProvider,
  resolveCalendarsForAccess,
  type CalendarAccessEntry,
} from "./integrations/registry";
import type { CallRepository } from "./persistence/types";
import { sendSms } from "./telephony";
import type { BookingRequest, NumberConfig } from "./types";

// Transport-agnostic receptionist actions. This is the shared business core:
// the tier-B media server (CallSession) executes tools by calling these, and the
// tier-A managed-agent webhooks (ElevenLabs server tools) call the exact same
// functions. One source of truth for "what the receptionist can do" — the two
// tiers differ only in who runs the voice + LLM, never in the actions.
//
// Every function returns the natural-language string the assistant should speak
// (or hand back to the ElevenLabs agent as the tool result), and persists the
// action so it shows up on the dashboard and in the post-call summary.

/** The minimum a call carries for an action to run, independent of transport. */
export interface ActionContext {
  callId: string;
  config: NumberConfig;
  /** Caller's number — fallback attendee phone + who a message is from. */
  from: string;
  /** Dialed business number — the "from" when we text the owner. */
  to: string;
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
 * free alternatives — never what is scheduled, who, or why.
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
    return "I couldn't check the calendar right now. Offer to take a message or have someone confirm, without guessing whether the time is free.";
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
 * Book an appointment on the assistant's write calendar (falling back to the
 * first connected calendar, then to a pending request if none is reachable).
 * Records the booking action either way.
 */
export async function bookAppointmentAction(
  ctx: ActionContext,
  repo: CallRepository,
  input: Record<string, unknown>,
): Promise<string> {
  const access = calendarAccessFrom(ctx.config);
  const writeEntry = access.find((a) => a.level === "write");

  const req: BookingRequest = {
    title: String(input.title ?? "Appointment"),
    startTime: String(input.start_time ?? ""),
    endTime: String(input.end_time ?? ""),
    attendeeName: input.attendee_name ? String(input.attendee_name) : undefined,
    attendeePhone: input.attendee_phone ? String(input.attendee_phone) : ctx.from,
    notes: input.notes ? String(input.notes) : undefined,
  };

  let resolved = writeEntry
    ? resolveCalendarById(ctx.config.integrations, writeEntry.integrationId)
    : null;
  if (!resolved) resolved = resolveCalendarProvider(ctx.config.integrations);
  if (!resolved) {
    await repo.recordAction(ctx.callId, {
      type: "booking",
      status: "pending",
      payload: input,
    });
    return "Saved the appointment request; the team will confirm shortly.";
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
  await repo.recordAction(ctx.callId, {
    type: "message",
    status: "done",
    payload: input,
  });
  await alertOwner(ctx, input);
  return "Got it — I've saved your message.";
}

/** Text the owner's personal number when a message is taken (if enabled). */
async function alertOwner(
  ctx: ActionContext,
  input: Record<string, unknown>,
): Promise<void> {
  const r = ctx.config.routing as { transferTo?: string; smsAlerts?: boolean };
  if (!r.transferTo || r.smsAlerts === false) return;
  const who = input.caller_name ? String(input.caller_name) : ctx.from;
  const cb = input.callback_number ? ` (${String(input.callback_number)})` : "";
  const body = `New message for ${ctx.config.businessName}: ${String(
    input.message ?? "",
  )} — from ${who}${cb}`;
  try {
    await sendSms(r.transferTo, ctx.to, body);
  } catch (err) {
    console.error("[actions] sms alert", err);
  }
}
