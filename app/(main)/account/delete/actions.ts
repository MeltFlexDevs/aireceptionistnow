"use server";

import { redirect } from "next/navigation";

import { currentUserId } from "@/lib/auth";
import { deleteAccountData } from "@/lib/dashboard/account-deletion";
import { createClient } from "@/lib/supabase/server";

/**
 * The web deletion form's action: delete the signed-in account, sign the
 * browser out, land back on the page with a result.
 *
 * Plain <form action> rather than useActionState: a full-page form is the one
 * kind that needs no client JS, which matters for a page an in-app browser and
 * a Play reviewer both open cold. The result travels in the query string.
 */
export async function deleteOwnAccountAction(formData: FormData): Promise<void> {
  const app = formData.get("app") === "1";
  const back = (query: string) => `/account/delete?${query}${app ? "&app=1" : ""}`;

  const userId = await currentUserId();
  if (!userId) redirect(back("error=signed-out"));

  if (String(formData.get("confirm") ?? "").trim() !== "DELETE") {
    redirect(back("error=confirm"));
  }

  // `redirect` throws, so the outcome is decided first and redirected on
  // outside any try/catch that could swallow it.
  let outcome: { store: string | null } | { failed: true };
  try {
    const { storeSubscription } = await deleteAccountData(userId);
    outcome = { store: storeSubscription };
  } catch (err) {
    console.error("[account-delete] failed", err instanceof Error ? err.message : err);
    outcome = { failed: true };
  }
  if ("failed" in outcome) redirect(back("error=failed"));

  // The account is gone; drop the browser's session so the page does not
  // keep rendering as signed in. GoTrue answers 401/404 for a deleted user,
  // which signOut treats as "already out" and clears the cookies anyway.
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Cookies may already be gone; nothing to do.
  }

  redirect(back(`done=1${outcome.store ? `&store=${outcome.store}` : ""}`));
}
