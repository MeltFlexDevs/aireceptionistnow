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
import { buyTwilioNumber, registerCnam } from "@/lib/dashboard/twilio";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { canAssignNumber } from "@/lib/dashboard/plan";
import {
  assertUnderCallCaps,
  placeAgentCall,
  routeNumberToAgent,
} from "@/lib/call-engine/elevenlabs";

const E164 = /^\+[1-9]\d{6,15}$/;

/**
 * Reject the request unless the caller owns this assistant. Server Actions are
 * public POST endpoints (Next only enforces same-origin, not auth), and the DB
 * helpers filter by id, not owner — without this any visitor could mutate
 * another tenant's assistant by guessing its id. In single-tenant deploys with
 * auth disabled (authConfigured() === false) ownership isn't enforced.
 *
 * Redirects (which throw NEXT_REDIRECT) on failure — call it BEFORE any
 * try/catch so the redirect isn't swallowed.
 */
async function requireAssistantOwner(assistantId: string): Promise<void> {
  if (!authConfigured()) return;
  const ownerId = await currentUserId();
  const assistant = assistantId
    ? await getAssistant(assistantId).catch(() => null)
    : null;
  if (!ownerId || !assistant || (assistant.owner_id && assistant.owner_id !== ownerId)) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent("Not authorized.")}`);
  }
}

/** Allow only public https URLs, blocking internal/link-local hosts, so a stored
 *  CRM webhook URL can't be turned into an SSRF probe against internal infra or
 *  cloud metadata. (Dispatch-time re-validation is still recommended as defense
 *  in depth against DNS rebinding.) */
function isSafeHttpsUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  const h = u.hostname.toLowerCase();
  if (h === "localhost" || h === "0.0.0.0" || h.endsWith(".local")) return false;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|::1|fd|fe80)/.test(h)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
  return true;
}

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
  await requireAssistantOwner(id);

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
    if (!isSafeHttpsUrl(crmUrl)) {
      redirect(
        `/dashboard/assistant/${id}?error=${encodeURIComponent("CRM URL must be a public https:// address.")}`,
      );
    }
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
  if (!id) redirect("/dashboard/assistant");
  await requireAssistantOwner(id);

  try {
    // Unlink this assistant's numbers so they can be reconnected elsewhere, then
    // soft-delete the assistant. Surface any failure instead of silently
    // reporting success on a partial delete.
    await freeAssistantNumbers(id);
    await deleteAssistant(id);
  } catch (err) {
    redirect(`/dashboard/assistant/${id}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath("/dashboard/assistant");
  redirect("/dashboard/assistant");
}

// ── Phone number for an assistant ───────────────────────────────────────────

/**
 * "Get number": provision a fresh number end to end — buy it from Twilio, import
 * it into ElevenLabs, assign the inbound agent, and record it against the
 * assistant. One click, fully serverless (ElevenLabs runs the call). Needs valid
 * Twilio credentials (the status badge shows whether they authenticate).
 */
export async function getAgentNumberAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("assistant_id") ?? "");
  const country = String(formData.get("country") ?? "US").trim() || "US";
  if (!assistantId) redirect("/dashboard/assistant");
  await requireAssistantOwner(assistantId);

  const allowance = await canAssignNumber(await currentUserId());
  if (!allowance.ok) {
    redirect(`/dashboard/assistant/${assistantId}?notice=${encodeURIComponent(allowance.reason ?? "")}`);
  }

  try {
    // Buy without our webhook — the ElevenLabs import takes over routing.
    const bought = await buyTwilioNumber({ country }, { configureWebhook: false });
    await routeNumberToAgent(bought.e164); // import into ElevenLabs + assign agent
    await createNumber({ e164: bought.e164, twilioSid: bought.sid, assistantId });
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
}

/**
 * Connect a Twilio number you already own to this assistant: import it into
 * ElevenLabs (if not already there) and assign the inbound agent, then record it.
 */
export async function connectAgentNumberAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("assistant_id") ?? "");
  const e164 = String(formData.get("e164") ?? "").trim();
  if (!assistantId) redirect("/dashboard/assistant");
  await requireAssistantOwner(assistantId);
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
  await requireAssistantOwner(assistantId);
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
  if (!assistantId) redirect("/dashboard/assistant");
  await requireAssistantOwner(assistantId);

  // The number must actually belong to this assistant — otherwise a caller could
  // unlink an arbitrary number by id.
  const number = await getAssistantNumber(assistantId).catch(() => null);
  if (!number || !numberId || number.id !== numberId) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("That number isn't linked to this assistant.")}`,
    );
  }

  try {
    await setNumberAssistant(numberId, null);
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
}

export async function registerCnamAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("id") ?? formData.get("assistant_id") ?? "");
  if (!assistantId) redirect("/dashboard/assistant");
  await requireAssistantOwner(assistantId);

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
