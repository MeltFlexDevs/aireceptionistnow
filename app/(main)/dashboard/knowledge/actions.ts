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
import { dismissDemand, markDemandAnswered } from "@/lib/dashboard/demand";
import { mergeVerifiedAnswer } from "@/lib/dashboard/knowledge-gaps";
import { isOwnedBy } from "@/lib/dashboard/ownership";
import {
  addSource,
  parseVerifiedLines,
  readKnowledge,
  removeSource,
  MAX_SOURCE_CHARS,
  MAX_VERIFIED,
  type AssistantKnowledge,
  type KnowledgeSource,
} from "@/lib/knowledge/sources";
import { getDictionary } from "@/lib/i18n/server";
import { ok, fail, type ActionState } from "@/lib/dashboard/action-state";

/**
 * Teaching actions for /dashboard/knowledge.
 *
 * These return state instead of ?saved=1 redirects, so a save shows an inline
 * pill without reloading the page or losing the reader's place in the source
 * list.
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
    if (!isOwnedBy(org.owner_id, ownerId)) {
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

/**
 * Write one action's change to the business's knowledge.
 *
 * The org row is read again here, right before the update, and `change` runs
 * on that fresh copy. Callers do their slow work (fetch a site, parse a PDF,
 * summarize) before they call this. Each action used to write back the copy
 * it read at its start, so a website added while a gap was answered dropped
 * the answer. Not atomic: a save that lands between this read and the update
 * can still be lost, but that window is one query, not a website fetch.
 * `change` may bail(); nothing is written then.
 */
async function saveKnowledge(
  orgId: string,
  change: (fresh: AssistantKnowledge) => AssistantKnowledge,
): Promise<void> {
  const t = await getDictionary();
  const current = await getOrganization(orgId).catch(() => null);
  if (!current) bail(t.knowledge.saveFailed);
  const next = change(readKnowledge(current.knowledge));
  try {
    await updateOrganizationKnowledge(orgId, { ...next });
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
    await saveKnowledge(org.id, (fresh) => {
      fresh.notes = String(formData.get("knowledge_notes") ?? "").trim();
      // Guarded on presence, not on the submit: an older form that carries only
      // the notes must not wipe the verified answers. Same rule as the assistant
      // patch layer - see lib/dashboard/assistant-patch.ts.
      if (formData.has("knowledge_verified")) {
        fresh.verified = parseVerifiedLines(String(formData.get("knowledge_verified") ?? ""));
      }
      return fresh;
    });
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

    await saveKnowledge(org.id, (fresh) => {
      const added = addSource(fresh, source);
      if (!added.ok) bail(t.knowledge.errorTooManySources);
      return added.knowledge;
    });
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

    await saveKnowledge(org.id, (fresh) => {
      const added = addSource(fresh, source);
      if (!added.ok) bail(t.knowledge.errorTooManySources);
      return added.knowledge;
    });
    return ok(truncated ? t.knowledge.savedTruncated : t.knowledge.saved);
  });
}

/**
 * Answer a gap the assistant admitted to, and close it for good.
 *
 * This is the compounding half of the product. A caller asked something the
 * knowledge base did not cover, the assistant said so honestly and took a
 * message, and the post-call pass recorded the question. The owner types one
 * sentence here and it becomes a VERIFIED answer - injected ahead of retrieval
 * with instructions to use the wording as given - so the next caller who asks
 * gets it word for word, and the accuracy audit has something to check the
 * assistant against instead of a blank.
 *
 * The pair is stored on the organization rather than the assistant, matching
 * everything else on this page: one business, one set of facts, and every
 * assistant in it re-synced by `saveKnowledge`.
 */
export async function answerKnowledgeGapAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const t = await getDictionary();
    const signalId = Number(formData.get("signal_id") ?? 0);
    const answer = String(formData.get("answer") ?? "").trim();
    if (!signalId || !answer) bail(t.knowledge.saveFailed);

    const ownerId = await currentUserId();
    if (authConfigured() && !ownerId) bail(t.knowledge.saveFailed);

    // Claimed before anything is written to the knowledge base: if two tabs
    // answer the same row, the second gets null here and stops, rather than
    // adding a duplicate verified answer.
    const signal = await markDemandAnswered(signalId, ownerId ?? "", answer);
    if (!signal) bail(t.knowledge.saveFailed);

    const org = await ensureActiveOrganization(String(formData.get("id") ?? ""));

    // Re-answering the same question replaces it rather than stacking a second
    // pair the model would have to choose between. Shared with the mobile route.
    await saveKnowledge(org.id, (fresh) => ({
      ...fresh,
      verified: mergeVerifiedAnswer(fresh.verified ?? [], signal.topic, answer, MAX_VERIFIED),
    }));
    return ok(t.knowledge.saved);
  });
}

/**
 * Not worth answering.
 *
 * Kept as an explicit action rather than a delete so the row stops appearing
 * without losing the fact that a caller asked - the weekly demand report reads
 * the same table, and "we decided not to answer this" is different from "nobody
 * ever asked".
 */
export async function dismissKnowledgeGapAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run(async () => {
    const t = await getDictionary();
    const signalId = Number(formData.get("signal_id") ?? 0);
    if (!signalId) bail(t.knowledge.saveFailed);

    const ownerId = await currentUserId();
    if (authConfigured() && !ownerId) bail(t.knowledge.saveFailed);

    await dismissDemand(signalId, ownerId ?? "");
    revalidatePath("/dashboard/knowledge");
    return ok(t.knowledge.removed);
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
    await saveKnowledge(org.id, (fresh) => removeSource(fresh, sourceId));
    return ok(t.knowledge.removed);
  });
}
