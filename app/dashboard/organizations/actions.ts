"use server";

import { randomUUID } from "node:crypto";
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
  updateOrganizationKnowledge,
  type Organization,
} from "@/lib/dashboard/organizations";
import { getAssistant } from "@/lib/dashboard/db";
import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { fetchWebsiteMarkdown } from "@/lib/knowledge/website";
import { parsePdfMarkdown } from "@/lib/knowledge/pdf";
import {
  addSource,
  readKnowledge,
  removeSource,
  type KnowledgeSource,
} from "@/lib/knowledge/sources";

export async function createOrganizationAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim() || "My organization";
  const ownerId = await currentUserId();

  let id: string;
  try {
    id = await createOrganization(name, ownerId ?? undefined);
  } catch (err) {
    redirect(`/dashboard/organizations?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/organizations");
  redirect(`/dashboard/organizations/${id}`);
}

/** Confirm the signed-in user owns this organization (when auth is configured). */
async function ownedOrgOrRedirect(id: string): Promise<Organization> {
  const org = await getOrganization(id).catch(() => null);
  if (!org) redirect("/dashboard/organizations");
  // Fail closed: when auth is on, an owned org may only be touched by its owner.
  // Guarding on `ownerId &&` (as before) let an unauthenticated request - no
  // session, so currentUserId() is null - skip the check and mutate any org by id.
  // Unowned orgs (single-tenant, auth off) still pass. Mirrors requireAssistantOwner.
  if (authConfigured() && org.owner_id) {
    const ownerId = await currentUserId();
    if (org.owner_id !== ownerId) redirect("/dashboard/organizations");
  }
  return org;
}

function orgError(id: string, message: string): never {
  redirect(`/dashboard/organizations/${id}?error=${encodeURIComponent(message)}`);
}

/**
 * Push an org's changed knowledge to its assistants' live ElevenLabs agents.
 * The agent bakes in the org+assistant merged knowledge at sync time, so an org
 * knowledge edit is invisible on calls until each assistant re-syncs; this closes
 * that gap so changes take effect on the next call.
 *
 * Scheduled with `after()`, NOT awaited: this is several ElevenLabs round-trips
 * per assistant, and an org with a few assistants made every knowledge save sit
 * on a spinner for many seconds ("still saving..."). The save itself is the DB
 * write the caller already awaited; this only propagates it to the voice agents
 * so the next call reflects it. It was always fire-and-forget - it swallows its
 * own errors and never surfaced them - so moving it off the response changes
 * nothing the user could see, except the wait. `after` still runs after a
 * redirect() (per the Next docs), so callers schedule it then redirect at once.
 */
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

export async function updateOrganizationAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/organizations");
  await ownedOrgOrRedirect(id);

  try {
    await updateOrganization(id, {
      name: String(formData.get("name") ?? "").trim() || "My organization",
      description: String(formData.get("description") ?? "").trim(),
    });
  } catch (err) {
    orgError(id, (err as Error).message);
  }

  revalidatePath(`/dashboard/organizations/${id}`);
  revalidatePath("/dashboard/organizations");
  redirect(`/dashboard/organizations/${id}?saved=1`);
}

export async function deleteOrganizationAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await ownedOrgOrRedirect(id);
    // Capture members BEFORE deleting - deleteOrganization unassigns them
    // (organization_id → null), which changes the knowledge their agents bake in.
    // Re-sync each afterward so the deleted org's shared knowledge stops appearing
    // on their calls (same reason every other org-knowledge edit re-syncs).
    const members = await listOrganizationAssistants(id).catch(() => []);
    try {
      await deleteOrganization(id);
    } catch (err) {
      orgError(id, (err as Error).message);
    }
    // Re-sync detached members off the response, same as every knowledge edit -
    // deleting an org shouldn't hang on ElevenLabs. `after` runs post-redirect.
    after(async () => {
      await Promise.all(
        members.map((a) =>
          syncAssistantAgent(a.id).catch((e) =>
            console.error("[organizations] agent re-sync after org delete failed", a.id, e),
          ),
        ),
      );
    });
    revalidatePath("/dashboard/organizations");
  }
  redirect("/dashboard/organizations");
}

// ── Knowledge notes ─────────────────────────────────────────────────────────

export async function updateOrganizationNotesAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/organizations");
  const org = await ownedOrgOrRedirect(id);

  const notes = String(formData.get("knowledge_notes") ?? "").trim();
  const knowledge = readKnowledge(org.knowledge);
  knowledge.notes = notes;

  await updateOrganizationKnowledge(id, { ...knowledge }).catch((err) =>
    orgError(id, (err as Error).message),
  );
  resyncOrgAgents(id); // fire-and-forget via after()

  revalidatePath(`/dashboard/organizations/${id}`);
  redirect(`/dashboard/organizations/${id}?saved=1`);
}

// ── Knowledge sources (website + PDF → markdown) ────────────────────────────

export async function addOrgWebsiteKnowledgeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/organizations");
  const url = String(formData.get("url") ?? "").trim();
  if (!url) orgError(id, "Enter a URL to import.");

  const org = await ownedOrgOrRedirect(id);

  let source: KnowledgeSource;
  try {
    const result = await fetchWebsiteMarkdown(url);
    source = {
      id: randomUUID(),
      kind: "website",
      title: result.title,
      url,
      markdown: result.markdown,
      charCount: result.charCount,
      addedAt: new Date().toISOString(),
    };
  } catch (err) {
    orgError(id, (err as Error).message);
  }

  const next = addSource(readKnowledge(org.knowledge), source);
  await updateOrganizationKnowledge(id, { ...next }).catch((err) =>
    orgError(id, (err as Error).message),
  );
  resyncOrgAgents(id); // fire-and-forget via after()

  revalidatePath(`/dashboard/organizations/${id}`);
  redirect(`/dashboard/organizations/${id}?saved=1`);
}

export async function addOrgPdfKnowledgeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/organizations");

  const file = formData.get("pdf");
  if (!(file instanceof File) || file.size === 0) orgError(id, "Choose a PDF file to upload.");
  if (file.type && file.type !== "application/pdf") orgError(id, "That file isn't a PDF.");

  const org = await ownedOrgOrRedirect(id);

  let source: KnowledgeSource;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = await parsePdfMarkdown(bytes);
    source = {
      id: randomUUID(),
      kind: "pdf",
      title: file.name.replace(/\.pdf$/i, "") || "Document",
      markdown: result.markdown,
      charCount: result.charCount,
      addedAt: new Date().toISOString(),
    };
  } catch (err) {
    orgError(id, (err as Error).message);
  }

  const next = addSource(readKnowledge(org.knowledge), source);
  await updateOrganizationKnowledge(id, { ...next }).catch((err) =>
    orgError(id, (err as Error).message),
  );
  resyncOrgAgents(id); // fire-and-forget via after()

  revalidatePath(`/dashboard/organizations/${id}`);
  redirect(`/dashboard/organizations/${id}?saved=1`);
}

export async function removeOrgKnowledgeSourceAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const sourceId = String(formData.get("source_id") ?? "");
  if (!id) redirect("/dashboard/organizations");
  if (!sourceId) redirect(`/dashboard/organizations/${id}`);

  const org = await ownedOrgOrRedirect(id);
  const next = removeSource(readKnowledge(org.knowledge), sourceId);
  await updateOrganizationKnowledge(id, { ...next }).catch(() => {});
  resyncOrgAgents(id); // fire-and-forget via after()

  revalidatePath(`/dashboard/organizations/${id}`);
  redirect(`/dashboard/organizations/${id}?saved=1`);
}

// ── Assistant assignment ────────────────────────────────────────────────────

/** Toggle one assistant's membership in this organization. */
export async function toggleAssistantOrganizationAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const assistantId = String(formData.get("assistant_id") ?? "");
  const assign = formData.get("assign") === "1";
  if (!id) redirect("/dashboard/organizations");
  if (!assistantId) redirect(`/dashboard/organizations/${id}`);

  await ownedOrgOrRedirect(id);

  // Guard ownership of the assistant too, when auth is configured.
  const assistant = await getAssistant(assistantId).catch(() => null);
  if (!assistant) orgError(id, "Assistant not found.");
  if (authConfigured() && assistant.owner_id) {
    const ownerId = await currentUserId();
    if (assistant.owner_id !== ownerId) orgError(id, "You don't own that assistant.");
  }

  await setAssistantOrganization(assistantId, assign ? id : null).catch((err) =>
    orgError(id, (err as Error).message),
  );

  // Assigning/unassigning changes the knowledge the assistant reads on calls
  // (org shared knowledge is merged in at sync time), so rebuild its ElevenLabs
  // agent now - this is the step that makes "assign to org → agent is ready with
  // the org's knowledge" true. Best-effort: the membership change already saved.
  await syncAssistantAgent(assistantId).catch((err) =>
    console.error("[organizations] agent sync after assignment failed", assistantId, err),
  );

  revalidatePath(`/dashboard/organizations/${id}`);
  revalidatePath("/dashboard/assistant");
  redirect(`/dashboard/organizations/${id}?saved=1`);
}
