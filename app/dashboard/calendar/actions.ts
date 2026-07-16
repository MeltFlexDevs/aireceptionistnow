"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { currentUserId } from "@/lib/auth";
import {
  cancelCalendarEvent,
  loadBookingForCancel,
  patchCancellationState,
  saveCancellationState,
  type BookingForCancel,
} from "@/lib/dashboard/booking-cancel";
import { ownerTimezone } from "@/lib/dashboard/timezone";
import { dateTimeFmt } from "@/lib/dashboard/calls/format";
import { composeCancellationScript, composeCancellationSms } from "@/lib/call-engine/cancellation";
import { placeAgentCall } from "@/lib/call-engine/elevenlabs";
import { sendSms } from "@/lib/call-engine/telephony";

function back(msg: string, kind: "saved" | "error" = "saved"): never {
  revalidatePath("/dashboard/calendar");
  redirect(`/dashboard/calendar?${kind}=${encodeURIComponent(msg)}`);
}

/**
 * Cancel an AI-made booking and tell the customer. Cancels the real calendar
 * event, records the cancellation, then (off the response, via after) places an
 * outbound call explaining it - offering to rebook if asked - and falls back to
 * an SMS when the customer doesn't pick up (that fallback happens in the
 * post-call webhook, or here immediately if the call can't even be placed).
 */
export async function cancelBookingAction(formData: FormData): Promise<void> {
  const actionId = String(formData.get("action_id") ?? "");
  if (!actionId) back("Missing booking.", "error");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  const offerRebook = formData.get("offer_rebook") === "on";

  const ownerId = (await currentUserId()) ?? null;
  const booking = await loadBookingForCancel(actionId, ownerId).catch(() => null);
  if (!booking) back("That booking couldn't be found.", "error");

  // 1. Cancel the real event. A provider that can't cancel automatically (or a
  // booking with no event on record) doesn't block the notification - we still
  // tell the customer and flag the calendar side for the owner to handle.
  const cal = await cancelCalendarEvent(booking, reason);

  // 2. Persist the cancellation up front, so it survives even if the notify work
  // below is interrupted.
  await saveCancellationState(actionId, {
    reason,
    offerRebook,
    notifyStatus: "pending",
    calendarCancelled: cal.ok,
    calendarError: cal.ok ? undefined : cal.error,
    at: new Date().toISOString(),
  });

  // 3. Notify off the response - placing a call is several seconds and must not
  // hang the Cancel button.
  after(() => notifyCustomer(actionId, booking, reason, offerRebook, ownerId));

  const calNote = cal.ok
    ? ""
    : cal.notSupported
      ? " The calendar event couldn't be cancelled automatically - please remove it yourself."
      : ` The calendar event may still be there (${cal.error ?? "cancel failed"}).`;
  back(`Booking cancelled. We're contacting the customer now.${calNote}`);
}

async function notifyCustomer(
  actionId: string,
  booking: BookingForCancel,
  reason: string,
  offerRebook: boolean,
  ownerId: string | null,
): Promise<void> {
  const tz = await ownerTimezone(ownerId).catch(() => "UTC");
  const whenLabel = booking.startTime ? dateTimeFmt(tz)(booking.startTime) : "your appointment";
  const ctx = {
    businessName: booking.config.businessName,
    whenLabel,
    reason,
    offerRebook,
    callbackNumber: booking.fromNumber,
  };

  // Text the customer if there's no way to call them (no agent/number/phone).
  const canCall = Boolean(booking.agentId && booking.agentPhoneNumberId && booking.attendeePhone);
  if (!canCall) {
    await smsFallback(actionId, booking, ctx);
    return;
  }

  const script = composeCancellationScript(ctx);
  try {
    const res = await placeAgentCall(booking.attendeePhone, {
      agentId: booking.agentId!,
      agentPhoneNumberId: booking.agentPhoneNumberId!,
      language: booking.language ?? undefined,
      firstMessage: script.firstMessage,
      prompt: script.prompt,
    });
    // Record the call so the post-call webhook can match it and, on no-answer,
    // send the SMS. No conversation id means we can't correlate - text now.
    if (res.conversationId) {
      await patchCancellationState(actionId, {
        notifyStatus: "calling",
        notifyConversationId: res.conversationId,
      }).catch(() => {});
    } else {
      await smsFallback(actionId, booking, ctx);
    }
  } catch (err) {
    console.error(`[cancel] outbound call failed for ${actionId}, texting instead`, err);
    await smsFallback(actionId, booking, ctx);
  }
}

async function smsFallback(
  actionId: string,
  booking: BookingForCancel,
  ctx: Parameters<typeof composeCancellationSms>[0],
): Promise<void> {
  try {
    await sendSms(booking.attendeePhone, booking.fromNumber, composeCancellationSms(ctx));
    await patchCancellationState(actionId, { notifyStatus: "sms_sent" }).catch(() => {});
  } catch (err) {
    console.error(`[cancel] SMS fallback failed for ${actionId}`, err);
    await patchCancellationState(actionId, { notifyStatus: "failed" }).catch(() => {});
  }
}
