import { serviceClient } from "./supabase";
import { getAssistantNumber } from "./db";
import { ownerTimezone } from "./timezone";
import { dateTimeFmt } from "./calls/format";
import { getRepository } from "../call-engine/persistence/supabase";
import { resolveCalendarById } from "../call-engine/integrations/registry";
import { clearSnapshot } from "../call-engine/integrations/snapshot-store";
import { composeCancellationSms } from "../call-engine/cancellation";
import { localizeSms } from "../call-engine/llm/greeting";
import { withDeadline } from "../call-engine/net";
import { sendSms } from "../call-engine/telephony";
import { languageFromPhone } from "../call-engine/voice/phone-language";
import type { NumberConfig } from "../call-engine/types";

export interface CancellationState {
  reason: string;
  offerRebook: boolean;
  notifyStatus: "pending" | "calling" | "sms_sending" | "answered" | "sms_sent" | "failed";
  notifyConversationId?: string;
  notifyAt?: string; // when the outbound call was placed (sweep staleness)
  claimedAt?: string; // when a resolver claimed the SMS send (crash recovery)
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
  const { data, error: readErr } = await sb
    .from("call_actions")
    .select("payload")
    .eq("id", actionId)
    .maybeSingle();
  // A failed read must abort: merging into {} would overwrite the whole
  // payload (booking title, times, attendee) with just the cancellation state.
  if (readErr) throw readErr;
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
  const { data, error: readErr } = await sb
    .from("call_actions")
    .select("payload")
    .eq("id", actionId)
    .maybeSingle();
  // See saveCancellationState: never merge a patch into a payload we failed
  // to read - that would destroy the rest of the booking payload.
  if (readErr) throw readErr;
  const payload = ((data?.payload as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const current = (payload.cancellation as CancellationState) ?? {};
  const { error } = await sb
    .from("call_actions")
    .update({ payload: { ...payload, cancellation: { ...current, ...patch } } })
    .eq("id", actionId);
  if (error) throw error;
}

// A claim younger than this is assumed in flight; older ones are retried
// (the claimer crashed between claiming and sending).
const CLAIM_STALE_MS = 2 * 60_000;

// Atomically claim the right to send the follow-up SMS. The post-call webhook
// and the cron sweep race here; the conditional update (a CAS on the previous
// status/claim time) guarantees exactly one of them proceeds, instead of the
// customer receiving two cancellation texts.
async function claimCancellationNotify(actionId: string): Promise<CancellationState | null> {
  const sb = serviceClient();
  const { data } = await sb.from("call_actions").select("payload").eq("id", actionId).maybeSingle();
  const payload = ((data?.payload as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const current = payload.cancellation as CancellationState | undefined;
  if (!current) return null;

  let guard: { column: string; value: string };
  if (current.notifyStatus === "calling" || current.notifyStatus === "pending") {
    // "pending" reaches here via the sweep when the outbound-call step died
    // before ever placing the call - the SMS is the only notification left.
    guard = { column: "payload->cancellation->>notifyStatus", value: current.notifyStatus };
  } else if (
    current.notifyStatus === "sms_sending" &&
    !(Date.now() - Date.parse(current.claimedAt ?? "") < CLAIM_STALE_MS)
  ) {
    // A stale claim means the previous resolver died mid-send - CAS on its
    // claim timestamp so only one retrier takes over.
    guard = { column: "payload->cancellation->>claimedAt", value: current.claimedAt ?? "" };
  } else {
    return null; // resolved, or someone else's claim is still fresh
  }

  const claimed: CancellationState = {
    ...current,
    notifyStatus: "sms_sending",
    claimedAt: new Date().toISOString(),
  };
  const { data: rows, error } = await sb
    .from("call_actions")
    .update({ payload: { ...payload, cancellation: claimed } })
    .eq("id", actionId)
    .eq(guard.column, guard.value)
    .select("id");
  if (error) throw error;
  return rows?.length ? claimed : null;
}

// Persist an outcome status with retries: this write is the only thing that
// stops the sweep from re-claiming and re-texting the customer, so a single
// transient DB error here must not be swallowed silently.
async function recordNotifyOutcome(
  actionId: string,
  notifyStatus: CancellationState["notifyStatus"],
): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await patchCancellationState(actionId, { notifyStatus });
      return;
    } catch (err) {
      if (attempt === 3) {
        console.error(
          `[cancel] recording notifyStatus=${notifyStatus} failed for ${actionId} - the sweep may resend`,
          err,
        );
        return;
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

export async function resolveCancellationNotify(
  actionId: string,
  state: CancellationState,
  answered: boolean,
): Promise<void> {
  if (
    state.notifyStatus !== "calling" &&
    state.notifyStatus !== "sms_sending" &&
    state.notifyStatus !== "pending"
  ) {
    return;
  }
  const claimed = await claimCancellationNotify(actionId);
  if (!claimed) return; // another resolver won the race

  // Always follow up with an SMS: voicemail pickups look "answered" to the
  // duration/turn heuristic, and even a real answer deserves written
  // confirmation. `answered` only decides the status when the SMS fails.
  // Every step below is deadline-bounded so the whole claim-to-send path stays
  // well inside CLAIM_STALE_MS - a hung upstream call must not outlive the
  // claim and race a sweep re-claimer.
  const booking = await withDeadline(
    loadBookingForCancel(actionId, null).catch(() => null),
    20_000,
    null,
  );
  if (!booking) {
    await recordNotifyOutcome(actionId, "failed");
    return;
  }
  const tz = await withDeadline(ownerTimezone(booking.ownerId).catch(() => "UTC"), 5_000, "UTC");
  const whenLabel = booking.startTime ? dateTimeFmt(tz)(booking.startTime) : "your appointment";
  try {
    const body = composeCancellationSms({
      businessName: booking.config.businessName,
      whenLabel,
      reason: claimed.reason,
      offerRebook: claimed.offerRebook,
      callbackNumber: booking.fromNumber,
    });
    // Speak the caller's language (from their phone country) and send under
    // the business's name.
    const lang = languageFromPhone(booking.attendeePhone);
    const localized = lang ? await withDeadline(localizeSms(body, lang), 10_000, body) : body;
    await sendSms(booking.attendeePhone, booking.fromNumber, localized, booking.config.businessName);
    await recordNotifyOutcome(actionId, "sms_sent");
  } catch (err) {
    console.error(`[cancel] follow-up SMS failed for ${actionId}`, err);
    await recordNotifyOutcome(actionId, answered ? "answered" : "failed");
  }
}
