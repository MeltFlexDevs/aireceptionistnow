import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { getAccountSettings, saveAccountProfile, saveNotificationSettings } from "@/lib/dashboard/account";
import {
  listOrganizationAssistants,
  listOrganizations,
  updateOrganization,
} from "@/lib/dashboard/organizations";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { normalizeTimezone, supportedTimezones } from "@/lib/dashboard/timezones";
import { mobileRoute, mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Everything the Settings screen renders and edits, plus the timezone list. */
export const GET = mobileRoute(async (userId) => {
  const [account, plan] = await Promise.all([
    getAccountSettings(userId),
    getPlanContextCached(userId).catch(() => null),
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
      smsNumber: account.notify_sms_number,
    },
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
          numbersIncluded: plan.limits.phoneNumbers,
          assistantsUsed: plan.usage.assistants,
          assistantsIncluded: plan.limits.assistants,
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
  const userId = await mobileUserId(req);
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
    const company = has("company") ? str("company") : (current?.company ?? "");

    try {
      await saveAccountProfile(userId, {
        full_name: has("fullName") ? str("fullName") : (current?.full_name ?? ""),
        company,
        role: has("role") ? str("role") : (current?.role ?? ""),
        phone: has("phone") ? str("phone") : (current?.phone ?? ""),
        timezone: has("timezone") ? timezone : (current?.timezone ?? ""),
        about: has("about") ? str("about") : (current?.about ?? ""),
        share_with_assistants: has("shareWithAssistants")
          ? Boolean(body.shareWithAssistants)
          : (current?.share_with_assistants ?? true),
      });
    } catch (err) {
      console.error("[mobile:settings-profile]", err);
      return Response.json({ error: "Could not save." }, { status: 500 });
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
