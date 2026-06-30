"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildConnectResponse } from "@/lib/call-engine/pickup";
import {
  claimFreeNumber,
  countFreeNumbers,
  createAssistant,
  createNumber,
  createTestCall,
  setCallTwilioSid,
  deleteAssistant,
  ensureBusinessId,
  freeAssistantNumbers,
  getAssistant,
  getAssistantNumber,
  listIntegrations,
  setNumberAssistant,
  updateAssistant,
} from "@/lib/dashboard/db";
import { readKnowledge } from "@/lib/knowledge/sources";
import {
  buyTwilioNumber,
  buyTwilioNumbers,
  ensureTwilioNumber,
  placeCall,
  registerCnam,
} from "@/lib/dashboard/twilio";
import { currentUserId } from "@/lib/auth";
import { canAssignNumber } from "@/lib/dashboard/plan";

const E164 = /^\+[1-9]\d{6,15}$/;

// Keep this many free numbers standing by in the shared pool at all times, so a
// new assistant gets a number instantly. The pool is refilled (by buying) after
// each assignment; numbers freed by deleting assistants reduce how much we buy.
const POOL_TARGET_FREE = 3;

/** Buy numbers until the pool holds POOL_TARGET_FREE free ones again. */
async function topUpPool(country: string): Promise<void> {
  const deficit = POOL_TARGET_FREE - (await countFreeNumbers());
  if (deficit <= 0) return;
  const bought = await buyTwilioNumbers({ country }, deficit);
  for (const b of bought) {
    await createNumber({ e164: b.e164, twilioSid: b.sid });
  }
}

export async function createAssistantAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim() || "My assistant";
  const country = String(formData.get("country") ?? "US").trim() || "US";

  const ownerId = await currentUserId();
  let id: string;
  try {
    id = await createAssistant(name, ownerId ?? undefined);
  } catch (err) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent((err as Error).message)}`);
  }

  // Only provision a number if the owner's plan still has phone-number quota.
  // The assistant is created either way; when the plan is maxed out we skip the
  // number and tell the user (they can upgrade, then add one from settings).
  const allowance = await canAssignNumber(ownerId);
  if (!allowance.ok) {
    revalidatePath("/dashboard/assistant");
    redirect(`/dashboard/assistant/${id}?notice=${encodeURIComponent(allowance.reason ?? "")}`);
  }

  // Assign a phone number from the shared pool (best-effort - the assistant is
  // still created if this fails, and a number can be added from its settings).
  // Claim a free number, buying one only if the pool is momentarily dry, then
  // top the pool back up to its standing buffer of POOL_TARGET_FREE.
  try {
    let claimed = await claimFreeNumber(id);
    if (!claimed) {
      const [bought] = await buyTwilioNumbers({ country }, 1);
      if (bought) await createNumber({ e164: bought.e164, twilioSid: bought.sid });
      claimed = await claimFreeNumber(id);
    }
    await topUpPool(country);
  } catch (err) {
    console.error("[assistant] number provisioning", err);
  }

  revalidatePath("/dashboard/assistant");
  redirect(`/dashboard/assistant/${id}`);
}

export async function updateAssistantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");

  const transferTo = String(formData.get("transfer_to") ?? "").trim();
  const sttProvider = String(formData.get("stt_provider") ?? "");

  const calendars = await listIntegrations().catch(() => []);
  const access: Array<{ integrationId: string; level: string }> = [];
  for (const c of calendars) {
    if (c.type !== "calendar") continue;
    const level = String(formData.get(`cal_access_${c.id}`) ?? "none");
    if (level === "busy" || level === "read" || level === "write") {
      access.push({ integrationId: c.id, level });
    }
  }

  const routing: Record<string, unknown> = {};
  if (transferTo) {
    routing.transferTo = transferTo;
    routing.smsAlerts = formData.get("sms_alerts") === "on";
  }
  if (access.length) routing.calendar = { access };
  if (sttProvider === "deepgram" || sttProvider === "elevenlabs") {
    routing.sttProvider = sttProvider;
  }

  // Email transcripts (optional). Stored even when sending isn't wired yet.
  const emailTo = String(formData.get("email_to") ?? "").trim();
  if (formData.get("email_enabled") === "on" && emailTo) {
    routing.emailTranscripts = { enabled: true, to: emailTo };
  }

  // CRM / ERP push (optional).
  const crmUrl = String(formData.get("crm_url") ?? "").trim();
  if (formData.get("crm_enabled") === "on" && crmUrl) {
    const crmSecret = String(formData.get("crm_secret") ?? "").trim();
    routing.crm = { enabled: true, url: crmUrl, ...(crmSecret ? { secret: crmSecret } : {}) };
  }

  // Knowledge lives at the organization level now; preserve whatever this
  // assistant already has untouched (this form only edits behavior + routing).
  const existing = await getAssistant(id).catch(() => null);
  const knowledge = readKnowledge(existing?.knowledge);

  try {
    await updateAssistant(id, {
      name: String(formData.get("name") ?? "").trim() || "My assistant",
      greeting: String(formData.get("greeting") ?? "").trim(),
      system_prompt: String(formData.get("system_prompt") ?? "").trim(),
      voice_id: String(formData.get("voice_id") ?? "").trim(),
      language: String(formData.get("language") ?? "en").trim() || "en",
      knowledge: { ...knowledge },
      routing,
    });
  } catch (err) {
    redirect(`/dashboard/assistant/${id}?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath(`/dashboard/assistant/${id}`);
  revalidatePath("/dashboard/assistant");
  redirect(`/dashboard/assistant/${id}?saved=1`);
}

