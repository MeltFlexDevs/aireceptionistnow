import { after } from "next/server";
import { verifyElevenLabsSignature } from "@/lib/call-engine/agent/auth";
import { getRepository } from "@/lib/call-engine/persistence/supabase";
import { runPostCall } from "@/lib/call-engine/summary/dispatch";
import { wasAnswered } from "@/lib/call-engine/cancellation";
import {
  findBookingByNotifyConversation,
  resolveCancellationNotify,
} from "@/lib/dashboard/booking-cancel";
import type { TranscriptTurn } from "@/lib/call-engine/types";

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

  const demoAgentId = (process.env.ELEVENLABS_AGENT_ID ?? "").trim();
  const agentId = pick(data, ["agent_id"]);
  if (demoAgentId && agentId === demoAgentId) {
    return json({ ok: true, skipped: "demo" });
  }

  const metadata = (data.metadata as Record<string, unknown>) ?? {};
  const phone = (metadata.phone_call as Record<string, unknown>) ?? {};
  const toNumber = pick(phone, ["agent_number", "called_number", "to_number"]);
  const fromNumber = pick(phone, ["external_number", "caller_id", "from_number"]);
  const direction = pick(phone, ["direction"]) === "outbound" ? "outbound" : "inbound";
  const durationSeconds = Number(metadata.call_duration_secs ?? 0) || undefined;

  if (direction === "outbound") {
    const notify = await findBookingByNotifyConversation(conversationId).catch(() => null);
    if (notify) {
      const callerTurns = Array.isArray(data.transcript)
        ? (data.transcript as { role?: string; message?: string; text?: string }[]).filter(
            (t) => t.role === "user" && (t.message ?? t.text ?? "").trim(),
          ).length
        : 0;
      const answered = wasAnswered({ durationSecs: durationSeconds ?? 0, callerTurns });
      after(() => resolveCancellationNotify(notify.actionId, notify.state, answered));
    }
  }

  const repo = getRepository();

  let callId: string;
  let claimed: boolean;
  try {
    const config = toNumber ? await repo.resolveInboundNumber(toNumber) : null;
    if (!config) return json({ error: "unknown number" }, 404);
    callId = await repo.getOrCreateAgentCall({
      conversationId,
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

  if (!claimed) return json({ ok: true, deduped: true });

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

  // Summary + email + CRM push never change this response (runPostCall catches
  // its own errors), so run them after it - the webhook answers as soon as the
  // transcript is persisted instead of waiting out a Gemini summarization.
  after(() => runPostCall(callId, repo));

  return json({ ok: true });
}
