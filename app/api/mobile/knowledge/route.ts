import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { getAccountSettings } from "@/lib/dashboard/account";
import {
  connectedCalendarCount,
  getAiKnowledge,
  summarizeOrgKnowledgeCached,
  summarizeSourceMarkdown,
} from "@/lib/dashboard/ai-knowledge";
import {
  createOrganization,
  getOrganization,
  listOrganizationAssistants,
  listOrganizations,
  updateOrganizationKnowledge,
  type Organization,
} from "@/lib/dashboard/organizations";
import { fetchWebsiteMarkdown } from "@/lib/knowledge/website";
import {
  addSource,
  formatVerifiedLines,
  MAX_SOURCE_CHARS,
  parseVerifiedLines,
  readKnowledge,
  removeSource,
  type KnowledgeSource,
} from "@/lib/knowledge/sources";
import { mobileUserId } from "@/lib/mobile/auth";
import { ownsOrganization } from "@/lib/mobile/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * What the receptionist knows, on a phone.
 *
 * PDF upload is the one thing here that does NOT ship: a multipart upload of a
 * 15 MB file over a cellular link, parsed synchronously, is a request that dies
 * halfway far more often than it succeeds. Websites and typed notes cover the
 * same ground from a phone; the PDF path stays on the web.
 */

/**
 * Resolve the business these writes target, creating one on first use - exactly
 * what `ensureActiveOrganization` does on the web. A brand-new account has no
 * organization row and the concept is hidden from the user, so the first teach
 * action makes one rather than dead-ending on "create a business".
 */
async function ensureOrganization(userId: string, requestedId: string): Promise<Organization | null> {
  if (requestedId) {
    if (!(await ownsOrganization(requestedId, userId))) return null;
    return await getOrganization(requestedId).catch(() => null);
  }

  const existing = await listOrganizations(userId).catch(() => []);
  if (existing.length > 0) return existing[0];

  const account = await getAccountSettings(userId).catch(() => null);
  const name = (account?.company ?? "").trim() || "My business";
  const id = await createOrganization(name, userId);
  return await getOrganization(id).catch(() => null);
}

/** Persist, then re-sync every agent in the org so the change reaches live calls. */
async function saveKnowledge(orgId: string, next: Record<string, unknown>): Promise<void> {
  await updateOrganizationKnowledge(orgId, next);
  after(async () => {
    const assistants = await listOrganizationAssistants(orgId).catch(() => []);
    await Promise.all(
      assistants.map((a) =>
        syncAssistantAgent(a.id).catch((err) =>
          console.error("[mobile:knowledge] agent re-sync failed", a.id, err),
        ),
      ),
    );
  });
  revalidatePath("/dashboard/knowledge");
}

export async function GET(req: Request): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const requested = new URL(req.url).searchParams.get("business") ?? "";

  const [knowledge, calendars] = await Promise.all([
    getAiKnowledge(userId),
    connectedCalendarCount(userId).catch(() => 0),
  ]);

  const orgs = knowledge.organizations;
  const active = orgs.find((o) => o.org.id === requested) ?? orgs[0] ?? null;
  const stored = readKnowledge(active?.org.knowledge);

  // The digest is an LLM call behind a content-keyed cache. The web streams it
  // in with Suspense; a phone has no equivalent, so a miss returns null and the
  // app shows the fallback rather than blocking the whole screen on it.
  const digest = active ? await summarizeOrgKnowledgeCached(active).catch(() => null) : null;

  return Response.json({
    businesses: orgs.map((o) => ({ id: o.org.id, name: o.org.name })),
    activeBusinessId: active?.org.id ?? "",
    digest: digest ?? "",
    notes: stored.notes ?? "",
    verified: formatVerifiedLines(stored.verified ?? []),
    sources: (stored.sources ?? []).map((s) => ({
      id: s.id,
      kind: s.kind,
      title: s.title,
      url: s.url ?? "",
      summary: s.summary ?? "",
      charCount: s.charCount ?? s.markdown?.length ?? 0,
      addedAt: s.addedAt ?? "",
    })),
    ownerNotesShared: Boolean(knowledge.ownerNotes),
    calendarsConnected: calendars,
  });
}

interface PostBody {
  business?: unknown;
  action?: unknown;
  notes?: unknown;
  verified?: unknown;
  url?: unknown;
  text?: unknown;
}

export async function POST(req: Request): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  const org = await ensureOrganization(userId, String(body.business ?? "")).catch(() => null);
  if (!org) return Response.json({ error: "Business not found." }, { status: 404 });

  const knowledge = readKnowledge(org.knowledge);
  const action = String(body.action ?? "");

  try {
    if (action === "notes") {
      knowledge.notes = String(body.notes ?? "").trim();
      // Guarded on presence, not on the submit: a screen that carries only the
      // notes must not wipe the verified answers.
      if (Object.hasOwn(body, "verified")) {
        knowledge.verified = parseVerifiedLines(String(body.verified ?? ""));
      }
      await saveKnowledge(org.id, { ...knowledge });
      return Response.json({ ok: true, businessId: org.id });
    }

    if (action === "website") {
      const url = String(body.url ?? "").trim();
      if (!url) return Response.json({ error: "Enter a web address." }, { status: 400 });

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
        return Response.json({ error: "That page could not be read." }, { status: 400 });
      }

      source.summary = (await summarizeSourceMarkdown(source.title, source.markdown)) ?? undefined;
      const added = addSource(knowledge, source);
      if (!added.ok) return Response.json({ error: "That is as much as it can hold." }, { status: 400 });
      await saveKnowledge(org.id, { ...added.knowledge });
      return Response.json({
        ok: true,
        businessId: org.id,
        warning: truncated ? "Saved, but the page was long so only the start was kept." : null,
      });
    }

    if (action === "text") {
      const markdown = String(body.text ?? "").trim().slice(0, MAX_SOURCE_CHARS);
      if (!markdown) return Response.json({ error: "Type something to teach first." }, { status: 400 });
      const firstLine = markdown.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
      const title = firstLine ? firstLine.slice(0, 50) : "Note";
      const summary = await summarizeSourceMarkdown(title, markdown).catch(() => null);
      const added = addSource(knowledge, {
        id: randomUUID(),
        kind: "text",
        title,
        markdown,
        charCount: markdown.length,
        addedAt: new Date().toISOString(),
        ...(summary ? { summary } : {}),
      });
      if (!added.ok) return Response.json({ error: "That is as much as it can hold." }, { status: 400 });
      await saveKnowledge(org.id, { ...added.knowledge });
      return Response.json({ ok: true, businessId: org.id });
    }
  } catch (err) {
    console.error("[mobile:knowledge-write]", err);
    return Response.json({ error: "Could not save." }, { status: 500 });
  }

  return Response.json({ error: "Bad request." }, { status: 400 });
}

export async function DELETE(req: Request): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const sourceId = params.get("source") ?? "";
  if (!sourceId) return Response.json({ error: "Bad request." }, { status: 400 });

  const org = await ensureOrganization(userId, params.get("business") ?? "").catch(() => null);
  if (!org) return Response.json({ error: "Business not found." }, { status: 404 });

  try {
    await saveKnowledge(org.id, { ...removeSource(readKnowledge(org.knowledge), sourceId) });
  } catch (err) {
    console.error("[mobile:knowledge-remove]", err);
    return Response.json({ error: "Could not remove." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
