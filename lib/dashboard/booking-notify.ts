import "server-only";

import { composeCancellationScript, composeCancellationSms } from "@/lib/call-engine/cancellation";
import { placeAgentCall } from "@/lib/call-engine/elevenlabs";
import { localizeSms } from "@/lib/call-engine/llm/greeting";
import { sendSms } from "@/lib/call-engine/telephony";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";

import { patchCancellationState, type BookingForCancel } from "./booking-cancel";
import { dateTimeFmt } from "./calls/format";
import { ownerTimezone } from "./timezone";

/**
 * Telling the customer their appointment is off.
 *
 * Lifted out of the dashboard's cancel action so the native app's cancel route
 * runs the identical sequence. Two callers, one implementation: a phone cancel
 * that only removed the calendar entry and never rang the customer would look
 * successful and leave someone driving to a closed door.
 *
 * Always call this from `after()` (or an equivalent background hook) - it makes
 * an outbound call and can take tens of seconds.
 */
export async function notifyCancelledCustomer(
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

  // Text the customer if there is no way to call them (no agent/number/phone).
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
