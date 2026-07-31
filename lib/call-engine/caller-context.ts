/**
 * "Hi Jane, good to hear from you again."
 *
 * The single biggest thing that stops a call feeling like a machine is being
 * recognised, and the data has been sitting in the calls table all along. This
 * turns the last call from this number into the `{{caller_context}}` dynamic
 * variable the prompt carries.
 *
 * PRIVACY. A phone number is not a person: shared lines, office switchboards and
 * recycled numbers all mean the caller may not be who called last time. So the
 * agent is told to use the name as a warm opener and nothing more - never to
 * read the record back, never to say it "has notes", and never to treat a past
 * call as proof of who is on the line now. Operators who don't want it at all
 * set routing.recognizeCallers = false.
 *
 * Kept free of I/O so the wording can be tested directly - see caller-context.test.ts.
 */

import type { CallerContext } from "./persistence/types";

/** What the variable says when there is nothing to say. Never blank: an empty
 *  dynamic variable would leave the prompt reading "you know: ." */
export const NO_CALLER_CONTEXT = "This number has not called before, as far as you know.";

export function recognizeCallersEnabled(routing: unknown): boolean {
  const r = routing && typeof routing === "object" ? (routing as Record<string, unknown>) : {};
  return r.recognizeCallers !== false;
}

/** "earlier today" / "3 days ago" / "last month" - spoken, not a timestamp. */
function howLongAgo(lastAt: string, now: Date): string {
  const then = Date.parse(lastAt);
  if (!Number.isFinite(then)) return "";
  const days = Math.floor((now.getTime() - then) / 86_400_000);
  if (days <= 0) return "earlier today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return "a couple of months ago";
}

export function callerContextLine(ctx: CallerContext | null, now: Date): string {
  if (!ctx) return NO_CALLER_CONTEXT;

  const when = howLongAgo(ctx.lastAt, now);
  const parts = [`This number has called us before${when ? `, ${when}` : ""}.`];
  if (ctx.name) parts.push(`The person who called then gave their name as ${ctx.name}.`);
  if (ctx.lastSummary) parts.push(`That call: ${ctx.lastSummary}`);

  // Everything after this exists because the failure modes are worse than the
  // benefit: an agent that recites a stranger's history, or insists a caller is
  // someone they are not.
  parts.push(
    "Use this only to sound like you know them: greet them by that name naturally if it fits, and don't ask again for something they already told us." +
      " Do not read any of this back to the caller, do not mention that you have a record or notes, and do not raise the previous call unless it is relevant to what they are asking now." +
      " If anything suggests this is a different person, drop it entirely and treat them as new.",
  );
  return parts.join(" ");
}
