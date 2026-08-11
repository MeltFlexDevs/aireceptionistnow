import { sendPushToOwner } from "@/lib/mobile/push";

import { receiptsEnabled } from "../actions";
import { pushCallToCrm, resolveCrmTargets } from "../integrations/crm";
import { deservesReceipt, receiptSmsBody, receiptUrl } from "../receipts";
import { sendSms } from "../telephony";
import { formatPhone } from "../voice/phone-language";
import type { CallRepository } from "../persistence/types";
import type { CallAction, CallSummary, NumberConfig, TranscriptTurn } from "../types";
import { readEmailConfig, sendTranscriptEmail } from "./email";
import { summarizeCall } from "./summarize";

export async function runPostCall(
  callId: string,
  repo: CallRepository,
): Promise<CallSummary | null> {
  try {
    const loaded = await repo.getCallForSummary(callId);
    if (!loaded) return null;
    const summary = await summarizeCall(loaded.turns, loaded.config, loaded.actions, loaded.from);
    await repo.saveSummary(callId, summary);

    // What the caller asked for and did not get, harvested from the same pass.
    // Awaited before the fan-out only because it is a single insert and the
    // dashboard should never show a summarized call whose signals are still in
    // flight; it swallows its own errors.
    await repo.saveDemandSignals(callId, loaded.ownerId, summary.demandSignals);

    await Promise.allSettled([
      deliverEmail(callId, loaded.config, summary, loaded.turns, loaded.actions, loaded.from),
      deliverCrm(callId, loaded.config, loaded.from, summary, loaded.turns),
      deliverPush(callId, loaded.ownerId, summary, loaded.actions, loaded.from),
      deliverReceipt(callId, repo, loaded.config, summary, loaded.actions, loaded.from),
    ]);

    return summary;
  } catch (err) {
    console.error(`[postcall] failed for ${callId}`, err);
    return null;
  }
}

/**
 * The native app's post-call alert.
 *
 * Deliberately the summarized call, not the ringing one: a notification that
 * fires while the phone is still being answered tells the operator nothing they
 * can act on, and the assistant is mid-conversation anyway. By this point there
 * is an outcome and a one-line summary worth reading on a lock screen.
 *
 * The body leads with what the call produced, because that is the only part
 * that changes what the operator does next - a booking needs nothing, a message
 * or a missed booking needs a call back.
 */
async function deliverPush(
  callId: string,
  ownerId: string | null,
  summary: CallSummary,
  actions: CallAction[],
  from: string,
): Promise<void> {
  if (!ownerId) return;

  const booked = actions.some((a) => a.type === "booking" && a.status === "done");
  const failedBooking = actions.some((a) => a.type === "booking" && a.status === "failed");
  const messaged = actions.some((a) => a.type === "message" && a.status === "done");

  // One line, chosen by what actually happened rather than by the model's
  // outcome label: a caller whose booking silently failed is the case worth
  // interrupting someone for, and `outcome` alone does not distinguish it.
  let title: string;
  let category: "call" | "booking" | "escalation" = "call";
  if (failedBooking) {
    title = "Booking failed - needs you";
    category = "escalation";
  } else if (summary.needsReview) {
    title = "Call worth a read";
    category = "escalation";
  } else if (booked) {
    title = "New appointment booked";
    category = "booking";
  } else if (messaged) {
    title = "New message from a caller";
  } else {
    title = "Call answered";
  }

  // Grouped, not raw E.164: this line is read at a glance on a lock screen,
  // and it is the same formatting the call list uses for the same number.
  const caller = from ? formatPhone(from) : "Unknown caller";
  // Lock screens truncate hard; keep the caller visible by capping the summary
  // rather than letting the OS cut mid-word at an arbitrary point.
  const line = summary.summary.length > 140 ? `${summary.summary.slice(0, 137)}...` : summary.summary;

  await sendPushToOwner(ownerId, {
    title,
    body: line ? `${caller} - ${line}` : caller,
    path: `/call/${callId}`,
    category,
  });
}

/**
 * The caller's copy.
 *
 * Everything else in this fan-out tells the business what happened. This tells
 * the person who rang, and it is the only one of the four that can come back
 * with an answer - the receipt page carries a correction box, and a correction
 * is the single piece of information in this product that comes from the one
 * party who actually knows whether the assistant got it right.
 *
 * Three things keep it from becoming spam. It only fires for calls that
 * produced something worth writing down (`deservesReceipt`). It skips any call
 * that already carried the link on its booking confirmation, so nobody is texted
 * twice about one conversation. And it sends nothing at all when the recap is
 * empty, because a receipt with no content is a link to a blank page.
 */
async function deliverReceipt(
  callId: string,
  repo: CallRepository,
  config: NumberConfig,
  summary: CallSummary,
  actions: CallAction[],
  from: string,
): Promise<void> {
  if (!receiptsEnabled(config.routing)) return;
  if (!from) return;
  if (!summary.callerRecap) return;
  if (!deservesReceipt(summary.outcome, summary.needsReview)) return;

  // A completed booking already texted this caller, with the receipt link
  // appended (see sendBookingConfirmationSms). Sending again would be the
  // second message about the same call.
  const alreadyTexted = actions.some((a) => a.type === "booking" && a.status === "done");
  if (alreadyTexted) return;

  const token = await repo.ensureReceipt(callId, "live");
  if (!token) return;

  try {
    await sendSms(
      from,
      config.e164,
      receiptSmsBody(config.businessName, receiptUrl(token)),
      config.businessName,
    );
    await repo.markReceiptSent(token);
  } catch (err) {
    // Best-effort by design: the business already has its summary, its email
    // and its push. A carrier that rejects the message costs the caller a
    // receipt, not the account its record of the call.
    console.error(`[postcall] receipt sms failed for ${callId}`, err);
  }
}

async function deliverEmail(
  callId: string,
  config: NumberConfig,
  summary: CallSummary,
  turns: TranscriptTurn[],
  actions: CallAction[],
  from: string,
): Promise<void> {
  const cfg = readEmailConfig(config.routing);
  if (!cfg) return;
  const booking = actions.find((a) => a.type === "booking" && a.status === "done");
  const eventUrl =
    booking && typeof booking.payload.event_url === "string" ? booking.payload.event_url : "";
  const appBase = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  // Prefer the provider's own event link; fall back to the in-app calendar.
  // Only when the call actually booked something.
  const bookingUrl = eventUrl || (booking && appBase ? `${appBase}/dashboard/calendar` : "");
  const res = await sendTranscriptEmail(cfg, { config, summary, turns, from, bookingUrl });
  if (!res.ok && !res.skipped) {
    console.error(`[postcall] email transcript failed for ${callId}: ${res.error}`);
  }
}

async function deliverCrm(
  callId: string,
  config: NumberConfig,
  from: string,
  summary: CallSummary,
  turns: TranscriptTurn[],
): Promise<void> {
  const targets = resolveCrmTargets(config.routing, config.integrations);
  if (targets.length === 0) return;

  const payload = {
    callId,
    businessName: config.businessName,
    line: config.label,
    to: config.e164,
    from: from || undefined,
    summary,
    transcript: turns.map((t) => ({ role: t.role, text: t.text })),
  };
  await Promise.allSettled(
    targets.map(async (crm) => {
      const res = await pushCallToCrm(crm, payload);
      if (!res.ok) {
        console.error(`[postcall] crm push to "${crm.name}" failed for ${callId}: ${res.error}`);
      }
    }),
  );
}
