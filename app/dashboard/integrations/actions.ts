"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteIntegration, upsertCalendarIntegration } from "@/lib/dashboard/db";
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
    await upsertCalendarIntegration(provider, config);
  } catch (err) {
    redirect(`/dashboard/integrations?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/integrations");
  redirect("/dashboard/integrations?connected=1");
}

export async function disconnectCalendarAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    try {
      await deleteIntegration(id);
    } catch {
      // already gone
    }
    revalidatePath("/dashboard/integrations");
  }
  redirect("/dashboard/integrations");
}
