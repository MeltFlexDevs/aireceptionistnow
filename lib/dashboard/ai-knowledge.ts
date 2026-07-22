import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getGemini } from "../call-engine/llm/gemini";
import { getEnv } from "../call-engine/env";
import { accountKnowledgeNotes, getAccountSettings, type AccountSettings } from "./account";
import { listAssistants, listIntegrations, type Assistant } from "./db";
import { listOrganizations, type Organization } from "./organizations";
import { readKnowledge, renderKnowledgeMarkdown, type KnowledgeSource } from "../knowledge/sources";

export interface OrgKnowledge {
  org: Organization;
  assistants: Assistant[];
  notes: string;
  sources: KnowledgeSource[];
  charCount: number;
}

export interface AiKnowledge {
  account: AccountSettings | null;
  ownerNotes: string;
  organizations: OrgKnowledge[];
  unaffiliated: Assistant[];
  assistantCount: number;
}

function knowledgeOf(raw: Record<string, unknown> | null | undefined): {
  notes: string;
  sources: KnowledgeSource[];
  charCount: number;
} {
  const k = readKnowledge(raw);
  const sources = k.sources ?? [];
  const notes = k.notes ?? "";
  const charCount =
    notes.length + sources.reduce((n, s) => n + (s.charCount || s.markdown?.length || 0), 0);
  return { notes, sources, charCount };
}

export const getAiKnowledge = cache(async (ownerId: string | null): Promise<AiKnowledge> => {
  const [account, orgs, assistants] = await Promise.all([
    ownerId ? getAccountSettings(ownerId).catch(() => null) : Promise.resolve(null),
    listOrganizations(ownerId ?? undefined).catch(() => []),
    listAssistants(ownerId ?? undefined).catch(() => []),
  ]);

  const organizations: OrgKnowledge[] = orgs.map((org) => ({
    org,
    assistants: assistants.filter((a) => a.organization_id === org.id),
    ...knowledgeOf(org.knowledge),
  }));

  return {
    account,
    ownerNotes: accountKnowledgeNotes(account),
    organizations,
    unaffiliated: assistants.filter((a) => !a.organization_id),
    assistantCount: assistants.length,
  };
});

export async function connectedCalendarCount(ownerId: string | null): Promise<number> {
  const list = await listIntegrations(ownerId ?? undefined).catch(() => []);
  return list.filter((i) => i.type === "calendar" && i.enabled).length;
}

const SUMMARY_INPUT_CHARS = 16_000;

const SUMMARY_SYSTEM = [
  "You summarize a business's knowledge base the way a new receptionist would brief themselves before their first shift.",
  "Write 2-4 plain sentences, in English, addressed to the business owner as 'your callers' / 'your business'.",
  "Say what the AI can confidently answer from this material, and name the most useful specifics it holds (services, hours, pricing, policies).",
  "If something a caller would obviously ask about is missing, end with one short sentence naming the biggest gap.",
  "No preamble, no headings, no bullet points, no markdown.",
].join(" ");

// One Gemini call per org per knowledge revision, not per page view: keyed by
// a content checksum so edits regenerate and repeat views hit the cache.
// Failures throw inside the cached function (nothing cached) and resolve to
// null only outside it.
export function summarizeOrgKnowledgeCached(entry: OrgKnowledge): Promise<string | null> {
  const content = JSON.stringify([
    entry.org.name ?? "",
    entry.org.description ?? "",
    entry.org.knowledge ?? {},
  ]);
  let h = 0;
  for (let i = 0; i < content.length; i++) h = (h * 31 + content.charCodeAt(i)) | 0;
  return unstable_cache(
    () => summarizeOrgKnowledge(entry),
    ["org-knowledge-summary", entry.org.id, String(h)],
    { revalidate: 24 * 3600 },
  )().catch((err) => {
    console.error(`[ai-knowledge] summary failed for org ${entry.org.id}`, err);
    return null;
  });
}

export async function summarizeOrgKnowledge(entry: OrgKnowledge): Promise<string | null> {
  const markdown = renderKnowledgeMarkdown(entry.org.knowledge);
  const description = entry.org.description?.trim() ?? "";
  if (!markdown && !description) return null;

  const prompt = [
    `Business: ${entry.org.name}`,
    description ? `Owner's description: ${description}` : "",
    markdown ? `Knowledge the AI reads on calls:\n${markdown.slice(0, SUMMARY_INPUT_CHARS)}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // Throws on failure so the cached wrapper never stores an error fallback.
  const res = await (await getGemini()).models.generateContent({
    model: getEnv().GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: SUMMARY_SYSTEM,
      maxOutputTokens: 300,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });
  return (res.text ?? "").trim() || null;
}

const SOURCE_SUMMARY_SYSTEM = [
  "You summarize ONE document from a business's knowledge base for the business owner.",
  "Write 1-3 short plain sentences, in English, saying what this document covers and the kind of caller questions it lets the AI answer.",
  "Ground it in the actual content - name the concrete topics it contains (e.g. hours, prices, policies).",
  "No preamble, no headings, no bullet points, no markdown.",
].join(" ");

export async function summarizeSourceMarkdown(
  title: string,
  markdown: string,
): Promise<string | null> {
  const text = (markdown ?? "").trim();
  if (!text) return null;

  const prompt = `Document title: ${title}\n\nContent:\n${text.slice(0, SUMMARY_INPUT_CHARS)}`;
  try {
    const res = await (await getGemini()).models.generateContent({
      model: getEnv().GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SOURCE_SUMMARY_SYSTEM,
        maxOutputTokens: 180,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return (res.text ?? "").trim() || null;
  } catch (err) {
    console.error(`[ai-knowledge] source summary failed for "${title}"`, err);
    return null;
  }
}
