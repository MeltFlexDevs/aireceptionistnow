import { cache } from "react";
import { getGemini } from "../call-engine/llm/gemini";
import { getEnv } from "../call-engine/env";
import { accountKnowledgeNotes, getAccountSettings, type AccountSettings } from "./account";
import { listAssistants, listIntegrations, type Assistant } from "./db";
import { listOrganizations, type Organization } from "./organizations";
import { mergeKnowledge, readKnowledge, renderKnowledgeMarkdown, type KnowledgeSource } from "../knowledge/sources";

// Everything the AI knows about a user, assembled for the "What your AI knows"
// page. Read-only mirror of what the call engine composes at pickup
// (resolveInboundNumber): the assistant's own knowledge, its organization's
// shared knowledge, and the owner's profile notes. Kept here rather than in the
// page so the page renders one shape and this stays testable.

export interface OrgKnowledge {
  org: Organization;
  /** Assistants reading this organization's knowledge. */
  assistants: Assistant[];
  notes: string;
  sources: KnowledgeSource[];
  /** Characters of knowledge the AI reads for this org - the prompt's weight. */
  charCount: number;
}

export interface AiKnowledge {
  account: AccountSettings | null;
  /** The owner block the AI actually receives, or "" when sharing is off. */
  ownerNotes: string;
  organizations: OrgKnowledge[];
  /** Assistants with no organization - they read only their own knowledge. */
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

/** Assemble everything the AI reads about this owner. Cached per request: the
 *  page body and its streamed summary sections all need the same tree. */
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

/** Calendars the assistants can reach - part of "what it can do on a call". */
export async function connectedCalendarCount(ownerId: string | null): Promise<number> {
  const list = await listIntegrations(ownerId ?? undefined).catch(() => []);
  return list.filter((i) => i.type === "calendar" && i.enabled).length;
}

/**
 * Exactly what one assistant's prompt knowledge resolves to at pickup - its own
 * knowledge merged with its organization's, plus the owner block. Mirrors
 * resolveInboundNumber's precedence (org first, then assistant, then owner) so
 * the page can't drift from what callers actually get.
 */
export function assistantKnowledgeMarkdown(
  assistant: Assistant,
  org: Organization | null,
  ownerNotes: string,
): string {
  let merged = org?.knowledge
    ? mergeKnowledge(assistant.knowledge, org.knowledge)
    : readKnowledge(assistant.knowledge);
  if (ownerNotes) merged = mergeKnowledge(merged, { notes: ownerNotes });
  return renderKnowledgeMarkdown(merged);
}

// Keep the summary prompt bounded: a few large PDFs can push an org's knowledge
// past a sensible request size, and the first slice is the representative part.
const SUMMARY_INPUT_CHARS = 16_000;

const SUMMARY_SYSTEM = [
  "You summarize a business's knowledge base the way a new receptionist would brief themselves before their first shift.",
  "Write 2-4 plain sentences, in English, addressed to the business owner as 'your callers' / 'your business'.",
  "Say what the AI can confidently answer from this material, and name the most useful specifics it holds (services, hours, pricing, policies).",
  "If something a caller would obviously ask about is missing, end with one short sentence naming the biggest gap.",
  "No preamble, no headings, no bullet points, no markdown.",
].join(" ");

/**
 * A plain-language summary of what the AI can answer for one organization,
 * generated from its knowledge. Returns null when there's nothing to summarize
 * or the model is unavailable/misconfigured - the page then shows the raw
 * sources instead, so a Gemini outage degrades one card rather than the screen.
 */
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

  try {
    const res = await getGemini().models.generateContent({
      model: getEnv().GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SUMMARY_SYSTEM,
        maxOutputTokens: 300,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    return (res.text ?? "").trim() || null;
  } catch (err) {
    console.error(`[ai-knowledge] summary failed for org ${entry.org.id}`, err);
    return null;
  }
}
