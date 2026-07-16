// Pure logic for canceling a booking and notifying the customer. No I/O here -
// the orchestration (place the call, run the calendar cancel, send the SMS) lives
// in the server action and the post-call webhook; this file is the testable core:
// what the outbound call says, what the SMS says, and whether a call was answered.

export interface CancellationContext {
  businessName: string;
  /** Human date/time of the cancelled appointment, e.g. "Friday, July 17 at 10:00 AM". */
  whenLabel: string;
  /** Why it's being cancelled, in the owner's words. May be empty. */
  reason: string;
  /** Whether the assistant should offer to rebook on the call / in the SMS. */
  offerRebook: boolean;
  /** A number the customer can call back on (the assistant's line), for the SMS. */
  callbackNumber?: string;
}

/**
 * The override the outbound call runs with: a first message spoken verbatim, and
 * a prompt that tells the agent its goal. English base - placeAgentCall localizes
 * the first message to the caller's language and the multilingual agent follows
 * the English prompt while replying in their language (same split as inbound).
 */
export function composeCancellationScript(ctx: CancellationContext): {
  firstMessage: string;
  prompt: string;
} {
  const reasonClause = ctx.reason.trim() ? ` because ${ctx.reason.trim()}` : "";

  const firstMessage = ctx.offerRebook
    ? `Hi, this is ${ctx.businessName}. I'm sorry, but we have to cancel your appointment on ${ctx.whenLabel}${reasonClause}. I'd be glad to find you another time that works - is now a good moment to sort that out?`
    : `Hi, this is ${ctx.businessName}. I'm sorry, but we have to cancel your appointment on ${ctx.whenLabel}${reasonClause}. Please call us back whenever suits you and we'll be happy to rebook.`;

  const promptParts = [
    `You are calling on behalf of ${ctx.businessName} to tell a customer their appointment on ${ctx.whenLabel} has been cancelled.`,
    ctx.reason.trim()
      ? `The reason given is: ${ctx.reason.trim()}. Share it briefly and warmly if they ask, without over-explaining.`
      : `If they ask why, say only that something came up on our side and apologize; do not invent a specific reason.`,
    "Be brief, warm, and apologetic - this is bad news and their time matters.",
    ctx.offerRebook
      ? "Offer to rebook: use check_availability to find a free time they like, then book_appointment once they agree. If they can't decide now, tell them to call back anytime and take a message with take_message so we can follow up."
      : "Do not book anything on this call. If they want a new time, tell them to call back or take a message with take_message.",
    "If you reach a voicemail or the person clearly isn't available, keep it short: state who's calling, that the appointment on the given date is cancelled, and to call back to rebook. Then end the call.",
    "End the call once they've understood, using end_call.",
  ];

  return { firstMessage, prompt: promptParts.join(" ") };
}

/**
 * The SMS sent when the customer doesn't pick up. Kept to one or two segments and
 * plain text (no links) so it lands the same on any handset.
 */
export function composeCancellationSms(ctx: CancellationContext): string {
  const reasonClause = ctx.reason.trim() ? ` (${ctx.reason.trim()})` : "";
  const base = `${ctx.businessName}: we're sorry, but your appointment on ${ctx.whenLabel} has been cancelled${reasonClause}.`;
  const tail = ctx.offerRebook
    ? ` We'd love to find you another time - please call us${ctx.callbackNumber ? ` on ${ctx.callbackNumber}` : ""} to rebook.`
    : ` Please call us${ctx.callbackNumber ? ` on ${ctx.callbackNumber}` : ""} if you have any questions.`;
  return base + tail;
}

/** What ElevenLabs reports about a finished outbound call, as far as we need it. */
export interface CallOutcome {
  durationSecs: number;
  /** Number of caller (non-agent) turns with real speech. */
  callerTurns: number;
}

// Below this, a "call" is almost certainly ring-out, voicemail hang-up, or an
// instant drop - not a conversation. Tuned generously: a genuine "cancel my
// appointment" exchange runs well past this even when curt.
const ANSWERED_MIN_SECS = 8;

/**
 * Whether the customer actually engaged with the cancellation call. Used to
 * decide the SMS fallback: no real engagement -> send the text.
 *
 * Requires BOTH a non-trivial duration AND at least one caller turn: a voicemail
 * greeting can burn 15 seconds with zero caller speech, and a 2-second "hello?
 * *click*" has a turn but no duration. Only when both clear it do we treat the
 * message as delivered by voice and skip the SMS.
 */
export function wasAnswered(outcome: CallOutcome): boolean {
  return outcome.durationSecs >= ANSWERED_MIN_SECS && outcome.callerTurns >= 1;
}
