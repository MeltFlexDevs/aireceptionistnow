"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createNumber,
  deleteNumber,
  listIntegrations,
  updateNumber,
} from "@/lib/dashboard/db";
import {
  buyTwilioNumber,
  ensureTwilioNumber,
  type BoughtNumber,
} from "@/lib/dashboard/twilio";

const E164 = z
  .string()
  .regex(/^\+[1-9]\d{6,15}$/, "Use E.164 format, e.g. +14155550142");

function cleanLabel(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim() || "Work";
}

export async function addNumberAction(formData: FormData): Promise<void> {
  const e164 = String(formData.get("e164") ?? "").trim();
  const parsed = E164.safeParse(e164);
  if (!parsed.success) {
    redirect(
      `/dashboard/numbers?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  // Connect it if the Twilio account already owns it (and point its webhook at
  // us), otherwise provision that exact number. Skipped if Twilio isn't set up.
  let sid: string | null = null;
  try {
    sid = (await ensureTwilioNumber(parsed.data)).sid;
  } catch (err) {
    redirect(
      `/dashboard/numbers?error=${encodeURIComponent(`Couldn't set up ${parsed.data} in Twilio: ${(err as Error).message}. Use "Buy a new number" to get an available one.`)}`,
    );
  }

  let id: string;
  try {
    id = await createNumber({
      label: cleanLabel(formData.get("label")),
      e164: parsed.data,
      twilioSid: sid ?? undefined,
    });
  } catch (err) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/numbers");
  redirect(`/dashboard/numbers/${id}`);
}

export async function buyNumberAction(formData: FormData): Promise<void> {
  const country = String(formData.get("country") ?? "US").trim() || "US";
  const areaCode = String(formData.get("area_code") ?? "").trim();
  const label = cleanLabel(formData.get("buy_label"));

  let bought: BoughtNumber;
  try {
    bought = await buyTwilioNumber({ country, areaCode: areaCode || undefined });
  } catch (err) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent((err as Error).message)}`);
  }

  let id: string;
  try {
    id = await createNumber({ label, e164: bought.e164, twilioSid: bought.sid });
  } catch (err) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/numbers");
  redirect(`/dashboard/numbers/${id}`);
}

export async function updateNumberAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/numbers");

  const e164 = String(formData.get("e164") ?? "").trim();
  const parsed = E164.safeParse(e164);
  if (!parsed.success) {
    redirect(
      `/dashboard/numbers/${id}?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  const notes = String(formData.get("knowledge_notes") ?? "").trim();
  const transferTo = String(formData.get("transfer_to") ?? "").trim();

  const calendars = await listIntegrations().catch(() => []);
  const access: Array<{ integrationId: string; level: string }> = [];
  for (const c of calendars) {
    if (c.type !== "calendar") continue;
    const level = String(formData.get(`cal_access_${c.id}`) ?? "none");
    if (level === "busy" || level === "read" || level === "write") {
      access.push({ integrationId: c.id, level });
    }
  }

  const sttProvider = String(formData.get("stt_provider") ?? "");

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
    await updateNumber(id, {
      label: cleanLabel(formData.get("label")),
      e164: parsed.data,
      twilio_sid: String(formData.get("twilio_sid") ?? "").trim(),
      language: String(formData.get("language") ?? "en").trim() || "en",
      voice_id: String(formData.get("voice_id") ?? "").trim(),
      greeting: String(formData.get("greeting") ?? "").trim(),
      system_prompt: String(formData.get("system_prompt") ?? "").trim(),
      knowledge: notes ? { notes } : {},
      routing,
      enabled: formData.get("enabled") === "on",
    });
  } catch (err) {
    redirect(
      `/dashboard/numbers/${id}?error=${encodeURIComponent((err as Error).message)}`,
    );
  }

  revalidatePath(`/dashboard/numbers/${id}`);
  revalidatePath("/dashboard/numbers");
  redirect(`/dashboard/numbers/${id}?saved=1`);
}

export async function deleteNumberAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await deleteNumber(id);
    } catch {
      // ignore — number may already be gone
    }
    revalidatePath("/dashboard/numbers");
  }
  redirect("/dashboard/numbers");
}