export async function deleteAssistantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      // Return this assistant's numbers to the shared pool (unlink, but keep them
      // on Twilio) so another assistant can reuse them, then soft-delete the
      // assistant. This is what makes a freed number reclaimable instead of lost.
      await freeAssistantNumbers(id);
      await deleteAssistant(id);
    } catch {
      // best-effort
    }
    revalidatePath("/dashboard/assistant");
  }
  redirect("/dashboard/assistant");
}

// ── Phone number for an assistant ───────────────────────────────────────────

export async function createNumberForAssistantAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("assistant_id") ?? "");
  const country = String(formData.get("country") ?? "US").trim() || "US";
  if (!assistantId) redirect("/dashboard/assistant");

  const allowance = await canAssignNumber(await currentUserId());
  if (!allowance.ok) {
    redirect(`/dashboard/assistant/${assistantId}?notice=${encodeURIComponent(allowance.reason ?? "")}`);
  }

  try {
    const bought = await buyTwilioNumber({ country });
    await createNumber({ e164: bought.e164, twilioSid: bought.sid, assistantId });
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
}

export async function connectNumberForAssistantAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("assistant_id") ?? "");
  const e164 = String(formData.get("e164") ?? "").trim();
  if (!assistantId) redirect("/dashboard/assistant");
  if (!E164.test(e164)) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("Use E.164 format, e.g. +14155550142")}`,
    );
  }

  const allowance = await canAssignNumber(await currentUserId());
  if (!allowance.ok) {
    redirect(`/dashboard/assistant/${assistantId}?notice=${encodeURIComponent(allowance.reason ?? "")}`);
  }

  try {
    const result = await ensureTwilioNumber(e164);
    await createNumber({ e164, twilioSid: result.sid ?? undefined, assistantId });
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
}

export async function testCallAction(formData: FormData): Promise<void> {
  // Works both from the dedicated Test-call form (assistant_id/to) and from the
  // settings form's "Test call this number" button (id/transfer_to).
  const assistantId = String(formData.get("assistant_id") ?? formData.get("id") ?? "");
  const to = String(formData.get("to") ?? formData.get("transfer_to") ?? "").trim();
  if (!assistantId) redirect("/dashboard/assistant");
  if (!E164.test(to)) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("Enter a number in E.164 format, e.g. +14155550142")}`,
    );
  }

  const number = await getAssistantNumber(assistantId).catch(() => null);
  if (!number || !number.e164) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("Add a phone number to this assistant first.")}`,
    );
  }
  const mediaWsUrl = process.env.MEDIA_WS_URL;
  if (!mediaWsUrl) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("MEDIA_WS_URL is not set on the server.")}`,
    );
  }

  try {
    const businessId = await ensureBusinessId();
    const callId = await createTestCall({
      businessId,
      numberId: number.id,
      e164: number.e164,
    });
    const twiml = buildConnectResponse(mediaWsUrl, {
      callId,
      businessId,
      numberId: number.id,
      from: number.e164,
      to: number.e164,
    });
    const sid = await placeCall(to, number.e164, twiml);
    // Persist the Twilio Call SID so this row reconciles against the call log.
    await setCallTwilioSid(callId, sid).catch(() => {});
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect(`/dashboard/assistant/${assistantId}?calling=1`);
}

export async function unlinkNumberAction(formData: FormData): Promise<void> {
  const numberId = String(formData.get("number_id") ?? "");
  const assistantId = String(formData.get("assistant_id") ?? "");
  if (numberId) {
    try {
      await setNumberAssistant(numberId, null);
    } catch {
      // ignore
    }
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
}

export async function registerCnamAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("id") ?? formData.get("assistant_id") ?? "");
  if (!assistantId) redirect("/dashboard/assistant");

  const assistant = await getAssistant(assistantId).catch(() => null);
  if (!assistant) redirect("/dashboard/assistant");

  const number = await getAssistantNumber(assistantId).catch(() => null);
  const phoneSid = number?.twilio_sid ?? "";
  if (!phoneSid) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("Add a Twilio number to this assistant before registering CNAM.")}`,
    );
  }

  let displayName = "";
  try {
    const res = await registerCnam({ displayName: assistant.name, phoneSid });
    displayName = res.displayName;
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  redirect(`/dashboard/assistant/${assistantId}?cnam=${encodeURIComponent(displayName)}`);
}
