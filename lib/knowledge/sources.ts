// Per-assistant knowledge model. Everything lives inside the assistant's
// `knowledge` JSONB column: a free-text `notes` field (legacy) plus a list of
// ingested `sources` (websites and PDFs already processed to Markdown). The
// call engine renders all of this into the system prompt at pickup.

export type KnowledgeKind = "website" | "pdf" | "text";

export interface KnowledgeSource {
  id: string;
  kind: KnowledgeKind;
  title: string;
  url?: string; // for websites
  markdown: string; // processed content
  charCount: number;
  addedAt: string; // ISO 8601
}

export interface AssistantKnowledge {
  notes?: string;
  sources?: KnowledgeSource[];
  [key: string]: unknown; // tolerate forward-compatible extra keys
}

// Keep any single source from blowing up the prompt. Tuned conservatively so a
// few large docs still leave room for the conversation.
export const MAX_SOURCE_CHARS = 12_000;
export const MAX_SOURCES = 25;

export function readKnowledge(raw: Record<string, unknown> | null | undefined): AssistantKnowledge {
  const k = (raw ?? {}) as AssistantKnowledge;
  return {
    notes: typeof k.notes === "string" ? k.notes : "",
    sources: Array.isArray(k.sources) ? (k.sources as KnowledgeSource[]) : [],
  };
}

/** Add a source immutably, returning the next knowledge object. */
export function addSource(
  knowledge: AssistantKnowledge,
  source: KnowledgeSource,
): AssistantKnowledge {
  const sources = [...(knowledge.sources ?? []), source].slice(-MAX_SOURCES);
  return { ...knowledge, sources };
}

/** Remove a source by id immutably. */
export function removeSource(knowledge: AssistantKnowledge, id: string): AssistantKnowledge {
  const sources = (knowledge.sources ?? []).filter((s) => s.id !== id);
  return { ...knowledge, sources };
}

/**
 * Merge two knowledge objects (e.g. an organization's shared knowledge with an
 * assistant's own) into one. `base` is rendered first. Notes are concatenated;
 * sources are de-duplicated by id (base wins) and capped at MAX_SOURCES. Used at
 * pickup so an assistant reads its organization's knowledge alongside its own.
 */
export function mergeKnowledge(
  base: Record<string, unknown> | null | undefined,
  extra: Record<string, unknown> | null | undefined,
): AssistantKnowledge {
  const a = readKnowledge(base);
  const b = readKnowledge(extra);

  const notes = [a.notes, b.notes].map((n) => (n ?? "").trim()).filter(Boolean).join("\n\n");

  const seen = new Set<string>();
  const sources: KnowledgeSource[] = [];
  for (const src of [...(a.sources ?? []), ...(b.sources ?? [])]) {
    if (seen.has(src.id)) continue;
    seen.add(src.id);
    sources.push(src);
  }

  return { notes, sources: sources.slice(0, MAX_SOURCES) };
}

/**
 * Render the knowledge object into a readable Markdown block for the system
 * prompt. Preferred over dumping raw JSON: the model reads prose far better.
 */
export function renderKnowledgeMarkdown(raw: Record<string, unknown> | null | undefined): string {
  const k = readKnowledge(raw);
  const parts: string[] = [];

  if (k.notes && k.notes.trim()) {
    parts.push(k.notes.trim());
  }

  for (const src of k.sources ?? []) {
    if (!src.markdown?.trim()) continue;
    const heading = src.kind === "website" && src.url ? `${src.title} (${src.url})` : src.title;
    parts.push(`## ${heading}\n\n${src.markdown.trim()}`);
  }

  return parts.join("\n\n---\n\n").trim();
}
