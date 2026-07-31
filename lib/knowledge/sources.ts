
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
  // Higher = more important. Sources are injected/retrieved most-important
  // first so the agent reaches the business's key facts fastest. Defaults to 0
  // (insertion order preserved); operators can raise it to pin a source up.
  priority?: number;
}

/**
 * A question the business has answered itself, word for word.
 *
 * Retrieval gives the model the right paragraph and lets it paraphrase, which is
 * exactly what you do NOT want for the handful of answers that must come out
 * right every time - the cancellation policy, what a quote includes, whether
 * something is refundable. These are injected ahead of everything else and the
 * agent is told to use the wording as given.
 */
export interface VerifiedAnswer {
  q: string;
  a: string;
}

export interface AssistantKnowledge {
  notes?: string;
  sources?: KnowledgeSource[];
  verified?: VerifiedAnswer[];
  [key: string]: unknown; // tolerate forward-compatible extra keys
}

export const MAX_SOURCE_CHARS = 12_000;
export const MAX_SOURCES = 25;
export const MAX_VERIFIED = 25;
const MAX_VERIFIED_Q_CHARS = 200;
const MAX_VERIFIED_A_CHARS = 600;

export function readVerified(raw: unknown): VerifiedAnswer[] {
  if (!Array.isArray(raw)) return [];
  const out: VerifiedAnswer[] = [];
  for (const entry of raw) {
    if (out.length >= MAX_VERIFIED) break;
    if (!entry || typeof entry !== "object") continue;
    const { q, a } = entry as Record<string, unknown>;
    const question = typeof q === "string" ? q.trim().slice(0, MAX_VERIFIED_Q_CHARS) : "";
    const answer = typeof a === "string" ? a.trim().slice(0, MAX_VERIFIED_A_CHARS) : "";
    // Half a pair is worse than none: a question with no answer would make the
    // agent think it has a verified answer and then improvise one.
    if (question && answer) out.push({ q: question, a: answer });
  }
  return out;
}

/**
 * Parse the verified-answers textarea: alternating lines, `Q: ...` / `A: ...`.
 * Blank lines separate pairs and are ignored.
 */
export function parseVerifiedLines(text: string): VerifiedAnswer[] {
  const pairs: VerifiedAnswer[] = [];
  let question = "";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const isAnswer = /^a\s*:/i.test(line);
    const body = line.replace(/^[qa]\s*:/i, "").trim();
    if (isAnswer) {
      if (question && body) pairs.push({ q: question, a: body });
      question = "";
    } else {
      question = body;
    }
  }
  return readVerified(pairs);
}

export function formatVerifiedLines(pairs: VerifiedAnswer[]): string {
  return pairs.map((p) => `Q: ${p.q}\nA: ${p.a}`).join("\n\n");
}

export function readKnowledge(raw: Record<string, unknown> | null | undefined): AssistantKnowledge {
  const k = (raw ?? {}) as AssistantKnowledge;
  return {
    notes: typeof k.notes === "string" ? k.notes : "",
    sources: Array.isArray(k.sources) ? (k.sources as KnowledgeSource[]) : [],
    verified: readVerified(k.verified),
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
  // truncate. When over the cap keep the highest-priority sources (stable sort,
  // so the common all-default case keeps the previous first-N-by-insertion
  // behavior). This way an important source never loses its slot to ordering.
  const ranked = [...sources].sort((x, y) => (y.priority ?? 0) - (x.priority ?? 0));

  // Verified answers merge by question, with the later side winning: an
  // assistant-level correction should override the organization default rather
  // than leave the agent holding two answers to the same question.
  const byQuestion = new Map<string, VerifiedAnswer>();
  for (const pair of [...(a.verified ?? []), ...(b.verified ?? [])]) {
    byQuestion.set(pair.q.toLowerCase(), pair);
  }

  return {
    notes,
    sources: ranked.slice(0, MAX_SOURCES),
    verified: [...byQuestion.values()].slice(0, MAX_VERIFIED),
  };
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
