"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import {
  createOrganization,
  deleteOrganization,
  getOrganization,
  setAssistantOrganization,
  updateOrganization,
  updateOrganizationKnowledge,
  type Organization,
} from "@/lib/dashboard/organizations";
import { getAssistant } from "@/lib/dashboard/db";
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
  const ownerId = await currentUserId();
  if (ownerId && org.owner_id && org.owner_id !== ownerId) {
    redirect("/dashboard/organizations");
  }
  return org;
}

function orgError(id: string, message: string): never {
  redirect(`/dashboard/organizations/${id}?error=${encodeURIComponent(message)}`);
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
    try {
      await deleteOrganization(id);
    } catch {
      // best-effort
    }
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
  const ownerId = await currentUserId();
  if (ownerId && assistant.owner_id && assistant.owner_id !== ownerId) {
    orgError(id, "You don't own that assistant.");
  }

  await setAssistantOrganization(assistantId, assign ? id : null).catch((err) =>
    orgError(id, (err as Error).message),
  );

  revalidatePath(`/dashboard/organizations/${id}`);
  revalidatePath("/dashboard/assistant");
  redirect(`/dashboard/organizations/${id}?saved=1`);
}
