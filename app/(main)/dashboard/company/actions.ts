"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  listOrganizationAssistants,
  setAssistantOrganization,
  updateOrganization,
  type Organization,
} from "@/lib/dashboard/organizations";
import { getAssistant } from "@/lib/dashboard/db";
import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { getDictionary } from "@/lib/i18n/server";
import { ok, fail, type ActionState } from "@/lib/dashboard/action-state";

/**
 * The business ("organization") concept is hidden from the UI now: /dashboard/company
 * and /dashboard/company/[id] are redirect shims, and the teaching actions moved to
 * app/dashboard/knowledge/actions.ts.
 *
 * These survive without UI of their own so no capability is silently lost:
 *  - createOrganizationAction   - provisioning; Knowledge auto-creates on first teach.
 *  - updateOrganizationAction   - regained UI in Settings as the business-name save.
 *  - deleteOrganizationAction   - account closure, a support/billing flow.
 *  - toggleAssistantOrganizationAction - provisioning automates membership.
 *
 * Every redirect/revalidate target points at a live route.
 */

export async function createOrganizationAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim() || "My business";
  const ownerId = await currentUserId();

  try {
    await createOrganization(name, ownerId ?? undefined);
  } catch (err) {
    redirect(`/dashboard/knowledge?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/knowledge");
  redirect("/dashboard/knowledge");
}

async function ownedOrgOrRedirect(id: string): Promise<Organization> {
  const org = await getOrganization(id).catch(() => null);
  if (!org) redirect("/dashboard/knowledge");
  if (authConfigured() && org.owner_id) {
    const ownerId = await currentUserId();
    if (org.owner_id !== ownerId) redirect("/dashboard/knowledge");
  }
  return org;
}

function orgError(message: string): never {
  redirect(`/dashboard/knowledge?error=${encodeURIComponent(message)}`);
}

function resyncOrgAgents(orgId: string): void {
  after(async () => {
    const assistants = await listOrganizationAssistants(orgId).catch(() => []);
    await Promise.all(
      assistants.map((a) =>
        syncAssistantAgent(a.id).catch((err) =>
          console.error("[organizations] agent re-sync failed", a.id, err),
        ),
      ),
    );
  });
}

/**
 * State-returning: Settings calls this as part of saving the business name, and
 * renders the result as an inline pill.
 *
 * Note the catch below MUST return. When this was redirect-based, `orgError`
 * had a `never` return, so a failure could not fall through to the success
 * path; now it can, and a swallowed error would report a save that never
 * happened.
 */
export async function updateOrganizationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getDictionary();
  const id = String(formData.get("id") ?? "");
  if (!id) return fail(t.settings.saveFailed);
  const org = await ownedOrgOrRedirect(id);

  // The form no longer carries a description field; keep whatever is stored
  // (it still feeds the AI knowledge summary) unless a caller sends one.
  const description = formData.get("description");
  try {
    await updateOrganization(id, {
      name: String(formData.get("name") ?? "").trim() || "My business",
      description: description == null ? org.description : String(description).trim(),
    });
  } catch {
    return fail(t.settings.saveFailed);
  }

  // A rename never used to re-sync, so the receptionist kept introducing the
  // business by its old name until something else touched the agent.
  resyncOrgAgents(id);
  revalidatePath("/dashboard/knowledge");
  revalidatePath("/dashboard/settings");
  return ok();
}

export async function deleteOrganizationAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await ownedOrgOrRedirect(id);
    const members = await listOrganizationAssistants(id).catch(() => []);
    try {
      await deleteOrganization(id);
    } catch (err) {
      orgError((err as Error).message);
    }
    after(async () => {
      await Promise.all(
        members.map((a) =>
          syncAssistantAgent(a.id).catch((e) =>
            console.error("[organizations] agent re-sync after org delete failed", a.id, e),
          ),
        ),
      );
    });
    revalidatePath("/dashboard/knowledge");
  }
  redirect("/dashboard/knowledge");
}

export async function toggleAssistantOrganizationAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const assistantId = String(formData.get("assistant_id") ?? "");
  const assign = formData.get("assign") === "1";
  if (!id) redirect("/dashboard/knowledge");
  if (!assistantId) redirect("/dashboard/knowledge");

  await ownedOrgOrRedirect(id);

  // Guard ownership of the assistant too, when auth is configured.
  const assistant = await getAssistant(assistantId).catch(() => null);
  if (!assistant) orgError("Assistant not found.");
  if (authConfigured() && assistant.owner_id) {
    const ownerId = await currentUserId();
    if (assistant.owner_id !== ownerId) orgError("You don't own that assistant.");
  }

  await setAssistantOrganization(assistantId, assign ? id : null).catch((err) =>
    orgError((err as Error).message),
  );

  await syncAssistantAgent(assistantId).catch((err) =>
    console.error("[organizations] agent sync after assignment failed", assistantId, err),
  );

  revalidatePath("/dashboard/knowledge");
  revalidatePath("/dashboard/assistant");
  redirect("/dashboard/knowledge");
}
