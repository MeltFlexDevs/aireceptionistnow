/**
 * A paused receptionist takes messages only.
 *
 * assistants.enabled = false is the owner's pause switch (app and dashboard).
 * The call still connects and the AI still answers - its minutes are still
 * paid - but with a closed greeting, a message-taking prompt and no transfer.
 * The booking and calendar tools also refuse while paused, so a model that
 * ignores the prompt still cannot book.
 *
 * Kept free of I/O so it can be tested directly - see paused.test.ts.
 */
import type { ActionContext } from "./actions";
import { disclosureLine, parseDisclosure } from "./policy";
import type { NumberConfig } from "./types";

/** The opening line, in English. app/api/agent/init/route.ts translates it into the call language. */
export function pausedGreeting(businessName: string): string {
  return `Hi, you've reached ${businessName}. We're closed right now, but I can take a message for the team.`;
}

/** The {{transfer_policy}} value while paused: nobody can take a hand-off. */
export const PAUSED_TRANSFER_POLICY =
  "No one is available to take a transferred call right now. Never use transfer_to_number; offer to take a message instead.";

/** What book_appointment and check_availability answer while paused. */
export const PAUSED_TOOL_RESULT =
  "We're closed right now, so booking and availability checks are not available. Don't book or promise any time. Tell the caller the team can't book right now and offer to take a message with take_message so the team can call them back.";

/**
 * Replaces the synced prompt for one call (agent.prompt.prompt is allow-listed
 * for override in sync.ts platformSettings). callerId is the caller's number
 * from the call-start webhook, empty when withheld.
 */
export function pausedPrompt(
  config: Pick<NumberConfig, "businessName" | "routing">,
  callerId: string,
): string {
  const name = config.businessName;
  // Only digits and "+" reach the prompt: the number is spoken data, never instructions.
  const number = callerId.replace(/[^\d+]/g, "");
  const callback = number
    ? `Ask whether the number they are calling from is the best one to call them back on. If yes, pass ${number} as callback_number; if not, ask for the right number.`
    : "Their number is not shown, so ask for the best number to call them back on.";
  return [
    `You are the receptionist answering the phone for ${name}. Speak AS the business, in the first person plural ("we", "our"). ${name} is closed right now and nobody can take the call, so the only thing you can do on this call is take a message for the team.`,
    "Your replies are spoken aloud over the phone: keep each reply to a sentence or two, ask one question at a time, and never use markdown, lists, emoji or symbols.",
    "Always reply in the language the caller is speaking. If they switch languages, switch with them.",
    disclosureLine(parseDisclosure(config.routing), name),
    `Take the message in this order. First get the caller's name. Then confirm a callback number. ${callback} Then ask what the call is about, in their own words.`,
    "Once you have these, say one short line about passing it on and use take_message with caller_name, callback_number and message. Set urgency high only when the caller says it is urgent or describes something time-critical.",
    `Do not book appointments, check availability or make promises for the team, and do not say when the team will call back. Never transfer the call. ${PAUSED_TRANSFER_POLICY} Use no tool other than take_message and end_call. If the caller asks for anything else, say we're closed right now and offer to take a message.`,
    `When the message is recorded, tell the caller the team will get back to them, thank them for calling ${name}, and use end_call. If they don't want to leave a message, close politely and use end_call.`,
  ].join("\n\n");
}

type ToolRun = (ctx: ActionContext, body: Record<string, unknown>) => Promise<string>;

/** Wraps a booking or calendar tool: while paused it answers PAUSED_TOOL_RESULT and never runs the tool. */
export function unlessPaused(run: ToolRun): ToolRun {
  return (ctx, body) => (ctx.config.paused ? Promise.resolve(PAUSED_TOOL_RESULT) : run(ctx, body));
}
