
export interface CancellationContext {
  businessName: string;
  whenLabel: string;
  reason: string;
  offerRebook: boolean;
  callbackNumber?: string;
}

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

export function composeCancellationSms(ctx: CancellationContext): string {
  const reasonClause = ctx.reason.trim() ? ` (${ctx.reason.trim()})` : "";
  const base = `${ctx.businessName}: we're sorry, but your appointment on ${ctx.whenLabel} has been cancelled${reasonClause}.`;
  const tail = ctx.offerRebook
    ? ` We'd love to find you another time - please call us${ctx.callbackNumber ? ` on ${ctx.callbackNumber}` : ""} to rebook.`
    : ` Please call us${ctx.callbackNumber ? ` on ${ctx.callbackNumber}` : ""} if you have any questions.`;
  return base + tail;
}

export interface CallOutcome {
  durationSecs: number;
  callerTurns: number;
}

const ANSWERED_MIN_SECS = 8;

export function wasAnswered(outcome: CallOutcome): boolean {
  return outcome.durationSecs >= ANSWERED_MIN_SECS && outcome.callerTurns >= 1;
}
