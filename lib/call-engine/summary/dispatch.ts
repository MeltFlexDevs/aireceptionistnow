import { pushCallToCrm, readCrmConfig } from "../integrations/crm";
import type { CallRepository } from "../persistence/types";
import type { CallSummary, NumberConfig, TranscriptTurn } from "../types";
import { readEmailConfig, sendTranscriptEmail } from "./email";
import { summarizeCall } from "./summarize";

// Runs after a call ends: load the transcript, summarize it, persist the
// summary/outcome/sentiment, then fan out the optional per-assistant
// deliveries (email transcript, CRM/ERP push). Calendar bookings and other
// live actions are dispatched during the call (see the session tool handlers);
// this step is the recap that lands on the dashboard and external systems.

export async function runPostCall(
  callId: string,
  repo: CallRepository,
): Promise<CallSummary | null> {
  try {
    const loaded = await repo.getCallForSummary(callId);
    if (!loaded) return null;
    const summary = await summarizeCall(loaded.turns, loaded.config);
    await repo.saveSummary(callId, summary);

    // Best-effort external deliveries — never let one break the others or the
    // summary that's already saved.
    await Promise.allSettled([
      deliverEmail(callId, loaded.config, summary, loaded.turns),
      deliverCrm(callId, loaded.config, loaded.from, summary, loaded.turns),
    ]);

    return summary;
  } catch (err) {
    console.error(`[postcall] failed for ${callId}`, err);
    return null;
  }
}

async function deliverEmail(
  callId: string,
  config: NumberConfig,
  summary: CallSummary,
  turns: TranscriptTurn[],
): Promise<void> {
  const cfg = readEmailConfig(config.routing);
  if (!cfg) return;
  const res = await sendTranscriptEmail(cfg, { config, summary, turns });
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
  const crm = readCrmConfig(config.routing);
  if (!crm) return;
  const res = await pushCallToCrm(crm, {
    callId,
    businessName: config.businessName,
    line: config.label,
    to: config.e164,
    from: from || undefined,
    summary,
    transcript: turns.map((t) => ({ role: t.role, text: t.text })),
  });
  if (!res.ok) {
    console.error(`[postcall] crm push failed for ${callId}: ${res.error}`);
  }
}
