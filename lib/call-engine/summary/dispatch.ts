import type { CallRepository } from "../persistence/types";
import type { CallSummary } from "../types";
import { summarizeCall } from "./summarize";

// Runs after a call ends: load the transcript, summarize it, and persist the
// summary/outcome/sentiment. Calendar bookings and other actions are dispatched
// live during the call (see the session's tool handlers), so this step is
// purely the recap that lands on the dashboard.

export async function runPostCall(
  callId: string,
  repo: CallRepository,
): Promise<CallSummary | null> {
  try {
    const loaded = await repo.getCallForSummary(callId);
    if (!loaded) return null;
    const summary = await summarizeCall(loaded.turns, loaded.config);
    await repo.saveSummary(callId, summary);
    return summary;
  } catch (err) {
    console.error(`[postcall] failed for ${callId}`, err);
    return null;
  }
}
