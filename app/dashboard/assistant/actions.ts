"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAssistant,
  createNumber,
  deleteAssistant,
  getAssistantNumbers,
  listIntegrations,
  setNumberAssistant,
  softDeleteNumber,
  updateAssistant,
} from "@/lib/dashboard/db";
import {
  buyTwilioNumber,
  ensureTwilioNumber,
  releaseTwilioNumber,
} from "@/lib/dashboard/twilio";

const E164 = /^\+[1-9]\d{6,15}$/;

export async function createAssistantAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim() || "My assistant";
  const country = String(formData.get("country") ?? "US").trim() || "US";

  let id: string;
  try {
    id = await createAssistant(name);
  } catch (err) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent((err as Error).message)}`);
  }

  // Generate the assistant's phone number at creation (best-effort — trial or
  // regulated countries may fail; the assistant is still created and a number
  // can be added from its settings).
  try {
    const bought = await buyTwilioNumber({ country });
    await createNumber({ label: name, e164: bought.e164, twilioSid: bought.sid, assistantId: id });
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

  try {
    await updateAssistant(id, {
      name: String(formData.get("name") ?? "").trim() || "My assistant",
      greeting: String(formData.get("greeting") ?? "").trim(),
      system_prompt: String(formData.get("system_prompt") ?? "").trim(),
      voice_id: String(formData.get("voice_id") ?? "").trim(),
      language: String(formData.get("language") ?? "en").trim() || "en",
      knowledge: notes ? { notes } : {},
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
            // already released / not permitted — ignore
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

// ── Phone number for an assistant ───────────────────────────────────────────

export async function createNumberForAssistantAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("assistant_id") ?? "");
  const country = String(formData.get("country") ?? "US").trim() || "US";
  if (!assistantId) redirect("/dashboard/assistant");
  try {
    const bought = await buyTwilioNumber({ country });
    await createNumber({ label: "Assistant line", e164: bought.e164, twilioSid: bought.sid, assistantId });
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
    await createNumber({ label: "Assistant line", e164, twilioSid: result.sid ?? undefined, assistantId });
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
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
