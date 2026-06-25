"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildConnectResponse } from "@/lib/call-engine/pickup";
import {
  createAssistant,
  createNumber,
  createTestCall,
  setCallTwilioSid,
  deleteAssistant,
  ensureBusinessId,
  getAssistant,
  getAssistantNumber,
  getAssistantNumbers,
  listIntegrations,
  setNumberAssistant,
  softDeleteNumber,
  updateAssistant,
  updateAssistantKnowledge,
} from "@/lib/dashboard/db";
import { fetchWebsiteMarkdown } from "@/lib/knowledge/website";
import { parsePdfMarkdown } from "@/lib/knowledge/pdf";
import {
  addSource,
  readKnowledge,
  removeSource,
  type KnowledgeSource,
} from "@/lib/knowledge/sources";
import {
  buyTwilioNumber,
  ensureTwilioNumber,
  placeCall,
  registerCnam,
  releaseTwilioNumber,
} from "@/lib/dashboard/twilio";
import { currentUserId } from "@/lib/auth";

const E164 = /^\+[1-9]\d{6,15}$/;

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

  // Generate the assistant's phone number at creation (best-effort - trial or
  // regulated countries may fail; the assistant is still created and a number
  // can be added from its settings).
  try {
    const bought = await buyTwilioNumber({ country });
    await createNumber({ e164: bought.e164, twilioSid: bought.sid, assistantId: id });
  } catch (err) {
    console.error("[assistant] number provisioning", err);
  }

  revalidatePath("/dashboard/assistant");
  redirect(`/dashboard/assistant/${id}`);
}

export async function updateAssistantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");

  const notes = String(formData.get("knowledge_notes") ?? "").trim();
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

  // Preserve any ingested knowledge sources; only the notes field is edited here.
  const existing = await getAssistant(id).catch(() => null);
  const knowledge = readKnowledge(existing?.knowledge);
  knowledge.notes = notes;

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
      // Release each linked number from Twilio, then soft-delete it and the assistant.
      const numbers = await getAssistantNumbers(id);
      for (const n of numbers) {
        if (n.twilio_sid) {
          try {
            await releaseTwilioNumber(n.twilio_sid);
          } catch {
            // already released / not permitted - ignore
          }
        }
        await softDeleteNumber(n.id).catch(() => {});
      }
      await deleteAssistant(id);
    } catch {
      // best-effort
    }
    revalidatePath("/dashboard/assistant");
  }
  redirect("/dashboard/assistant");
}

// ── Knowledge sources (website + PDF → markdown) ────────────────────────────

/** Confirm the signed-in user owns this assistant (when auth is configured). */
async function ownedAssistantOrRedirect(id: string) {
  const assistant = await getAssistant(id).catch(() => null);
  if (!assistant) redirect("/dashboard/assistant");
  const ownerId = await currentUserId();
  if (ownerId && assistant.owner_id && assistant.owner_id !== ownerId) {
    redirect("/dashboard/assistant");
  }
  return assistant;
}

function knowledgeError(id: string, message: string): never {
  redirect(`/dashboard/assistant/${id}?error=${encodeURIComponent(message)}`);
}

export async function addWebsiteKnowledgeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");
  const url = String(formData.get("url") ?? "").trim();
  if (!url) knowledgeError(id, "Enter a URL to import.");

  const assistant = await ownedAssistantOrRedirect(id);

  let source: KnowledgeSource;
  try {
    const result = await fetchWebsiteMarkdown(url);
    source = {
      id: randomUUID(),
      kind: "website",
      title: result.title,
      url,
      markdown: result.markdown,
      charCount: result.charCount,
      addedAt: new Date().toISOString(),
    };
  } catch (err) {
    knowledgeError(id, (err as Error).message);
  }

  const next = addSource(readKnowledge(assistant.knowledge), source);
  await updateAssistantKnowledge(id, { ...next }).catch((err) =>
    knowledgeError(id, (err as Error).message),
  );

  revalidatePath(`/dashboard/assistant/${id}`);
  redirect(`/dashboard/assistant/${id}?saved=1`);
}

export async function addPdfKnowledgeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");

  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) knowledgeError(id, "Choose a PDF file to upload.");
  if (file.type && file.type !== "application/pdf") knowledgeError(id, "That file isn't a PDF.");

  const assistant = await ownedAssistantOrRedirect(id);

  let source: KnowledgeSource;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await parsePdfMarkdown(bytes);
    source = {
      id: randomUUID(),
      kind: "pdf",
      title: file.name.replace(/\.pdf$/i, "") || "Document",
      markdown: result.markdown,
      charCount: result.charCount,
      addedAt: new Date().toISOString(),
    };
  } catch (err) {
    knowledgeError(id, (err as Error).message);
  }

  const next = addSource(readKnowledge(assistant.knowledge), source);
  await updateAssistantKnowledge(id, { ...next }).catch((err) =>
    knowledgeError(id, (err as Error).message),
  );

  revalidatePath(`/dashboard/assistant/${id}`);
  redirect(`/dashboard/assistant/${id}?saved=1`);
}

export async function removeKnowledgeSourceAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sourceId = String(formData.get("source_id") ?? "");
  if (!id) redirect("/dashboard/assistant");
  if (!sourceId) redirect(`/dashboard/assistant/${id}`);

  const assistant = await ownedAssistantOrRedirect(id);
  const next = removeSource(readKnowledge(assistant.knowledge), sourceId);
  await updateAssistantKnowledge(id, { ...next }).catch(() => {});

  revalidatePath(`/dashboard/assistant/${id}`);
  redirect(`/dashboard/assistant/${id}?saved=1`);
}

// ── Phone number for an assistant ───────────────────────────────────────────

export async function createNumberForAssistantAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("assistant_id") ?? "");
  const country = String(formData.get("country") ?? "US").trim() || "US";
  if (!assistantId) redirect("/dashboard/assistant");
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
