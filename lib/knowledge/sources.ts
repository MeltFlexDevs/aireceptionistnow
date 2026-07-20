
export type KnowledgeKind = "website" | "pdf" | "text";

export interface KnowledgeSource {
  id: string;
  kind: KnowledgeKind;
  title: string;
  url?: string; // for websites
  markdown: string; // processed content
  charCount: number;
  addedAt: string; // ISO 8601
  summary?: string;
}

export interface AssistantKnowledge {
  notes?: string;
  sources?: KnowledgeSource[];
  [key: string]: unknown; // tolerate forward-compatible extra keys
}

export const MAX_SOURCE_CHARS = 12_000;
export const MAX_SOURCES = 25;

export function readKnowledge(raw: Record<string, unknown> | null | undefined): AssistantKnowledge {
  const k = (raw ?? {}) as AssistantKnowledge;
  return {
    notes: typeof k.notes === "string" ? k.notes : "",
    sources: Array.isArray(k.sources) ? (k.sources as KnowledgeSource[]) : [],
  };
}

export type AddSourceResult =
  | { ok: true; knowledge: AssistantKnowledge }
  | { ok: false; reason: "limit" };

/**
 * Refuses at the cap rather than truncating. It used to `slice(-MAX_SOURCES)`,
 * which silently dropped the OLDEST source the moment you added a 26th - the
 * user was never told, and a fact the receptionist had been answering from just
 * stopped being true. Callers surface the refusal as a plain-language error.
 */
export function addSource(knowledge: AssistantKnowledge, source: KnowledgeSource): AddSourceResult {
  const sources = knowledge.sources ?? [];
  if (sources.length >= MAX_SOURCES) return { ok: false, reason: "limit" };
  return { ok: true, knowledge: { ...knowledge, sources: [...sources, source] } };
}

export function removeSource(knowledge: AssistantKnowledge, id: string): AssistantKnowledge {
  const sources = (knowledge.sources ?? []).filter((s) => s.id !== id);
  return { ...knowledge, sources };
}

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

  // Provisioning-time merge, with no user present to tell - so this one does
  // truncate. It keeps the FIRST MAX_SOURCES rather than the last; the
  // asymmetry with addSource is deliberate, not an oversight.
  return { notes, sources: sources.slice(0, MAX_SOURCES) };
}

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
