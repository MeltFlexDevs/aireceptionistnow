/**
 * Ringing the business when a caller needed a person and there wasn't one.
 *
 * This is the honest answer to "there is no live human backup". We cannot staff
 * a call centre, but we can make sure the humans the business already has find
 * out in seconds rather than whenever someone next opens their inbox. An SMS is
 * already sent (see alertOwner in ./actions.ts); an SMS at 3am does not wake
 * anybody. A ringing phone does.
 *
 * Deliberately conservative:
 *   - OFF by default. It costs a call and it wakes people up.
 *   - Only for urgency "high", which the prompt tells the agent to reserve for
 *     upset callers and time-critical situations.
 *   - Rate limited per line, so one bad night cannot become a paging storm.
 *   - Rings FROM the business's own number, so the page is recognisable.
 *   - Every failure is swallowed and logged. The message itself is already
 *     saved and texted by the time this runs; paging is the third belt, and a
 *     Twilio hiccup here must never surface to the caller or fail the tool.
 */

import { assertUnderCallCaps, placeAgentCall } from "./elevenlabs";
import { pageNumber, parseEscalation } from "./escalation";
import type { NumberConfig } from "./types";

/**
 * One page per line per window. Keyed by number rather than by caller: the
 * point is to protect the person being woken, and five different callers with
 * five real emergencies still only justify one wake-up.
 *
 * In-memory, so it is per serverless instance and therefore a soft limit, not a
 * guarantee. Worth stating plainly: a cold start resets it. A durable counter
 * would mean a DB round trip on a path that is already best-effort, and the
 * failure it would prevent (two pages instead of one) is mild.
 */
const PAGE_COOLDOWN_MS = 10 * 60_000;
const lastPagedAt = new Map<string, number>();

export function shouldPage(urgency: string): boolean {
  return urgency.trim().toLowerCase() === "high";
}

/** Exported for tests - resets the process-local cooldown. */
export function resetPagingCooldown(): void {
  lastPagedAt.clear();
}

function withinCooldown(key: string, now: number): boolean {
  const previous = lastPagedAt.get(key);
  if (previous !== undefined && now - previous < PAGE_COOLDOWN_MS) return true;
  lastPagedAt.set(key, now);
  // Bound the map: one entry per line, but a long-lived instance serving many
  // tenants should still not grow without limit.
  if (lastPagedAt.size > 500) {
    for (const [k, at] of lastPagedAt) {
      if (now - at >= PAGE_COOLDOWN_MS) lastPagedAt.delete(k);
    }
  }
  return false;
}

export interface PageDetails {
  callerName: string;
  callbackNumber: string;
  message: string;
  /** The caller's own number, used when they gave no callback. */
  from: string;
}

/**
 * What the paging agent says. Short on purpose - somebody has just been woken
 * up, and the only job is to get them the caller, the callback number and the
 * gist before they hang up.
 */
function pageScript(config: NumberConfig, details: PageDetails): { firstMessage: string; prompt: string } {
  const who = details.callerName || "someone";
  const callback = details.callbackNumber || details.from;

  const firstMessage =
    `This is an urgent call alert from your ${config.businessName} phone line.` +
    ` ${who} just called and it was marked urgent.` +
    (callback ? ` You can reach them on ${spellNumber(callback)}.` : "");

  const prompt = [
    `You are placing an urgent alert call on behalf of ${config.businessName}. The person you are calling is the business owner or the on-call contact - not a customer.`,
    "Your only job is to pass on one urgent message and let them go. Be brief, calm and clear.",
    `The message: ${who} called${callback ? ` on ${callback}` : ""} and said: "${details.message}".`,
    "If they ask you to repeat any of it, repeat it slowly, especially the callback number - read it digit by digit.",
    "Do not offer to do anything else, do not take a message, and do not book anything. Once they have the details and say they've got it, thank them and use end_call.",
    "If you reach a voicemail, leave the message and the callback number, then end the call.",
  ].join("\n\n");

  return { firstMessage, prompt };
}

/** "+421 900 123 456" read as digits - TTS mangles long numbers otherwise. */
function spellNumber(e164: string): string {
  return e164.replace(/\D/g, "").split("").join(" ");
}

/**
 * Ring the business about an urgent message. Never throws.
 *
 * Returns whether a call was actually placed, so the caller can record it.
 */
export async function pageOwner(config: NumberConfig, details: PageDetails): Promise<boolean> {
  const escalation = parseEscalation(config.routing);
  const to = pageNumber(escalation);
  if (!to) return false;

  // Without both ids the outbound call would fall back to the marketing demo
  // agent and ring from a number the owner does not recognise. Skip instead:
  // the SMS has already gone out, so this is a downgrade, not a loss.
  if (!config.agentId || !config.agentPhoneNumberId) {
    console.warn("[paging] skipped - line has no ElevenLabs agent or number", config.e164);
    return false;
  }

  if (withinCooldown(config.e164, Date.now())) {
    console.log("[paging] suppressed by cooldown", { line: config.e164 });
    return false;
  }

  try {
    // Shares the account-wide outbound budget with test calls and the demo
    // line. A page is more important than either, but not important enough to
    // blow a cap and take the whole account down.
    await assertUnderCallCaps();
    const { firstMessage, prompt } = pageScript(config, details);
    await placeAgentCall(to, {
      agentId: config.agentId,
      agentPhoneNumberId: config.agentPhoneNumberId,
      firstMessage,
      prompt,
      language: config.ownerLocale ? config.ownerLocale.split("-")[0] : undefined,
    });
    console.log("[paging] placed", { line: config.e164, to });
    return true;
  } catch (err) {
    // Let the next urgent message try again rather than burning the window on
    // a page that never happened.
    lastPagedAt.delete(config.e164);
    console.error("[paging] failed", err);
    return false;
  }
}
