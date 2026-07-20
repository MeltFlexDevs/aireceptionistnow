"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { currentUserId } from "@/lib/auth";
import { deleteIntegration, setPrimaryCalendar } from "@/lib/dashboard/db";
import { getDictionary } from "@/lib/i18n/server";
import { ok, fail, type ActionState } from "@/lib/dashboard/action-state";
import {
  cancelCalendarEvent,
  loadBookingForCancel,
  patchCancellationState,
  saveCancellationState,
  type BookingForCancel,
} from "@/lib/dashboard/booking-cancel";
import { retryBookingSync } from "@/lib/dashboard/booking-retry";
import { ownerTimezone } from "@/lib/dashboard/timezone";
import { dateTimeFmt } from "@/lib/dashboard/calls/format";
import { composeCancellationScript, composeCancellationSms } from "@/lib/call-engine/cancellation";
import { placeAgentCall } from "@/lib/call-engine/elevenlabs";
import { localizeSms } from "@/lib/call-engine/llm/greeting";
import { sendSms } from "@/lib/call-engine/telephony";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";

/**
 * All four actions below report back through the shared ActionState contract
 * and an inline pill, rather than the old ?saved=/?error= redirect - which
 * reloaded the page, lost the reader's place in the agenda, and put raw
 * provider error text in the URL bar.
 */

export async function retryBookingSyncAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = (await getDictionary()).calendar;
  const actionId = String(formData.get("action_id") ?? "");
  if (!actionId) return fail(c.bookingMissing);

  const ownerId = (await currentUserId()) ?? null;
  const res = await retryBookingSync(actionId, ownerId).catch((err: Error) => ({
    ok: false as const,
    message: err.message,
  }));
  revalidatePath("/dashboard/calendar");
  // The provider's own error text never reaches the user - it is operator
  // diagnostics, and there is nothing they could do with it.
  return res.ok ? ok(c.retrySucceeded) : fail(c.retryFailed);
}

export async function cancelBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = (await getDictionary()).calendar;
  const actionId = String(formData.get("action_id") ?? "");
  if (!actionId) return fail(c.bookingMissing);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  const offerRebook = formData.get("offer_rebook") === "on";

  const ownerId = (await currentUserId()) ?? null;
  const booking = await loadBookingForCancel(actionId, ownerId).catch(() => null);
  if (!booking) return fail(c.bookingNotFound);

  const cal = await cancelCalendarEvent(booking, reason);

  await saveCancellationState(actionId, {
    reason,
    offerRebook,
    notifyStatus: "pending",
    calendarCancelled: cal.ok,
    calendarError: cal.ok ? undefined : cal.error,
    at: new Date().toISOString(),
  });

  after(() => notifyCustomer(actionId, booking, reason, offerRebook, ownerId));

  revalidatePath("/dashboard/calendar");
  // When the calendar entry could not be removed automatically, say so plainly
  // and tell them what to do - never surface the provider's message.
  return ok(cal.ok ? c.cancelledNotifying : `${c.cancelledNotifying} ${c.cancelledRemoveYourself}`);
}

export async function setPrimaryCalendarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = (await getDictionary()).calendar;
  const id = String(formData.get("id") ?? "");
  if (!id) return fail(c.calendarMissing);
  try {
    await setPrimaryCalendar(id, (await currentUserId()) ?? undefined);
  } catch {
    return fail(c.calendarActionFailed);
  }
  revalidatePath("/dashboard/calendar");
  return ok(c.primarySet);
}

export async function disconnectCalendarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = (await getDictionary()).calendar;
  const id = String(formData.get("id") ?? "");
  if (!id) return fail(c.calendarMissing);
  try {
    await deleteIntegration(id, (await currentUserId()) ?? undefined);
  } catch {
    // Already gone is the outcome the user wanted; don't report a failure.
  }
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/assistant", "layout");
  return ok(c.disconnected);
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
    if (res.conversationId) {
      await patchCancellationState(actionId, {
        notifyStatus: "calling",
        notifyConversationId: res.conversationId,
        notifyAt: new Date().toISOString(),
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
    const lang = languageFromPhone(booking.attendeePhone);
    const body = composeCancellationSms(ctx);
    const localized = lang ? await localizeSms(body, lang) : body;
    await sendSms(booking.attendeePhone, booking.fromNumber, localized, ctx.businessName);
    await patchCancellationState(actionId, { notifyStatus: "sms_sent" }).catch(() => {});
  } catch (err) {
    console.error(`[cancel] SMS fallback failed for ${actionId}`, err);
    await patchCancellationState(actionId, { notifyStatus: "failed" }).catch(() => {});
  }
}
