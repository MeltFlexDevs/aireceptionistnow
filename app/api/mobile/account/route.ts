import { getAccountSettings } from "@/lib/dashboard/account";
import { getOwnedNumbers } from "@/lib/dashboard/db";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The Settings tab: profile, plan and the numbers the receptionist answers. */
export const GET = mobileRoute(async (userId) => {
  const [settings, plan, numbers] = await Promise.all([
    getAccountSettings(userId),
    getPlanContextCached(userId).catch(() => null),
    getOwnedNumbers(userId).catch(() => []),
  ]);

  return {
    profile: {
      fullName: settings.full_name,
      company: settings.company,
      role: settings.role,
      phone: settings.phone,
      timezone: settings.timezone,
    },
    notifications: {
      email: settings.notify_email,
      emailAddress: settings.notify_email_address,
      sms: settings.notify_sms,
      smsNumber: settings.notify_sms_number,
    },
    plan: plan
      ? {
          id: plan.planId,
          name: plan.planName,
          active: plan.active,
          // See the overview route: Infinity serializes to null, so an uncapped
          // tier ships as 0 and the app reads 0 as "no cap".
          minutesIncluded: Number.isFinite(plan.limits.minutesIncluded)
            ? plan.limits.minutesIncluded
            : 0,
          numbersUsed: plan.usage.numbers,
          assistantsUsed: plan.usage.assistants,
        }
      : null,
    numbers: numbers.map((n) => ({ id: n.id, e164: n.e164 })),
  };
}, "account");
