"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "./config";
import { currentUserId } from "@/lib/auth";
import { serviceClient } from "@/lib/dashboard/supabase";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Persist the chosen dashboard language. The cookie drives the dashboard UI
 *  (read by the layout); the account_settings row lets the post-call engine
 *  write AI summaries in the owner's language. The caller triggers a
 *  router.refresh() afterwards so server components pick up the new dictionary. */
export async function setLocaleAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });

  // Best-effort persistence for the summary engine. dashboard_locale arrives in
  // migration 0002; on an un-migrated DB the upsert throws (missing column) and
  // we swallow it - the cookie still localizes the UI.
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
