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
import { localizeSms } from "@/lib/call-engine/llm/greeting";
import { sendSms } from "@/lib/call-engine/telephony";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";

function back(msg: string, kind: "saved" | "error" = "saved"): never {
  revalidatePath("/dashboard/calendar");
  redirect(`/dashboard/calendar?${kind}=${encodeURIComponent(msg)}`);
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const actionId = String(formData.get("action_id") ?? "");
  if (!actionId) back("Missing booking.", "error");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  const offerRebook = formData.get("offer_rebook") === "on";

  const ownerId = (await currentUserId()) ?? null;
  const booking = await loadBookingForCancel(actionId, ownerId).catch(() => null);
  if (!booking) back("That booking couldn't be found.", "error");

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
