"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "./config";
import { currentUserId } from "@/lib/auth";
import { serviceClient } from "@/lib/dashboard/supabase";

const ONE_YEAR = 60 * 60 * 24 * 365;

// The call engine reads account_settings.dashboard_locale as the owner's
// language, so the DB write must happen on every switch - but never on the
// critical path of the UI update.
async function persistToAccount(locale: string): Promise<void> {
  try {
    const userId = await currentUserId();
    if (userId) {
      await serviceClient().from("account_settings").upsert(
        { user_id: userId, dashboard_locale: locale, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    }
  } catch {
    // no-op: locale still lives in the cookie for the dashboard UI.
  }
}

// Fast path: the client already wrote the (non-httpOnly) cookie itself and
// does NOT await this, so the upsert is off the UI's critical path. The write
// stays inline (not after()) on purpose: the client dispatches server actions
// one at a time, which makes rapid switches persist in click order.
export async function persistLocaleAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  await persistToAccount(locale);
}

// Fallback path, used only when the client-side cookie write didn't stick:
// sets the cookie server-side (which also re-renders the page in the same
// roundtrip).
export async function setLocaleAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
  await persistToAccount(locale);
}
