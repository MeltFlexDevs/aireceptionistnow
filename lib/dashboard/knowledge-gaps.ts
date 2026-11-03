import type { VerifiedAnswer } from "../knowledge/sources";

/**
 * Turning an answered knowledge gap into a verified answer.
 *
 * Shared by the web action (answerKnowledgeGapAction) and the mobile knowledge
 * route, so a gap answered on the phone lands exactly where the dashboard puts
 * it. Pure: the claim on the signal (markDemandAnswered) and the save stay with
 * the callers.
 */

/** Longest answer the mobile route accepts - the same cap readVerified applies. */
export const MAX_GAP_ANSWER_CHARS = 600;

/**
 * The new pair goes first; an existing pair for the same question (compared
 * trimmed and case-insensitively) is dropped rather than kept as a second
 * answer the model would have to choose between; the list is capped at `max`,
 * which drops the oldest tail.
 */
export function mergeVerifiedAnswer(
  verified: VerifiedAnswer[],
  question: string,
  answer: string,
  max: number,
): VerifiedAnswer[] {
  const key = question.trim().toLowerCase();
  return [
    { q: question, a: answer },
    ...verified.filter((v) => v.q.trim().toLowerCase() !== key),
  ].slice(0, max);
}
