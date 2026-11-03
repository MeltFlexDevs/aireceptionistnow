"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { currentUserId } from "@/lib/auth";
import { getAccountSettings, saveAccountProfile, saveNotificationSettings } from "@/lib/dashboard/account";
import {
  listOrganizationAssistants,
  listOrganizations,
  updateOrganization,
} from "@/lib/dashboard/organizations";
import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { normalizeTimezone } from "@/lib/dashboard/timezones";
import { dashboardCacheTag, timezoneChanged } from "@/lib/dashboard/cache-tags";
import { phoneToSave } from "@/lib/phone";
import { getDictionary } from "@/lib/i18n/server";
import { ok, fail, type ActionState } from "@/lib/dashboard/action-state";
import { after } from "next/server";

export async function saveAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const s = (await getDictionary()).settings;
  const userId = await currentUserId();
  if (!userId) return fail(s.signInToSave);

  // Validate the time zone BEFORE building the payload. This used to throw
  // mid-expression via a redirect, which is not an option now that the action
  // returns state instead.
  const rawZone = String(formData.get("timezone") ?? "").trim();
  let timezone = "";
  if (rawZone) {
    const zone = normalizeTimezone(rawZone);
    if (!zone) return fail(s.badTimezone, { timezone: s.badTimezone });
    timezone = zone;
  }

  // The profile phone can become the SMS alert number, and an SMS cannot reach
  // a number without its country code. Empty is fine: the field is optional.
  // Same rule as app/api/mobile/settings/route.ts: only a changed phone is
  // checked, so a number saved earlier as typed does not block the rest.
  const current = await getAccountSettings(userId).catch(() => null);
  const phone = phoneToSave(String(formData.get("phone") ?? ""), current?.phone ?? "");
  if (phone === null) {
    const badPhone = (await getDictionary()).assistants.badPhoneFormat;
    return fail(badPhone, { phone: badPhone });
  }

  const company = String(formData.get("company") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();

  try {
    await saveAccountProfile(userId, {
      full_name: fullName,
      company,
      role: String(formData.get("role") ?? "").trim(),
      phone,
      timezone,
      about: String(formData.get("about") ?? "").trim(),
      share_with_assistants: formData.get("share_with_assistants") === "on",
    });
  } catch {
    return fail(s.saveFailed);
  }

  // Mobile caches overview and analytics under the phone's zone, not the account
  // zone, so without this a new account zone waits out the 30 s TTL there. Only
  // this user's entries, and only when the zone changed.
  if (timezoneChanged(current, timezone)) revalidateTag(dashboardCacheTag(userId), { expire: 0 });
  // The sidebar name comes from the dashboard layout; refresh it only on a rename.
  if (fullName !== (current?.full_name ?? "")) revalidatePath("/dashboard", "layout");

  // The business row keeps its own name, so without this a rename here changed
  // nothing the receptionist actually says. Only unambiguous with exactly one
  // business; with more, Knowledge owns the per-business name.
  const orgs = await listOrganizations(userId).catch(() => []);
  if (orgs.length === 1 && company && company !== orgs[0].name) {
    const orgId = orgs[0].id;
    try {
      await updateOrganization(orgId, { name: company, description: orgs[0].description });
      after(async () => {
        const assistants = await listOrganizationAssistants(orgId).catch(() => []);
        await Promise.all(
          assistants.map((a) =>
            syncAssistantAgent(a.id).catch((err) =>
              console.error("[settings] agent re-sync after rename failed", a.id, err),
            ),
          ),
        );
      });
      revalidatePath("/dashboard/knowledge");
    } catch (err) {
      // The account itself saved; report the partial outcome rather than
      // claiming a clean success.
      console.error("[settings] business rename failed", err);
      return fail(s.saveFailed);
    }
  }

  revalidatePath("/dashboard/settings");
  return ok();
}

export async function saveNotificationsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const s = (await getDictionary()).settings;
  const userId = await currentUserId();
  if (!userId) return fail(s.signInToSave);

  try {
    await saveNotificationSettings(userId, {
      notify_email: formData.get("notify_email") === "on",
      notify_sms: formData.get("notify_sms") === "on",
    });
  } catch {
    return fail(s.saveFailed);
  }

  revalidatePath("/dashboard/settings");
  return ok();
}
