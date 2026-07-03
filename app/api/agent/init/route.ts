import { getRepository } from "@/lib/call-engine/persistence/supabase";
import { verifyElevenLabsSignature } from "@/lib/call-engine/agent/auth";
import { localizeGreeting } from "@/lib/call-engine/llm/greeting";
import { voiceForLanguage } from "@/lib/call-engine/voice/catalog";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";

// Tier-A conversation-initiation webhook. ElevenLabs calls this when a call
// starts (signed with ELEVENLABS_WEBHOOK_SECRET) and applies the overrides we
// return before the agent speaks. We use it to greet the caller in the language
// guessed from their number and match the voice — the tier-A equivalent of the
// tier-B pre-seed in CallSession. Requires "overrides" to be enabled for the
// agent's first_message / language / voice in the ElevenLabs security settings.

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** ElevenLabs sends caller/called numbers under a few possible keys depending on
 *  the telephony path; read whichever is present. */
function pick(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v) return v;
  }
  return "";
}

/** ElevenLabs' payload shape varies by telephony path — the caller/called numbers
 *  may sit at the top level or one object deep (e.g. under `call` or
 *  `conversation_initiation_client_data`). Check the top level first, then scan
 *  nested objects, so a number tucked one level down still resolves the language. */
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
  if (!verifyElevenLabsSignature(raw, req.headers.get("elevenlabs-signature"))) {
    return json({ error: "invalid signature" }, 401);
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
    // A DB hiccup must not 500 the call-start webhook — fall through to defaults.
    console.error("[agent/init] resolve failed", err);
  }
  // No overrides ⇒ ElevenLabs keeps the agent's configured defaults. Safe fallback.
  if (!config) return json({ type: "conversation_initiation_client_data" });

  // Only detect + override the caller's language when the agent is actually
  // multilingual. An English-only fallback agent (config.multilingual === false)
  // has no language presets, so a non-English override would be ignored or reject
  // the call — greet in the agent's own configured language instead.
  const language = config.multilingual ? languageFromPhone(callerId) : null;
  // One line per call so you can confirm from logs that init fired, saw the
  // caller's number, and picked the language (e.g. +421 → sk). If this never
  // logs, the workspace conversation-init webhook isn't wired — run /api/agent/setup.
  console.log("[agent/init]", {
    called: calledNumber,
    caller: callerId,
    language: language ?? "(agent default)",
    multilingual: config.multilingual,
  });
  const firstMessage = language
    ? await localizeGreeting(config.greeting, language)
    : config.greeting;

  const agentOverride: Record<string, unknown> = { first_message: firstMessage };
  if (language) agentOverride.language = language;

  const overrides: Record<string, unknown> = { agent: agentOverride };
  if (language) {
    overrides.tts = { voice_id: await voiceForLanguage(language, config.voiceId, true) };
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
