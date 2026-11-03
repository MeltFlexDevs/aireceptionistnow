import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";

import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { getAccountSettings, saveAccountProfile, saveNotificationSettings } from "@/lib/dashboard/account";
import { dashboardCacheTag, timezoneChanged } from "@/lib/dashboard/cache-tags";
import {
  listOrganizationAssistants,
  listOrganizations,
  updateOrganization,
} from "@/lib/dashboard/organizations";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { serviceClient } from "@/lib/dashboard/supabase";
import { normalizeTimezone, supportedTimezones } from "@/lib/dashboard/timezones";
import { mobileAuth, mobileRoute } from "@/lib/mobile/auth";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Everything the Settings screen renders and edits, plus the timezone list.
 *
 * `smsNumber` falls back to the profile phone - the number PATCH copies into
 * it on first save - because the app keeps the SMS switch disabled while it is
 * empty. `businessCount` is there because a company rename only renames the
 * business when there is exactly one.
 */
export const GET = mobileRoute(async (userId) => {
  const [account, plan, orgs] = await Promise.all([
    getAccountSettings(userId),
    getPlanContextCached(userId).catch(() => null),
    listOrganizations(userId).catch(() => []),
  ]);

  return {
    profile: {
      fullName: account.full_name,
      company: account.company,
      role: account.role,
      phone: account.phone,
      timezone: account.timezone,
      about: account.about,
      shareWithAssistants: account.share_with_assistants,
    },
    notifications: {
      email: account.notify_email,
      emailAddress: account.notify_email_address,
      sms: account.notify_sms,
      smsNumber: (account.notify_sms_number ?? "").trim() || (account.phone ?? "").trim(),
    },
    businessCount: orgs.length,
    plan: plan
      ? {
          id: plan.planId,
          name: plan.planName,
          active: plan.active,
          // Infinity serialises to null, so an uncapped tier ships as 0 and the
          // app reads 0 as "no cap". Same contract as /api/mobile/overview.
          minutesIncluded: Number.isFinite(plan.limits.minutesIncluded)
            ? plan.limits.minutesIncluded
            : 0,
          numbersUsed: plan.usage.numbers,
          numbersIncluded: Number.isFinite(plan.limits.phoneNumbers) ? plan.limits.phoneNumbers : 0,
          assistantsUsed: plan.usage.assistants,
          // Unlimited on every tier today, so this is the 0 = "no cap" case.
          assistantsIncluded: Number.isFinite(plan.limits.assistants) ? plan.limits.assistants : 0,
        }
      : null,
    timezones: supportedTimezones(),
  };
}, "settings");

/**
 * Save the profile, the alerts, or both. Mirrors `saveAccountAction` including
 * the business rename: the organization row keeps its own name, so without that
 * step renaming the company here changes nothing the receptionist says out loud.
 */
export async function PATCH(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "settings-patch");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const str = (key: string): string => String(body[key] ?? "").trim();
  const has = (key: string): boolean => Object.hasOwn(body, key);

  // Notifications-only submits skip the profile write entirely, so a toggle can
  // never blank a field the toggle screen does not carry.
  if (has("notifyEmail") || has("notifySms")) {
    const current = await getAccountSettings(userId).catch(() => null);
    try {
      await saveNotificationSettings(userId, {
        notify_email: has("notifyEmail")
          ? Boolean(body.notifyEmail)
          : (current?.notify_email ?? true),
        notify_sms: has("notifySms") ? Boolean(body.notifySms) : (current?.notify_sms ?? false),
      });
    } catch (err) {
      console.error("[mobile:settings-alerts]", err);
      return Response.json({ error: "Could not save." }, { status: 500 });
    }
  }

  if (has("fullName") || has("company") || has("role") || has("phone") || has("timezone") || has("about")) {
    // Validate the zone before anything is written: a rejected zone must not
    // half-save the rest of the profile.
    let timezone = "";
    const rawZone = str("timezone");
    if (rawZone) {
      const zone = normalizeTimezone(rawZone);
      if (!zone) return Response.json({ error: "That time zone is not recognised." }, { status: 400 });
      timezone = zone;
    }

    const current = await getAccountSettings(userId).catch(() => null);

    // Same rule as the funnel's alert number: this phone can become the SMS
    // alert number below, and an SMS cannot go to "(555) 123-4567". Only a
    // changed phone is checked: the profile screen sends it on every save, and
    // a number saved on the web as typed must not block saving the rest.
    const digits = (v: string) => v.replace(/[\s().-]/g, "");
    const phone = has("phone") ? digits(str("phone")) : "";
    const phoneChanged = phone !== digits(current?.phone ?? "");
    if (phone && phoneChanged && !normalizePhone(phone)) {
      // The app shows `error` as is, so no US-only example here.
      return Response.json(
        { error: "Enter your phone number with its country code, starting with +.", code: "invalid_phone" },
        { status: 400 },
      );
    }
    const company = has("company") ? str("company") : (current?.company ?? "");
    const savedZone = has("timezone") ? timezone : (current?.timezone ?? "");

    try {
      await saveAccountProfile(userId, {
        full_name: has("fullName") ? str("fullName") : (current?.full_name ?? ""),
        company,
        role: has("role") ? str("role") : (current?.role ?? ""),
        phone: has("phone") && phoneChanged ? phone : (current?.phone ?? ""),
        timezone: savedZone,
        about: has("about") ? str("about") : (current?.about ?? ""),
        share_with_assistants: has("shareWithAssistants")
          ? Boolean(body.shareWithAssistants)
          : (current?.share_with_assistants ?? true),
      });
    } catch (err) {
      console.error("[mobile:settings-profile]", err);
      return Response.json({ error: "Could not save." }, { status: 500 });
    }

    // Same as saveAccountAction: the app caches overview and analytics under the
    // phone's zone, so a new account zone would otherwise wait out the 30 s TTL.
    if (timezoneChanged(current, savedZone)) revalidateTag(dashboardCacheTag(userId), { expire: 0 });

    // A first phone number also becomes the SMS alert number when none is set,
    // or the SMS switch stays disabled for want of a number (ALERT-2). An alert
    // number the owner chose is never overwritten.
    if (phone && normalizePhone(phone) && current && !(current.notify_sms_number ?? "").trim()) {
      const { error } = await serviceClient()
        .from("account_settings")
        .update({ notify_sms_number: phone, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      // The profile itself saved; a missed default is not worth failing it.
      if (error) console.error("[mobile:settings] default SMS number failed", error.message);
    }

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
                console.error("[mobile:settings] agent re-sync after rename failed", a.id, err),
              ),
            ),
          );
        });
        revalidatePath("/dashboard/knowledge");
      } catch (err) {
        // The account itself saved - report the partial outcome rather than
        // claiming a clean success.
        console.error("[mobile:settings] business rename failed", err);
        return Response.json(
          { ok: true, warning: "Saved, but the business name did not update." },
          { status: 200 },
        );
      }
    }
  }

  revalidatePath("/dashboard/settings");
  return Response.json({ ok: true, warning: null });
}
