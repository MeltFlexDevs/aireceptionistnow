import { serviceClient } from "./supabase";
import { getAssistantNumber } from "./db";
import { ownerTimezone } from "./timezone";
import { dateTimeFmt } from "./calls/format";
import { getRepository } from "../call-engine/persistence/supabase";
import { resolveCalendarById } from "../call-engine/integrations/registry";
import { clearSnapshot } from "../call-engine/integrations/snapshot-store";
import { composeCancellationSms } from "../call-engine/cancellation";
import { sendSms } from "../call-engine/telephony";
import { languageFromPhone } from "../call-engine/voice/phone-language";
import type { NumberConfig } from "../call-engine/types";

export interface CancellationState {
  reason: string;
  offerRebook: boolean;
  notifyStatus: "pending" | "calling" | "answered" | "sms_sent" | "failed";
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
  attendeePhone: string;
  attendeeName: string;
  startTime: string;
  title: string;
  config: NumberConfig;
  agentId: string | null;
  agentPhoneNumberId: string | null;
  fromNumber: string;
  language: string | null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

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
  // The freed slot must not keep reading as busy from the snapshot cache.
  if (res.ok) await clearSnapshot(booking.integrationId).catch(() => {});
  return res;
}

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
