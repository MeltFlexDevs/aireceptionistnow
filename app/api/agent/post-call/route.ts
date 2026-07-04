import { verifyElevenLabsSignature } from "@/lib/call-engine/agent/auth";
import { getRepository } from "@/lib/call-engine/persistence/supabase";
import { runPostCall } from "@/lib/call-engine/summary/dispatch";
import type { TranscriptTurn } from "@/lib/call-engine/types";

// Tier-A post-call webhook. ElevenLabs posts the full transcript when a call
// ends (signed with ELEVENLABS_WEBHOOK_SECRET). We persist the turns against the
// conversation's call row, finalize it, and run the SAME post-call pipeline as
// tier B (summary + email/CRM delivery) so both tiers land identically on the
// dashboard.

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v) return v;
  }
  return "";
}

interface RawTurn {
  role?: string;
  message?: string;
  text?: string;
  time_in_call_secs?: number;
  conversation_turn_metrics?: { metrics?: Record<string, { elapsed_time?: number }> };
}

/**
 * Median agent reply latency (ms) across the call — the "voice latency" the
 * analytics page charts. ElevenLabs reports per-turn stage timings (LLM TTFB,
 * TTS, …) under conversation_turn_metrics.metrics; we take each agent turn's
 * slowest stage as its end-to-end reply time and return the median. undefined
 * when no turn carries metrics (older calls / tier-B), so we store nothing.
 *
 * ponytail: slowest-stage-per-turn is a proxy for end-to-end latency; pin a
 * specific metric key here once real payloads show which one is authoritative.
 */
function medianReplyLatencyMs(raw: unknown): number | undefined {
  if (!Array.isArray(raw)) return undefined;
  const perTurnMs: number[] = [];
  for (const entry of raw as RawTurn[]) {
    if (entry.role === "user") continue; // caller turns have no reply latency
    const metrics = entry.conversation_turn_metrics?.metrics;
    if (!metrics) continue;
    let maxSecs = 0;
    for (const m of Object.values(metrics)) {
      const s = typeof m?.elapsed_time === "number" ? m.elapsed_time : 0;
      if (s > maxSecs) maxSecs = s;
    }
    if (maxSecs > 0) perTurnMs.push(maxSecs * 1000);
  }
  if (perTurnMs.length === 0) return undefined;
  perTurnMs.sort((a, b) => a - b);
  const mid = Math.floor(perTurnMs.length / 2);
  const med =
    perTurnMs.length % 2 ? perTurnMs[mid] : (perTurnMs[mid - 1] + perTurnMs[mid]) / 2;
  return Math.round(med);
}

/** Map ElevenLabs transcript entries to our turn shape. Their roles are
 *  "user"/"agent"; anything not the caller is treated as the assistant. */
function mapTurns(raw: unknown): TranscriptTurn[] {
  if (!Array.isArray(raw)) return [];
  const turns: TranscriptTurn[] = [];
  for (const entry of raw as RawTurn[]) {
    const text = (entry.message ?? entry.text ?? "").trim();
    if (!text) continue;
    turns.push({
      role: entry.role === "user" ? "caller" : "assistant",
      text,
      tsMs: Math.round((entry.time_in_call_secs ?? 0) * 1000),
    });
  }
  return turns;
}

export async function POST(req: Request): Promise<Response> {
  const raw = await req.text();
  if (!verifyElevenLabsSignature(raw, req.headers.get("elevenlabs-signature"))) {
    return json({ error: "invalid signature" }, 401);
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }

  const data = (payload.data as Record<string, unknown>) ?? payload;
  const conversationId = pick(data, ["conversation_id"]);
  if (!conversationId) return json({ error: "missing conversation_id" }, 400);

  const metadata = (data.metadata as Record<string, unknown>) ?? {};
  const phone = (metadata.phone_call as Record<string, unknown>) ?? {};
  const toNumber = pick(phone, ["agent_number", "called_number", "to_number"]);
  const fromNumber = pick(phone, ["external_number", "caller_id", "from_number"]);
  // Telephony payloads carry the real direction; agent_number is the assistant's
  // own connected number either way (external_number is the other party), so an
  // outbound test/demo call still resolves — record it as outbound, not as a
  // customer call. Anything unexpected/absent defaults to inbound.
  const direction = pick(phone, ["direction"]) === "outbound" ? "outbound" : "inbound";
  const durationSeconds = Number(metadata.call_duration_secs ?? 0) || undefined;

  const repo = getRepository();

  // Resolve + claim. A transient DB error here returns 500 so ElevenLabs retries;
  // the atomic claim makes that retry safe (only the first delivery processes).
  let callId: string;
  let claimed: boolean;
  try {
    const config = toNumber ? await repo.resolveInboundNumber(toNumber) : null;
    if (!config) return json({ error: "unknown number" }, 404);
    callId = await repo.getOrCreateAgentCall({
      conversationId,
      businessId: config.businessId,
      numberId: config.numberId,
      from: fromNumber,
      to: toNumber,
      direction,
    });
    claimed = await repo.claimAgentCallCompletion(callId);
  } catch (err) {
    console.error("[agent/post-call] resolve/claim failed", err);
    return json({ error: "temporarily unavailable" }, 500);
  }

  // A retry (or duplicate delivery) — already processed. No-op so we don't
  // duplicate transcript turns or re-send summary emails / CRM pushes.
  if (!claimed) return json({ ok: true, deduped: true });

  // First delivery: persist the transcript and duration. If either fails we
  // release the claim and return 500 so ElevenLabs' retry reprocesses instead
  // of being answered as a duplicate — appendTurns replaces the call's turns,
  // so the retry can't duplicate them.
  try {
    await repo.appendTurns(callId, mapTurns(data.transcript));
    const medianLatencyMs = medianReplyLatencyMs(data.transcript);
    await repo.finalizeCall(callId, {
      status: "completed",
      durationSeconds,
      medianLatencyMs,
    });
  } catch (err) {
    console.error("[agent/post-call] enrichment failed", err);
    await repo
      .releaseAgentCallCompletion(callId)
      .catch((e) => console.error("[agent/post-call] release claim", e));
    return json({ error: "temporarily unavailable" }, 500);
  }

  // Summary + email/CRM delivery log their own failures (runPostCall never
  // throws); a webhook retry here would risk double emails/CRM pushes.
  await runPostCall(callId, repo);

  return json({ ok: true });
}
