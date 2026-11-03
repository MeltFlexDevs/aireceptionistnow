import { renderKnowledgeMarkdown } from "../knowledge/sources";

// Mirrors the empty check in summarizeOrgKnowledge: with no notes, sources or
// description there is nothing to summarize. Anything else means the summary
// failed or is not ready, and the owner must not be told to add content again.
export function hasDigestInput(org: {
  description?: string | null;
  knowledge?: Record<string, unknown> | null;
}): boolean {
  return Boolean(renderKnowledgeMarkdown(org.knowledge) || org.description?.trim());
}

export function digestText(
  summary: string | null,
  hasInput: boolean,
  k: { digestEmpty: string; digestUnavailable: string },
): string {
  return summary || (hasInput ? k.digestUnavailable : k.digestEmpty);
}
