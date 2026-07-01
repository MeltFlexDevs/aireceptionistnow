import { getRepository } from "@/lib/call-engine/persistence/supabase";
import { verifyElevenLabsSignature } from "@/lib/call-engine/agent/auth";
import { localizeGreeting } from "@/lib/call-engine/llm/greeting";
import { bestVoiceForLanguage } from "@/lib/call-engine/voice/catalog";
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

  const calledNumber = pick(payload, ["called_number", "agent_number", "to_number"]);
  const callerId = pick(payload, ["caller_id", "from_number", "external_number"]);

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

  const language = languageFromPhone(callerId);
  const firstMessage = language
    ? await localizeGreeting(config.greeting, language)
    : config.greeting;

  const agentOverride: Record<string, unknown> = { first_message: firstMessage };
  if (language) agentOverride.language = language;

  const overrides: Record<string, unknown> = { agent: agentOverride };
  if (language) {
    overrides.tts = { voice_id: bestVoiceForLanguage(language, config.voiceId) };
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
