import { after } from "next/server";
import { checkAvailability } from "./integrations/availability";
import { clearSnapshot } from "./integrations/snapshot-store";
import {
  resolveCalendarById,
  resolveCalendarsForAccess,
  type CalendarAccessEntry,
} from "./integrations/registry";
import { INTEGRATION_TIMEOUT_MS, withDeadline } from "./net";
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

export function canCheckAvailability(config: NumberConfig): boolean {
  return calendarAccessFrom(config).length > 0;
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
    return "Saved the appointment request; our team will confirm shortly.";
  }

  const readable = resolveCalendarsForAccess(ctx.config.integrations, access);
  if (readable.length > 0) {
    // The pre-write double-book guard must see live data, never a snapshot.
    const check = await checkAvailability(readable, req.startTime, req.endTime, {
      fresh: true,
    }).catch(() => null);
    if (check?.ok && !check.requestedFree) {
      return "That time was just taken. Apologize briefly and offer the caller a different time - never say what else is scheduled.";
    }
  }

  const result = await withDeadline(resolved.provider.createEvent(req), INTEGRATION_TIMEOUT_MS, {
    ok: false as const,
    error: "timeout",
  });
  if (!result.ok) {
    console.error(
      `[actions] book_appointment failed for call ${ctx.callId} on ${resolved.integrationId}: ${result.error ?? "unknown"}`,
    );
  }
  // The event changed the calendar - drop the cached busy window before
  // replying so no later check can read the pre-booking snapshot.
  if (result.ok) await clearSnapshot(resolved.integrationId);
  // The dashboard (and cancel flow) reads this row - it must land before we
  // tell the caller the booking is confirmed.
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
  return "Got it - I've saved your message.";
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
  try {
    await withDeadline(sendSms(r.transferTo, ctx.to, body), 3000, undefined);
  } catch (err) {
    console.error("[actions] sms alert", err);
  }
}
