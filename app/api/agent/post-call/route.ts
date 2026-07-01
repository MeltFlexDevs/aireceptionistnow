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
  const durationSeconds = Number(metadata.call_duration_secs ?? 0) || undefined;

  const repo = getRepository();
  const config = toNumber ? await repo.resolveInboundNumber(toNumber) : null;
  if (!config) return json({ error: "unknown number" }, 404);

  const callId = await repo.getOrCreateAgentCall({
    conversationId,
    businessId: config.businessId,
    numberId: config.numberId,
    from: fromNumber,
    to: toNumber,
  });

  // Persist the transcript ElevenLabs captured (tier A doesn't stream turns live
  // like tier B, so this is where they land).
  const turns = mapTurns(data.transcript);
  for (const turn of turns) {
    await repo
      .appendTurn(callId, turn)
      .catch((e) => console.error("[agent/post-call] append turn", e));
  }

  await repo
    .finalizeCall(callId, { status: "completed", durationSeconds })
    .catch((e) => console.error("[agent/post-call] finalize", e));

  // Summary + email/CRM delivery, identical to tier B.
  await runPostCall(callId, repo);

  return json({ ok: true });
}
