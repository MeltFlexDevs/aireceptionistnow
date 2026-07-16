"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "./config";
import { currentUserId } from "@/lib/auth";
import { serviceClient } from "@/lib/dashboard/supabase";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocaleAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });

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
