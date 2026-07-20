"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import {
  createOrganization,
  getOrganization,
  listOrganizationAssistants,
  listOrganizations,
  updateOrganizationKnowledge,
  type Organization,
} from "@/lib/dashboard/organizations";
import { getAccountSettings } from "@/lib/dashboard/account";
import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { fetchWebsiteMarkdown } from "@/lib/knowledge/website";
import { parsePdfMarkdown } from "@/lib/knowledge/pdf";
import { summarizeSourceMarkdown } from "@/lib/dashboard/ai-knowledge";
import {
  addSource,
  readKnowledge,
  removeSource,
  MAX_SOURCE_CHARS,
  type KnowledgeSource,
} from "@/lib/knowledge/sources";
import { getDictionary } from "@/lib/i18n/server";
import { ok, fail, type ActionState } from "@/lib/dashboard/action-state";

/**
 * Teaching actions for /dashboard/knowledge.
 *
 * These moved out of company/actions.ts and swapped ?saved=1 redirects for
 * returned state, so a save shows an inline pill without reloading the page or
 * losing the reader's place in the source list.
 */

/**
 * Thrown to abort an action with a user-facing message.
 *
 * The `: never` return is load-bearing, not decoration: TypeScript's control
 * flow analysis uses it for definite assignment on `let source` and for
 * narrowing `file` to File and `assistant` away from null. Replacing these with
 * plain `return` statements would silently drop those guards.
 */
class KnowledgeActionError extends Error {}

function bail(message: string): never {
  throw new KnowledgeActionError(message);
}

async function run(fn: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof KnowledgeActionError) return fail(err.message);
    // Next's redirect() and notFound() are also thrown - never swallow them.
    throw err;
  }
}

function resyncOrgAgents(orgId: string): void {
  after(async () => {
    const assistants = await listOrganizationAssistants(orgId).catch(() => []);
    await Promise.all(
      assistants.map((a) =>
        syncAssistantAgent(a.id).catch((err) =>
          console.error("[knowledge] agent re-sync failed", a.id, err),
        ),
      ),
    );
  });
}

/**
 * Resolve the business these teaching actions write to, creating one on first
 * use. A brand-new account has no organization row, and the old UI dead-ended
 * on a "Create an organization" button; the concept is hidden now, so the first
 * teach action just makes one.
 */
async function ensureActiveOrganization(requestedId: string): Promise<Organization> {
  const ownerId = await currentUserId();
  const t = await getDictionary();

  if (requestedId) {
    const org = await getOrganization(requestedId).catch(() => null);
    if (!org) bail(t.knowledge.businessNotFound);
    if (authConfigured() && org.owner_id && org.owner_id !== ownerId) {
      bail(t.knowledge.businessNotFound);
    }
    return org;
  }

  const existing = await listOrganizations(ownerId).catch(() => []);
  if (existing.length > 0) return existing[0];

  const account = ownerId ? await getAccountSettings(ownerId).catch(() => null) : null;
  const name = (account?.company ?? "").trim() || t.knowledge.defaultBusinessName;
  let id: string;
  try {
    id = await createOrganization(name, ownerId ?? undefined);
  } catch {
    bail(t.knowledge.saveFailed);
  }
  const created = await getOrganization(id).catch(() => null);
  if (!created) bail(t.knowledge.saveFailed);
  return created;
}

async function saveKnowledge(orgId: string, next: Record<string, unknown>): Promise<void> {
  const t = await getDictionary();
  try {
    await updateOrganizationKnowledge(orgId, next);
  } catch {
    bail(t.knowledge.saveFailed);
  }
  resyncOrgAgents(orgId); // fire-and-forget via after()
  revalidatePath("/dashboard/knowledge");
}

export async function updateKnowledgeNotesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const t = await getDictionary();
    const org = await ensureActiveOrganization(String(formData.get("id") ?? ""));
    const knowledge = readKnowledge(org.knowledge);
    knowledge.notes = String(formData.get("knowledge_notes") ?? "").trim();
    await saveKnowledge(org.id, { ...knowledge });
    return ok(t.knowledge.saved);
  });
}

export async function addWebsiteKnowledgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const t = await getDictionary();
    const url = String(formData.get("url") ?? "").trim();
    if (!url) bail(t.knowledge.errorNoUrl);

    const org = await ensureActiveOrganization(String(formData.get("id") ?? ""));

    let source: KnowledgeSource;
    let truncated = false;
    try {
      const result = await fetchWebsiteMarkdown(url);
      truncated = result.charCount >= MAX_SOURCE_CHARS;
      source = {
        id: randomUUID(),
        kind: "website",
        title: result.title,
        url,
        markdown: result.markdown,
        charCount: result.charCount,
        addedAt: new Date().toISOString(),
      };
    } catch {
      bail(t.knowledge.errorWebsiteFailed);
    }

    source.summary = (await summarizeSourceMarkdown(source.title, source.markdown)) ?? undefined;

    const added = addSource(readKnowledge(org.knowledge), source);
    if (!added.ok) bail(t.knowledge.errorTooManySources);
    await saveKnowledge(org.id, { ...added.knowledge });
    return ok(truncated ? t.knowledge.savedTruncated : t.knowledge.saved);
  });
}

export async function addPdfKnowledgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const t = await getDictionary();
    const file = formData.get("pdf");
    // bail(): never - this is what narrows `file` to File below.
    if (!(file instanceof File) || file.size === 0) bail(t.knowledge.errorNoFile);
    if (file.type && file.type !== "application/pdf") bail(t.knowledge.errorNotPdf);

    const org = await ensureActiveOrganization(String(formData.get("id") ?? ""));

    let source: KnowledgeSource;
    let truncated = false;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const result = await parsePdfMarkdown(bytes);
      truncated = result.charCount >= MAX_SOURCE_CHARS;
      source = {
        id: randomUUID(),
        kind: "pdf",
        title: file.name.replace(/\.pdf$/i, "") || "Document",
        markdown: result.markdown,
        charCount: result.charCount,
        addedAt: new Date().toISOString(),
      };
    } catch (err) {
      // parsePdfMarkdown is the one limit that already throws a useful message
      // (the 15 MB cap), so pass it through rather than flattening it.
      bail((err as Error).message || t.knowledge.errorPdfFailed);
    }

    source.summary = (await summarizeSourceMarkdown(source.title, source.markdown)) ?? undefined;

    const added = addSource(readKnowledge(org.knowledge), source);
    if (!added.ok) bail(t.knowledge.errorTooManySources);
    await saveKnowledge(org.id, { ...added.knowledge });
    return ok(truncated ? t.knowledge.savedTruncated : t.knowledge.saved);
  });
}

export async function removeKnowledgeSourceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const t = await getDictionary();
    const sourceId = String(formData.get("source_id") ?? "");
    if (!sourceId) bail(t.knowledge.saveFailed);

    const org = await ensureActiveOrganization(String(formData.get("id") ?? ""));
    const next = removeSource(readKnowledge(org.knowledge), sourceId);
    await saveKnowledge(org.id, { ...next });
    return ok(t.knowledge.removed);
  });
}
