"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { createCrmIntegration, deleteIntegration, upsertCalendarIntegration } from "@/lib/dashboard/db";
import { isSafeHttpsUrl } from "@/lib/net/safe-url";
import { CALENDAR_PROVIDERS } from "./providers";

export async function connectCalendarAction(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider") ?? "");
  const def = CALENDAR_PROVIDERS.find((p) => p.id === provider);
  if (!def || !def.live) redirect("/dashboard/integrations");

  const config: Record<string, unknown> = {};
  for (const f of def.fields) {
    const value = String(formData.get(f.name) ?? "").trim();
    if (value) config[f.name] = value;
  }

  // A "bring your own" webhook calendar is fetched server-side on every call, so a
  // private/internal URL here is an SSRF vector. Require a public https address.
  if (typeof config.url === "string" && !isSafeHttpsUrl(config.url)) {
    redirect(
      `/dashboard/integrations?error=${encodeURIComponent("Webhook URL must be a public https:// address.")}`,
    );
  }

  try {
    await upsertCalendarIntegration(provider, config, (await currentUserId()) ?? undefined);
  } catch (err) {
    redirect(`/dashboard/integrations?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/integrations");
  redirect("/dashboard/integrations?connected=1");
}

/** Create a CRM push endpoint. Assistants then opt in to it individually, so one
 *  endpoint here can serve any number of them. */
export async function createCrmAction(formData: FormData): Promise<void> {
  const name = String(formData.get("crm_name") ?? "").trim();
  const url = String(formData.get("crm_url") ?? "").trim();
  const secret = String(formData.get("crm_secret") ?? "").trim();

  const fail = (msg: string): never =>
    redirect(`/dashboard/integrations?error=${encodeURIComponent(msg)}`);

  if (!name) fail("Give the CRM push a name so you can tell it apart.");
  // Every completed call is POSTed here server-side, so a private/internal URL is
  // an SSRF vector. Same public-https rule as the webhook calendar; pushCallToCrm
  // re-checks at dispatch in case the hostname is repointed later.
  if (!isSafeHttpsUrl(url)) fail("CRM URL must be a public https:// address.");

  try {
    await createCrmIntegration(
      { name, url, ...(secret ? { secret } : {}) },
      (await currentUserId()) ?? undefined,
    );
  } catch (err) {
    fail((err as Error).message);
  }

  revalidatePath("/dashboard/integrations");
  revalidatePath("/dashboard/assistant", "layout");
  redirect("/dashboard/integrations?connected=1");
}

/** Remove a CRM push endpoint. Assistants pointing at it stop pushing: their
 *  stored target id no longer resolves (see resolveCrmTargets) and it drops from
 *  their routing on the next save. */
export async function deleteCrmAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await deleteIntegration(id, (await currentUserId()) ?? undefined);
    } catch {
      // already gone
    }
    revalidatePath("/dashboard/integrations");
    revalidatePath("/dashboard/assistant", "layout");
  }
  redirect("/dashboard/integrations");
}

export async function disconnectCalendarAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await deleteIntegration(id, (await currentUserId()) ?? undefined);
    } catch {
      // already gone
    }
    revalidatePath("/dashboard/integrations");
  }
  redirect("/dashboard/integrations");
}
