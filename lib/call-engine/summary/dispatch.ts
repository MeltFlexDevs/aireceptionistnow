import { pushCallToCrm, resolveCrmTargets } from "../integrations/crm";
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

    await Promise.allSettled([
      deliverEmail(callId, loaded.config, summary, loaded.turns, loaded.actions, loaded.from),
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
