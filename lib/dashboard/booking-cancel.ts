import { serviceClient } from "./supabase";
import { getAssistantNumber } from "./db";
import { ownerTimezone } from "./timezone";
import { dateTimeFmt } from "./calls/format";
import { getRepository } from "../call-engine/persistence/supabase";
import { resolveCalendarById } from "../call-engine/integrations/registry";
import { composeCancellationSms } from "../call-engine/cancellation";
import { sendSms } from "../call-engine/telephony";
import { languageFromPhone } from "../call-engine/voice/phone-language";
import type { NumberConfig } from "../call-engine/types";

// Data layer for cancelling an AI-made booking and notifying the customer. The
// booking is a `call_actions` row (type='booking') carrying the provider booking
// id (external_id), which calendar it's on (integration_id), and the appointment
// details (payload). Cancellation state lives back on that same row's payload -
// no new table, so nothing to migrate.

export interface CancellationState {
  reason: string;
  offerRebook: boolean;
  /** pending → calling → answered | sms_sent | failed */
  notifyStatus: "pending" | "calling" | "answered" | "sms_sent" | "failed";
  /** The outbound notify call's conversation id, for the webhook to correlate. */
  notifyConversationId?: string;
  calendarCancelled: boolean;
  calendarError?: string;
  at: string;
}

