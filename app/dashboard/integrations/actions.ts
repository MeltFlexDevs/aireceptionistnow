"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { createCrmIntegration, deleteIntegration } from "@/lib/dashboard/db";
import { isSafeHttpsUrl } from "@/lib/net/safe-url";

/**
 * CRM push is unshipped - the blurred "Developer" card that used to drive these
 * is gone from every surface. The actions stay in code so the capability is not
 * silently lost, with their redirect targets repointed at Appointments, which
 * now owns everything the integrations page used to.
 *
 * connectCalendarAction is NOT preserved: every provider is OAuth with zero
 * credential fields, so the form-based connect path was unreachable.
 */

export async function createCrmAction(formData: FormData): Promise<void> {
  const name = String(formData.get("crm_name") ?? "").trim();
  const url = String(formData.get("crm_url") ?? "").trim();
  const secret = String(formData.get("crm_secret") ?? "").trim();

  const fail = (msg: string): never =>
    redirect(`/dashboard/calendar?error=${encodeURIComponent(msg)}`);

  if (!name) fail("Give the CRM push a name so you can tell it apart.");
  if (!isSafeHttpsUrl(url)) fail("CRM URL must be a public https:// address.");

  try {
    await createCrmIntegration(
      { name, url, ...(secret ? { secret } : {}) },
      (await currentUserId()) ?? undefined,
    );
  } catch (err) {
    fail((err as Error).message);
  }

  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/assistant", "layout");
  redirect("/dashboard/calendar?connected=1");
}

export async function deleteCrmAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await deleteIntegration(id, (await currentUserId()) ?? undefined);
    } catch {
      // already gone
    }
    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard/assistant", "layout");
  }
  redirect("/dashboard/calendar");
}
