"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createNumber,
  deleteNumber,
  setNumberAssistant,
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
    id = await createNumber({ e164: parsed.data, twilioSid: sid ?? undefined });
  } catch (err) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/numbers");
  redirect(`/dashboard/numbers/${id}`);
}

export async function buyNumberAction(formData: FormData): Promise<void> {
  const country = String(formData.get("country") ?? "US").trim() || "US";
  const areaCode = String(formData.get("area_code") ?? "").trim();

  let bought: BoughtNumber;
  try {
    bought = await buyTwilioNumber({ country, areaCode: areaCode || undefined });
  } catch (err) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent((err as Error).message)}`);
  }

  let id: string;
  try {
    id = await createNumber({ e164: bought.e164, twilioSid: bought.sid });
  } catch (err) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/numbers");
  redirect(`/dashboard/numbers/${id}`);
}

export async function setAssistantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const assistantId = String(formData.get("assistant_id") ?? "");
  if (id) {
    try {
      await setNumberAssistant(id, assistantId || null);
    } catch {
      // ignore
    }
    revalidatePath(`/dashboard/numbers/${id}`);
  }
  redirect(`/dashboard/numbers/${id}?saved=1`);
}

export async function updateNumberAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/numbers");

  try {
    await updateNumber(id, { enabled: formData.get("enabled") === "on" });
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
      // ignore - number may already be gone
    }
    revalidatePath("/dashboard/numbers");
  }
  redirect("/dashboard/numbers");
}
