import { after } from "next/server";
import { calendarAccessFrom } from "@/lib/call-engine/actions";
import { cachedConfig } from "@/lib/call-engine/agent/context";
import { verifyElevenLabsSignature, verifyToolSecret } from "@/lib/call-engine/agent/auth";
import { prefetchAvailability } from "@/lib/call-engine/integrations/availability";
import { resolveCalendarsForAccess } from "@/lib/call-engine/integrations/registry";
import { localizeGreeting } from "@/lib/call-engine/llm/greeting";
import {
  NO_CALLER_CONTEXT,
  callerContextLine,
  recognizeCallersEnabled,
} from "@/lib/call-engine/caller-context";
import { escalationPolicyLine, parseEscalation } from "@/lib/call-engine/escalation";
import { getRepository } from "@/lib/call-engine/persistence/supabase";
import { PAUSED_TRANSFER_POLICY, pausedGreeting, pausedPrompt } from "@/lib/call-engine/paused";
import { TRANSFER_POLICY_OPEN } from "@/lib/call-engine/transfer-hours";
import { withDeadline } from "@/lib/call-engine/net";
import { voiceForLanguage, baseLanguage, isAllowedVoice } from "@/lib/call-engine/voice/catalog";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";
import { maskPhone } from "@/lib/log-mask";

const OVERRIDE_BUDGET_MS = 1500;
/** Recognising a caller is a nicety; it must never make the phone ring longer. */
const CALLER_LOOKUP_BUDGET_MS = 700;

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
  // EVERY dynamic variable the synced prompt can contain still has to go out. A
  // prompt synced with transfer hours contains {{transfer_policy}}, one synced
  // with caller recognition contains {{caller_context}}, and this path is not
  // rare: an OUTBOUND or test call arrives with the dialed customer number as
  // called_number, which resolves to no config at all. Omitting a variable would
  // leave its placeholder unsubstituted in a live prompt.
  //
  // The permissive transfer value is the right default - it is exactly the
  // behaviour before hours existed, and stranding a caller who asks for a human
  // is the worse of the two failures.
  if (!config) {
    return json({
      type: "conversation_initiation_client_data",
      dynamic_variables: {
        transfer_policy: TRANSFER_POLICY_OPEN,
        caller_context: NO_CALLER_CONTEXT,
      },
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

  // Do we know this caller? Started here, resolved further down, so the lookup
  // overlaps the greeting/voice work instead of adding a round trip in front of
  // it. Its own short deadline: recognising a caller is a nicety, and nothing
  // about it is worth making the phone ring longer. Any failure - slow query,
  // missing index, DB blip - degrades to "we don't know them".
  const callerContextPromise = recognizeCallersEnabled(config.routing)
    ? withDeadline(
        getRepository()
          .findCallerContext(config.numberId, callerId)
          .catch((err) => {
            console.error("[agent/init] caller lookup failed", err);
            return null;
          }),
        CALLER_LOOKUP_BUDGET_MS,
        null,
      )
    : Promise.resolve(null);

  const language = config.multilingual ? languageFromPhone(callerId) : null;
  console.log("[agent/init]", {
    called: calledNumber,
    caller: maskPhone(callerId),
    language: language ?? "(agent default)",
    multilingual: config.multilingual,
    paused: config.paused,
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
  // The owner's own pick is trusted. A stored auto voice was chosen from a shared
  // account, so it plays only if it is allowlisted; otherwise the receptionist's
  // own voice speaks (the multilingual models speak every language with it).
  // The check runs inside the Promise.all below, next to the greeting lookup.
  const ownVoice = fromMap(routing.voiceByLanguage);
  const autoVoice = fromMap(routing.autoVoiceByLanguage);
  // Paused: a fixed closed line replaces the owner's greeting. The stored
  // translations are of the owner's greeting, so they never apply to it.
  const greeting = config.paused ? pausedGreeting(config.businessName) : config.greeting;
  const storedGreeting =
    !config.paused && routing.greetingByLanguage?._source === config.greeting
      ? fromMap(routing.greetingByLanguage)
      : "";
  const [firstMessage, voiceId] = language
    ? await Promise.all([
        storedGreeting
          ? Promise.resolve(storedGreeting)
          : withDeadline(localizeGreeting(greeting, language), OVERRIDE_BUDGET_MS, greeting),
        ownVoice
          ? Promise.resolve(ownVoice)
          : autoVoice
            ? withDeadline(isAllowedVoice(autoVoice), OVERRIDE_BUDGET_MS, false).then((ok) =>
                ok ? autoVoice : config.voiceId,
              )
            : withDeadline(voiceForLanguage(language, config.voiceId, true), OVERRIDE_BUDGET_MS, config.voiceId),
      ])
    : [
        // Caller language unknown: the owner's greeting already fits the agent's
        // language, but the closed line is English, so translate it into the
        // agent's own language with the same deadline and fallback.
        config.paused
          ? await withDeadline(localizeGreeting(greeting, config.language), OVERRIDE_BUDGET_MS, greeting)
          : greeting,
        null,
      ];

  const agentOverride: Record<string, unknown> = { first_message: firstMessage };
  if (language) agentOverride.language = language;
  // Paused: take messages only. Owner agents allow-list agent.prompt.prompt
  // for override (sync.ts platformSettings).
  if (config.paused) agentOverride.prompt = { prompt: pausedPrompt(config, callerId) };

  const overrides: Record<string, unknown> = { agent: agentOverride };
  if (language && voiceId) {
    overrides.tts = { voice_id: voiceId };
  }

  const callerContext = callerContextLine(await callerContextPromise, new Date());

  // Which destinations can take a hand-off right now. Evaluated per call because
  // the answer changes with the clock; the synced prompt only carries the
  // placeholder. Fails open on a malformed schedule - see escalation.ts.
  const transferPolicy = config.paused
    ? PAUSED_TRANSFER_POLICY
    : escalationPolicyLine(parseEscalation(config.routing), new Date());

  return json({
    type: "conversation_initiation_client_data",
    // Handy for the agent prompt + surfaced back on tool calls.
    dynamic_variables: {
      business_name: config.businessName,
      to_number: config.e164,
      from_number: callerId,
      transfer_policy: transferPolicy,
      caller_context: callerContext,
    },
    conversation_config_override: overrides,
  });
}