export interface BookingForCancel {
  actionId: string;
  callId: string;
  ownerId: string | null;
  externalId: string | null;
  integrationId: string | null;
  /** Who to call/text - the appointment attendee. */
  attendeePhone: string;
  attendeeName: string;
  /** ISO start of the appointment being cancelled. */
  startTime: string;
  title: string;
  /** Resolved call config (business name, integrations) for the assistant's line. */
  config: NumberConfig;
  /** The assistant's ElevenLabs agent (the outbound call's brain). */
  agentId: string | null;
  /** The assistant's connected number, as the outbound caller ID + SMS sender. */
  agentPhoneNumberId: string | null;
  fromNumber: string;
  language: string | null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Everything needed to cancel one booking and notify its customer, or null when
 * the action isn't a booking, doesn't belong to the caller, or can't be resolved.
 * Owner-scoped (auth on): a booking whose call is owned by another user is hidden,
 * same rule as the call detail page.
 */
export async function loadBookingForCancel(
  actionId: string,
  ownerId: string | null,
): Promise<BookingForCancel | null> {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("call_actions")
    .select(
      "id,type,external_id,integration_id,payload,call:calls!inner(id,assistant_id,owner_id,to_number,from_number)",
    )
    .eq("id", actionId)
    .eq("type", "booking")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as Record<string, unknown>;
  const call = (Array.isArray(row.call) ? row.call[0] : row.call) as Record<string, unknown>;
  if (!call) return null;

  // Owner scoping: with auth on, only the booking's owner may cancel it.
  if (ownerId && str(call.owner_id) && str(call.owner_id) !== ownerId) return null;

  const payload = (row.payload as Record<string, unknown>) ?? {};
  const toNumber = str(call.to_number); // the assistant's own line
  const config = toNumber ? await getRepository().resolveInboundNumber(toNumber).catch(() => null) : null;
  if (!config) return null;

  const assistantId = str(call.assistant_id);
  const [assistant, number] = await Promise.all([
    assistantId
      ? sb.from("assistants").select("elevenlabs_agent_id").eq("id", assistantId).maybeSingle()
      : Promise.resolve({ data: null }),
    assistantId ? getAssistantNumber(assistantId).catch(() => null) : Promise.resolve(null),
  ]);

  const attendeePhone = str(payload.attendee_phone) || str(call.from_number);

  return {
    actionId: str(row.id),
    callId: str(call.id),
    ownerId: str(call.owner_id) || null,
    externalId: row.external_id ? str(row.external_id) : null,
    integrationId: row.integration_id ? str(row.integration_id) : null,
    attendeePhone,
    attendeeName: str(payload.attendee_name),
    startTime: str(payload.start_time),
    title: str(payload.title) || "your appointment",
    config,
    agentId: (assistant.data as { elevenlabs_agent_id?: string } | null)?.elevenlabs_agent_id ?? null,
    agentPhoneNumberId: number?.elevenlabs_phone_number_id ?? null,
    fromNumber: number?.e164 || config.e164,
    language: languageFromPhone(attendeePhone),
  };
}

/** Cancel the real calendar event this booking is on, if the provider supports
 *  it. Returns { ok, error }; a provider without cancelEvent (or no external id)
 *  reports notSupported so the caller can still notify but flag the calendar side. */
export async function cancelCalendarEvent(
  booking: BookingForCancel,
  reason: string,
): Promise<{ ok: boolean; error?: string; notSupported?: boolean }> {
  if (!booking.integrationId || !booking.externalId) {
    return { ok: false, notSupported: true, error: "no calendar event on record" };
  }
  const cal = resolveCalendarById(booking.config.integrations, booking.integrationId);
  if (!cal || typeof cal.provider.cancelEvent !== "function") {
    return { ok: false, notSupported: true, error: "this calendar can't be cancelled automatically" };
  }
  const res = await cal.provider.cancelEvent(booking.externalId, reason).catch((err: Error) => ({
    ok: false,
    error: err?.message ?? "cancel threw",
  }));
  return res;
}

/** Persist the cancellation onto the booking action: status → 'cancelled', and a
 *  `cancellation` block on the payload holding reason/offer/notify state. */
export async function saveCancellationState(
  actionId: string,
  state: CancellationState,
): Promise<void> {
  const sb = serviceClient();
  const { data } = await sb.from("call_actions").select("payload").eq("id", actionId).maybeSingle();
  const payload = ((data?.payload as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const { error } = await sb
    .from("call_actions")
    .update({ status: "cancelled", payload: { ...payload, cancellation: state } })
    .eq("id", actionId);
  if (error) throw error;
}

/** For the post-call webhook: find the booking whose notify call this
 *  conversation is, so it can decide the SMS fallback. */
export async function findBookingByNotifyConversation(
  conversationId: string,
): Promise<{ actionId: string; state: CancellationState } | null> {
  if (!conversationId) return null;
  const sb = serviceClient();
  const { data, error } = await sb
    .from("call_actions")
    .select("id,payload")
    .eq("payload->cancellation->>notifyConversationId", conversationId)
    .maybeSingle();
  if (error || !data) return null;
  const state = (data.payload as { cancellation?: CancellationState })?.cancellation;
  if (!state) return null;
  return { actionId: str(data.id), state };
}

/** Merge a patch into the stored cancellation block (webhook updates status). */
export async function patchCancellationState(
  actionId: string,
  patch: Partial<CancellationState>,
): Promise<void> {
  const sb = serviceClient();
  const { data } = await sb.from("call_actions").select("payload").eq("id", actionId).maybeSingle();
  const payload = ((data?.payload as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const current = (payload.cancellation as CancellationState) ?? {};
  const { error } = await sb
    .from("call_actions")
    .update({ payload: { ...payload, cancellation: { ...current, ...patch } } })
    .eq("id", actionId);
  if (error) throw error;
}

/**
 * Called by the post-call webhook when a cancellation-notify call finishes.
 * Answered -> just record it. Not answered (ring-out / voicemail) -> send the
 * SMS the customer was supposed to hear. Idempotent-ish: only acts while the
 * status is still "calling", so a duplicate webhook delivery won't double-text.
 */
export async function resolveCancellationNotify(
  actionId: string,
  state: CancellationState,
  answered: boolean,
): Promise<void> {
  if (state.notifyStatus !== "calling") return; // already resolved
  if (answered) {
    await patchCancellationState(actionId, { notifyStatus: "answered" }).catch(() => {});
    return;
  }

  const booking = await loadBookingForCancel(actionId, null).catch(() => null);
  if (!booking) {
    await patchCancellationState(actionId, { notifyStatus: "failed" }).catch(() => {});
    return;
  }
  const tz = await ownerTimezone(booking.ownerId).catch(() => "UTC");
  const whenLabel = booking.startTime ? dateTimeFmt(tz)(booking.startTime) : "your appointment";
  try {
    const body = composeCancellationSms({
      businessName: booking.config.businessName,
      whenLabel,
      reason: state.reason,
      offerRebook: state.offerRebook,
      callbackNumber: booking.fromNumber,
    });
    await sendSms(booking.attendeePhone, booking.fromNumber, body);
    await patchCancellationState(actionId, { notifyStatus: "sms_sent" }).catch(() => {});
  } catch (err) {
    console.error(`[cancel] no-answer SMS failed for ${actionId}`, err);
    await patchCancellationState(actionId, { notifyStatus: "failed" }).catch(() => {});
  }
}
