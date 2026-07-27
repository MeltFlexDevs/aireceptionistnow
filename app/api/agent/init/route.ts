import { after } from "next/server";
import { calendarAccessFrom } from "@/lib/call-engine/actions";
import { cachedConfig } from "@/lib/call-engine/agent/context";
import { verifyElevenLabsSignature, verifyToolSecret } from "@/lib/call-engine/agent/auth";
import { prefetchAvailability } from "@/lib/call-engine/integrations/availability";
import { resolveCalendarsForAccess } from "@/lib/call-engine/integrations/registry";
import { localizeGreeting } from "@/lib/call-engine/llm/greeting";
import {
  TRANSFER_POLICY_OPEN,
  parseTransferHours,
  transferPolicyLine,
} from "@/lib/call-engine/transfer-hours";
import { withDeadline } from "@/lib/call-engine/net";
import { voiceForLanguage, baseLanguage } from "@/lib/call-engine/voice/catalog";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";

const OVERRIDE_BUDGET_MS = 1500;

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
    // Shared cache with the tool routes (15s freshness so a just-saved
    // greeting is spoken); a slow DB must not stall the greeting.
    config = calledNumber
      ? await withDeadline(cachedConfig(calledNumber, 15_000), 3000, null)
      : null;
  } catch (err) {
    // A DB hiccup must not 500 the call-start webhook - fall through to defaults.
    console.error("[agent/init] resolve failed", err);
  }
  // No overrides ⇒ ElevenLabs keeps the agent's configured defaults. Safe fallback.
  //
  // transfer_policy still has to go out. A prompt synced with transfer hours
  // contains {{transfer_policy}}, and this path is not rare: an OUTBOUND or test
  // call arrives with the dialed customer number as called_number, which resolves
  // to no config at all. Omitting the variable would leave the placeholder
  // unsubstituted in a live prompt. The permissive value is the right default -
  // it is exactly the behaviour before hours existed, and stranding a caller who
  // asks for a human is the worse of the two failures.
  if (!config) {
    return json({
      type: "conversation_initiation_client_data",
      dynamic_variables: { transfer_policy: TRANSFER_POLICY_OPEN },
    });
  }

  // Preload after responding: warm calendar tokens + store busy windows so the
  // first mid-call availability check answers from one indexed read.
  const cfg = config;
  after(() =>
    prefetchAvailability(
      resolveCalendarsForAccess(cfg.integrations, calendarAccessFrom(cfg)),
    ).catch((err) => console.error("[agent/init] calendar prefetch failed", err)),
  );

  const language = config.multilingual ? languageFromPhone(callerId) : null;
  console.log("[agent/init]", {
    called: calledNumber,
    caller: callerId,
    language: language ?? "(agent default)",
    multilingual: config.multilingual,
  });
  const routing = (config.routing ?? {}) as {
    voiceByLanguage?: Record<string, string>;
    autoVoiceByLanguage?: Record<string, string>;
    greetingByLanguage?: Record<string, string>;
  };
  const base = language ? baseLanguage(language) : "";
  const fromMap = (m?: Record<string, string>) =>
    language && m ? ((m[language] ?? m[base]) || "").trim() : "";
  // Sync precomputes per-language voices and greeting translations at save
  // time; live Gemini/voice-catalog lookups are cold-path fallbacks only.
  const storedVoice = fromMap(routing.voiceByLanguage) || fromMap(routing.autoVoiceByLanguage);
  const storedGreeting =
    routing.greetingByLanguage?._source === config.greeting
      ? fromMap(routing.greetingByLanguage)
      : "";
  const [firstMessage, voiceId] = language
    ? await Promise.all([
        storedGreeting
          ? Promise.resolve(storedGreeting)
          : withDeadline(localizeGreeting(config.greeting, language), OVERRIDE_BUDGET_MS, config.greeting),
        storedVoice
          ? Promise.resolve(storedVoice)
          : withDeadline(voiceForLanguage(language, config.voiceId, true), OVERRIDE_BUDGET_MS, config.voiceId),
      ])
    : [config.greeting, null];

  const agentOverride: Record<string, unknown> = { first_message: firstMessage };
  if (language) agentOverride.language = language;

  const overrides: Record<string, unknown> = { agent: agentOverride };
  if (language && voiceId) {
    overrides.tts = { voice_id: voiceId };
  }

  // Whether a human can take a hand-off right now. Evaluated per call because
  // the answer changes with the clock; the synced prompt only carries the
  // placeholder. Fails open on a malformed schedule - see transfer-hours.ts.
  const transferHours = parseTransferHours(
    (config.routing as Record<string, unknown> | null)?.transferHours,
  );
  const transferPolicy = transferPolicyLine(transferHours, new Date());

  return json({
    type: "conversation_initiation_client_data",
    // Handy for the agent prompt + surfaced back on tool calls.
    dynamic_variables: {
      business_name: config.businessName,
      to_number: config.e164,
      from_number: callerId,
      transfer_policy: transferPolicy,
    },
    conversation_config_override: overrides,
  });
}
