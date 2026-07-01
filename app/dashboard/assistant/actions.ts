"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAssistant,
  createNumber,
  deleteAssistant,
  freeAssistantNumbers,
  getAssistant,
  getAssistantNumber,
  listIntegrations,
  setNumberAssistant,
  updateAssistant,
} from "@/lib/dashboard/db";
import { readKnowledge } from "@/lib/knowledge/sources";
import { registerCnam } from "@/lib/dashboard/twilio";
import { currentUserId } from "@/lib/auth";
import { canAssignNumber } from "@/lib/dashboard/plan";
import {
  assertUnderCallCaps,
  placeAgentCall,
  routeNumberToAgent,
} from "@/lib/call-engine/elevenlabs";

const E164 = /^\+[1-9]\d{6,15}$/;

export async function createAssistantAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim() || "My assistant";

  const ownerId = await currentUserId();
  let id: string;
  try {
    id = await createAssistant(name, ownerId ?? undefined);
  } catch (err) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent((err as Error).message)}`);
  }

  // Numbers are attached from the assistant's settings (Connect number → assigns
  // the ElevenLabs inbound agent). No auto-provisioning — the number lives in
  // ElevenLabs, not on a Twilio pool we manage.
  revalidatePath("/dashboard/assistant");
  redirect(`/dashboard/assistant/${id}`);
}

export async function updateAssistantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");

  const transferTo = String(formData.get("transfer_to") ?? "").trim();

  const calendars = await listIntegrations().catch(() => []);
  const access: Array<{ integrationId: string; level: string }> = [];
  for (const c of calendars) {
    if (c.type !== "calendar") continue;
    // Two capabilities: read (availability only) or write (also book). Legacy
    // "busy" maps to read.
    const raw = String(formData.get(`cal_access_${c.id}`) ?? "none");
    const level = raw === "busy" ? "read" : raw;
    if (level === "read" || level === "write") {
      access.push({ integrationId: c.id, level });
    }
  }

  const routing: Record<string, unknown> = {};
  if (transferTo) {
    routing.transferTo = transferTo;
    routing.smsAlerts = formData.get("sms_alerts") === "on";
  }
  if (access.length) routing.calendar = { access };

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

/**
 * Connect an ElevenLabs-imported number to this assistant: assign the ElevenLabs
 * inbound agent so calls answer via ElevenLabs (no media server, no Twilio
 * webhook), then record the number against the assistant. The number must
 * already be imported under Phone Numbers in the ElevenLabs dashboard.
 */
export async function connectAgentNumberAction(formData: FormData): Promise<void> {
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
    await routeNumberToAgent(e164); // ElevenLabs: assign inbound agent (no Twilio)
    await createNumber({ e164, assistantId }); // DB only
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
}

export async function testCallAction(formData: FormData): Promise<void> {
  // Works both from the dedicated Test-call form (assistant_id/to) and from the
  // settings form's "Test call this number" button (id/transfer_to). The
  // ElevenLabs agent places an outbound call to `to` — the whole runtime (voice
  // + brain) is ElevenLabs; no media server involved.
  const assistantId = String(formData.get("assistant_id") ?? formData.get("id") ?? "");
  const to = String(formData.get("to") ?? formData.get("transfer_to") ?? "").trim();
  if (!assistantId) redirect("/dashboard/assistant");
  if (!E164.test(to)) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("Enter a number in E.164 format, e.g. +14155550142")}`,
    );
  }

  try {
    await assertUnderCallCaps();
    await placeAgentCall(to);
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
