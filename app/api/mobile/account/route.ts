import { getAccountSettings } from "@/lib/dashboard/account";
import { deleteAccountData } from "@/lib/dashboard/account-deletion";
import { getOwnedNumbers } from "@/lib/dashboard/db";
import { getPlanContextCached } from "@/lib/dashboard/plan";
import { mobileAuth, mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// See the overview route: Infinity serializes to null, so an uncapped limit
// ships as 0 and the app reads 0 as "no cap".
function cap(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

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
          minutesIncluded: cap(plan.limits.minutesIncluded),
          numbersIncluded: cap(plan.limits.phoneNumbers),
          numbersUsed: plan.usage.numbers,
          assistantsUsed: plan.usage.assistants,
          // The plan card's limit rows. `assistants` is unlimited on every
          // tier and is deliberately left out.
          limits: {
            phoneNumbers: cap(plan.limits.phoneNumbers),
            concurrentCalls: cap(plan.limits.concurrentCalls),
            minutesIncluded: cap(plan.limits.minutesIncluded),
            contacts: cap(plan.limits.contacts),
            users: cap(plan.limits.users),
          },
        }
      : null,
    numbers: numbers.map((n) => ({ id: n.id, e164: n.e164 })),
  };
}, "account");

/**
 * Delete the account: `{ confirm: 'DELETE' }` -> `{ ok, storeSubscription, warnings }`.
 *
 * Not on `mobileRoute` because the typed confirmation deserves a 400 and the
 * failure copy has to say the one thing that matters: nothing was charged.
 * A 401 on a retry means the previous attempt already got through - the app
 * treats it as done. `storeSubscription` names a store subscription we could
 * not cancel from here; the app sends the user to that store.
 */
export async function DELETE(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "account-delete");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let confirm = "";
  try {
    const body = (await req.json()) as { confirm?: unknown };
    if (typeof body.confirm === "string") confirm = body.confirm.trim();
  } catch {
    // Falls through to the 400.
  }
  if (confirm !== "DELETE") {
    return Response.json({ error: "Type DELETE to confirm." }, { status: 400 });
  }

  try {
    const { storeSubscription, warnings } = await deleteAccountData(userId);
    return Response.json({ ok: true, storeSubscription, warnings });
  } catch (err) {
    // The message may name a Stripe object; it never names the user.
    console.error("[mobile:account-delete] failed", err instanceof Error ? err.message : err);
    // 503: the app shows a 5xx message only on a 503 (app lib/api.ts), and it
    // reads a 503 like a 500 here: the account still exists, so Delete can run again.
    return Response.json(
      { error: "Your account could not be fully deleted. Nothing was charged. Try again to finish, or contact support." },
      { status: 503 },
    );
  }
}
