import { getRepository } from "@/lib/call-engine/persistence/supabase";
import { verifyElevenLabsSignature, verifyToolSecret } from "@/lib/call-engine/agent/auth";
import { localizeGreeting } from "@/lib/call-engine/llm/greeting";
import { voiceForLanguage, baseLanguage } from "@/lib/call-engine/voice/catalog";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";

const OVERRIDE_BUDGET_MS = 1500;

function withDeadline<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

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

function deepPick(obj: Record<string, unknown>, keys: string[]): string {
  const top = pick(obj, keys);
  if (top) return top;
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const nested = pick(v as Record<string, unknown>, keys);
      if (nested) return nested;
    }
  }
  return "";
}

export async function POST(req: Request): Promise<Response> {
  const raw = await req.text();
  if (
    !verifyToolSecret(req.headers) &&
    !verifyElevenLabsSignature(raw, req.headers.get("elevenlabs-signature"))
  ) {
    return json({ error: "unauthorized" }, 401);
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }

  const calledNumber = deepPick(payload, [
    "called_number", "agent_number", "to_number", "system__called_number",
  ]);
  const callerId = deepPick(payload, [
    "caller_id", "from_number", "external_number", "system__caller_id",
  ]);

  let config = null;
  try {
    config = calledNumber
      ? await getRepository().resolveInboundNumber(calledNumber)
      : null;
  } catch (err) {
    // A DB hiccup must not 500 the call-start webhook - fall through to defaults.
    console.error("[agent/init] resolve failed", err);
  }
  // No overrides ⇒ ElevenLabs keeps the agent's configured defaults. Safe fallback.
  if (!config) return json({ type: "conversation_initiation_client_data" });

  const language = config.multilingual ? languageFromPhone(callerId) : null;
  console.log("[agent/init]", {
    called: calledNumber,
    caller: callerId,
    language: language ?? "(agent default)",
    multilingual: config.multilingual,
  });
  const pinnedVoices =
    (config.routing as { voiceByLanguage?: Record<string, string> })?.voiceByLanguage ?? {};
  const pinnedVoice = language ? (pinnedVoices[baseLanguage(language)] ?? "").trim() : "";
  const [firstMessage, voiceId] = language
    ? await Promise.all([
        withDeadline(localizeGreeting(config.greeting, language), OVERRIDE_BUDGET_MS, config.greeting),
        pinnedVoice
          ? Promise.resolve(pinnedVoice)
          : withDeadline(voiceForLanguage(language, config.voiceId, true), OVERRIDE_BUDGET_MS, config.voiceId),
      ])
    : [config.greeting, null];

  const agentOverride: Record<string, unknown> = { first_message: firstMessage };
  if (language) agentOverride.language = language;

  const overrides: Record<string, unknown> = { agent: agentOverride };
  if (language && voiceId) {
    overrides.tts = { voice_id: voiceId };
  }

  return json({
    type: "conversation_initiation_client_data",
    // Handy for the agent prompt + surfaced back on tool calls.
    dynamic_variables: {
      business_name: config.businessName,
      to_number: config.e164,
      from_number: callerId,
    },
    conversation_config_override: overrides,
  });
}
