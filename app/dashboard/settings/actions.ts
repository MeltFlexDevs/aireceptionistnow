"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { saveAccountProfile, saveNotificationSettings } from "@/lib/dashboard/account";
import { normalizeTimezone } from "@/lib/dashboard/timezones";

function done(tab: string): never {
  revalidatePath("/dashboard/settings");
  redirect(`/dashboard/settings?saved=${tab}`);
}

function fail(message: string): never {
  redirect(`/dashboard/settings?error=${encodeURIComponent(message)}`);
}

function timezoneOrFail(raw: string): string {
  const input = raw.trim();
  if (!input) return "";
  const zone = normalizeTimezone(input);
  if (!zone) {
    fail(
      `"${input}" isn't a time zone we recognise. Pick one from the list - it should look like Europe/Bratislava.`,
    );
  }
  return zone;
}

export async function saveAccountAction(formData: FormData): Promise<void> {
  const userId = await currentUserId();
  if (!userId) fail("Sign in to save your account.");

  try {
    await saveAccountProfile(userId, {
      full_name: String(formData.get("full_name") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      role: String(formData.get("role") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      timezone: timezoneOrFail(String(formData.get("timezone") ?? "")),
      about: String(formData.get("about") ?? "").trim(),
      share_with_assistants: formData.get("share_with_assistants") === "on",
    });
  } catch (err) {
    fail((err as Error).message);
  }
  done("account");
}

export async function saveNotificationsAction(formData: FormData): Promise<void> {
  const userId = await currentUserId();
  if (!userId) fail("Sign in to save your settings.");

  try {
    await saveNotificationSettings(userId, {
      notify_email: formData.get("notify_email") === "on",
      notify_sms: formData.get("notify_sms") === "on",
    });
  } catch (err) {
    fail((err as Error).message);
  }
  done("notifications");
}
