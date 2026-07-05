// ElevenLabs Conversational AI — outbound calls.
//
// The landing page's "Talk to our AI now" button places an outbound call where
// an ElevenLabs agent (its own voice + LLM) phones the visitor through a Twilio
// number connected to ElevenLabs. ElevenLabs hosts the whole real-time media
// pipeline, so this works from a plain serverless function — no media server.
//
// Setup (all server-side env):
//   ELEVENLABS_API_KEY              — account API key
//   ELEVENLABS_AGENT_ID            — the agent that answers (the AI persona)
//   ELEVENLABS_AGENT_PHONE_NUMBER_ID — the connected Twilio number to call from

import { localizeGreeting } from "./llm/greeting";
import { DEFAULT_VOICE_ID, voiceForLanguage } from "./voice/catalog";

const XI_BASE = "https://api.elevenlabs.io";
const OUTBOUND_CALL_URL = `${XI_BASE}/v1/convai/twilio/outbound-call`;
const CONVERSATIONS_URL = `${XI_BASE}/v1/convai/conversations`;
const PHONE_NUMBERS_URL = `${XI_BASE}/v1/convai/phone-numbers`;

interface AgentPhoneNumber {
  phone_number?: string;
  phone_number_id?: string;
}

/**
 * Find the ElevenLabs phone-number id for an E.164 number, or null if it isn't
 * imported into the account. The list endpoint returns either a bare array or
 * `{ phone_numbers: [...] }` depending on API version — handle both.
 */
export async function findAgentPhoneNumberId(e164: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");

  const res = await fetch(PHONE_NUMBERS_URL, { headers: { "xi-api-key": apiKey } });
  if (!res.ok) {
    throw new Error(`ElevenLabs phone-numbers list failed (${res.status}).`);
  }
  const data = (await res.json()) as
    | AgentPhoneNumber[]
    | { phone_numbers?: AgentPhoneNumber[] };
  const list = Array.isArray(data) ? data : (data.phone_numbers ?? []);
  const match = list.find((p) => p.phone_number === e164);
  return match?.phone_number_id ?? null;
}

/** Assign an agent as the inbound agent on an imported phone number. */
export async function assignInboundAgent(
  phoneNumberId: string,
  agentId: string,
): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");

  const res = await fetch(`${PHONE_NUMBERS_URL}/${phoneNumberId}`, {
    method: "PATCH",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ agent_id: agentId }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `ElevenLabs agent assignment failed (${res.status}). ${detail}`.trim(),
    );
  }
}

/** Detach the inbound agent from an imported phone number so it stops routing
 *  inbound calls. ElevenLabs treats a null agent_id as "no inbound agent". */
export async function unassignInboundAgent(phoneNumberId: string): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");

  const res = await fetch(`${PHONE_NUMBERS_URL}/${phoneNumberId}`, {
    method: "PATCH",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ agent_id: null }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `ElevenLabs agent unassignment failed (${res.status}). ${detail}`.trim(),
    );
  }
}

/**
 * Stop an E.164 number from routing inbound calls to any agent — used when a
 * number is unlinked from its assistant or deleted. Prefers the stored ElevenLabs
 * phone-number id (no re-scan); falls back to a lookup by number. No-op if the
 * number was never imported into ElevenLabs.
 */
export async function releaseNumberFromAgent(
  e164: string,
  phoneNumberId?: string | null,
): Promise<void> {
  const id = phoneNumberId || (await findAgentPhoneNumberId(e164));
  if (id) await unassignInboundAgent(id);
}

/**
 * Import a Twilio number the account owns into ElevenLabs, with a label and an
 * OPTIONAL inbound agent. `agent_id` is only sent when provided, so a freshly
 * bought pool number can be imported unassigned and assigned an agent later. Uses
 * the account's Twilio credentials so ElevenLabs can control the number. Returns
 * the new ElevenLabs phone-number id.
 */
export async function importTwilioNumber(
  e164: string,
  opts: { agentId?: string; label?: string } = {},
): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error(
      "ElevenLabs needs your Twilio Account SID + Auth Token to import a number (a scoped API key isn't enough). Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.",
    );
  }

  const body: Record<string, unknown> = {
    provider: "twilio",
    phone_number: e164,
    label: opts.label || e164,
    sid,
    token,
  };
  if (opts.agentId) body.agent_id = opts.agentId;

  const res = await fetch(PHONE_NUMBERS_URL, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs number import failed (${res.status}). ${detail}`.trim());
  }
  const data = (await res.json()) as { phone_number_id?: string };
  return String(data.phone_number_id ?? "");
}

/** Delete an imported phone number from ElevenLabs entirely (used when the number
 *  is deleted, not merely unlinked — unlink just unassigns and keeps it for reuse).
 *  Prefers the stored id; falls back to a lookup. No-op if it was never imported
 *  or is already gone. */
export async function deleteImportedNumber(
  e164: string,
  phoneNumberId?: string | null,
): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set.");
  const id = phoneNumberId || (await findAgentPhoneNumberId(e164));
  if (!id) return;
  const res = await fetch(`${PHONE_NUMBERS_URL}/${id}`, {
    method: "DELETE",
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok && res.status !== 404) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs number delete failed (${res.status}). ${detail}`.trim());
  }
}

/**
 * Route an E.164 Twilio number's inbound calls to a specific assistant's managed
 * agent (tier A). If the number is already imported into ElevenLabs, just
 * (re)assign the agent; otherwise import it from Twilio and assign in one step.
 * Returns the ElevenLabs phone-number id.
 *
 * No demo fallback on purpose: this always points a number at a chosen assistant.
 * Defaulting a missing agent to ELEVENLABS_AGENT_ID (the public "Talk to our AI"
 * demo agent) would silently route a customer's number to the demo persona.
 */
export async function routeNumberToAgent(
  e164: string,
  agentId?: string,
  label?: string,
): Promise<string> {
  const agent = (agentId ?? "").trim();
  if (!agent) {
    throw new Error(
      "No ElevenLabs agent for this assistant yet — save the assistant first, then connect a number.",
    );
  }

  const phoneNumberId = await findAgentPhoneNumberId(e164);
  if (phoneNumberId) {
    await assignInboundAgent(phoneNumberId, agent);
    return phoneNumberId;
  }
  // Not in ElevenLabs yet — import it from Twilio and assign the agent in one go.
  return importTwilioNumber(e164, { agentId: agent, label });
}

export interface PlaceAgentCallResult {
  conversationId?: string;
  callSid?: string;
}

/**
 * Start times (unix seconds) of the demo agent's recent conversations, newest
 * first. Used to cap usage so nobody can drain ElevenLabs credits by spamming
 * the public button. Fails open (returns []) if the metrics call itself errors,
 * so a transient ElevenLabs hiccup doesn't take the button down.
 * ponytail: single page of 100 — caps above 100 can't trigger; count demo
 * calls in our own DB if bigger caps (or a watertight cap) are ever needed.
 */
async function recentCallStarts(): Promise<number[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) return [];

  const url = `${CONVERSATIONS_URL}?agent_id=${encodeURIComponent(agentId)}&page_size=100`;
  try {
    const res = await fetch(url, { headers: { "xi-api-key": apiKey } });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      conversations?: { start_time_unix_secs?: number }[];
    };
    return (data.conversations ?? []).map((c) => c.start_time_unix_secs ?? 0);
  } catch {
    return [];
  }
}

/** A cap from env, or the default when unset/malformed — `Number("15 calls")`
 *  is NaN and every `>= NaN` check is false, which would silently uncap the
 *  public demo line. */
function capFromEnv(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Reject the call if the agent has hit its hourly or daily usage cap. Caps are
 * configurable via env; defaults are generous enough for real demo traffic but
 * bound worst-case spend. Throws with a user-friendly message when over a cap.
 * One conversations fetch covers both windows.
 */
export async function assertUnderCallCaps(): Promise<void> {
  const hourlyCap = capFromEnv(process.env.ELEVENLABS_HOURLY_CALL_CAP, 15);
  const dailyCap = capFromEnv(process.env.ELEVENLABS_DAILY_CALL_CAP, 50);

  const starts = await recentCallStarts();
  const now = Math.floor(Date.now() / 1000);
  if (starts.filter((t) => t >= now - 24 * 3600).length >= dailyCap) {
    throw new Error("Our AI demo line is busy today — please try again tomorrow.");
  }
  if (starts.filter((t) => t >= now - 3600).length >= hourlyCap) {
    throw new Error("Our AI demo line is busy right now — please try again in a bit.");
  }
}

// The demo call isn't a live conversation yet — we're about to PLACE it, the
// visitor's phone rings only after this returns — so we can afford to wait for a
// native per-language voice to resolve/import instead of the ~2s a live webhook
// allows. Capped so a wedged import can't hang the "call me" button forever.
// ponytail: 4s is a heuristic for one library import (search + add); the first
// call in a new language may still miss it and use the base voice, later calls
// hit the module cache. Pin ids in VOICE_BY_LANGUAGE/ELEVENLABS_VOICE_OVERRIDES
// to make it instant and deterministic.
const DEMO_VOICE_BUDGET_MS = 4000;

/**
 * Ordered per-call override candidates for a demo/test call: richest first, an
 * empty (English-default) override always last. The caller's language + localized
 * greeting are the POINT of the call; the per-language voice is a bonus layered on
 * top — so they're separable. If ElevenLabs rejects a voice it won't accept, the
 * next candidate keeps the language (base voice) instead of collapsing all the way
 * to English, which is what made the demo answer in the wrong language. Each entry
 * is the body spread onto the base outbound-call payload; `{}` = agent defaults.
 */
export function demoOverrideCandidates(opts: {
  language?: string;
  firstMessage?: string;
  voiceId?: string;
  defaultVoiceId: string;
}): Record<string, unknown>[] {
  const { language, firstMessage, voiceId, defaultVoiceId } = opts;
  const candidates: Record<string, unknown>[] = [];
  // English is the agent's own default — never overridden (a misconfigured
  // overrides toggle then can't break US/UK demo calls).
  if (language && language !== "en") {
    const agent: Record<string, unknown> = { language };
    if (firstMessage) agent.first_message = firstMessage;
    const wrap = (override: Record<string, unknown>) => ({
      conversation_initiation_client_data: { conversation_config_override: override },
    });
    // Voice + language first, then language alone. Only add the voiced tier when
    // the voice actually differs from the base — otherwise it's the same request.
    if (voiceId && voiceId !== defaultVoiceId) {
      candidates.push(wrap({ agent, tts: { voice_id: voiceId } }));
    }
    candidates.push(wrap({ agent }));
  }
  candidates.push({}); // English default — the phone rings no matter what.
  return candidates;
}

/**
 * Have an ElevenLabs agent call `toNumber` (E.164).
 *
 * Defaults to the public demo agent + its number (the landing page's "Talk to
 * our AI" button). A per-assistant test call passes THAT assistant's agent id and
 * its connected number's phone-number id, so the caller actually hears the
 * assistant being tested — its greeting, voice, prompt, and knowledge — instead
 * of the generic demo persona.
 */
export async function placeAgentCall(
  toNumber: string,
  opts: { agentId?: string; agentPhoneNumberId?: string; language?: string } = {},
): Promise<PlaceAgentCallResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = opts.agentId || process.env.ELEVENLABS_AGENT_ID;
  const agentPhoneNumberId =
    opts.agentPhoneNumberId || process.env.ELEVENLABS_AGENT_PHONE_NUMBER_ID;

  if (!apiKey || !agentId || !agentPhoneNumberId) {
    throw new Error("Calling isn't configured.");
  }

  // Outbound calls never hit the conversation-init webhook (that's inbound-only),
  // so the caller's language, a localized greeting, AND a native voice are set here
  // in the request body instead. Requires the agent to have "overrides" enabled for
  // language + first_message + voice (asserted by /api/agent/setup for the demo
  // agent).
  let firstMessage: string | undefined;
  let voiceId: string | undefined;
  if (opts.language && opts.language !== "en") {
    const greeting = await agentFirstMessage(agentId, apiKey);
    if (greeting) {
      // Cached per (greeting, language) — repeat demo calls skip the Gemini trip.
      const localized = await localizeGreeting(greeting, opts.language);
      if (localized !== greeting) firstMessage = localized;
    }
    // Match the voice to the caller's language (a native one when the account has
    // or can import it), mirroring the inbound init webhook. Deadline-guarded so a
    // slow import degrades to the base voice; the timed-out import still lands in
    // the module cache for the next call.
    voiceId = await Promise.race([
      voiceForLanguage(opts.language, DEFAULT_VOICE_ID, true).catch(() => DEFAULT_VOICE_ID),
      new Promise<string>((r) => setTimeout(() => r(DEFAULT_VOICE_ID), DEMO_VOICE_BUDGET_MS)),
    ]);
  }

  const place = (body: Record<string, unknown>) =>
    fetch(OUTBOUND_CALL_URL, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

  const base = {
    agent_id: agentId,
    agent_phone_number_id: agentPhoneNumberId,
    to_number: toNumber,
  };

  // Place with the richest override, stepping down ONLY on a validation rejection
  // (400/422 = the override was refused and the call was NOT placed, so retrying
  // can't double-dial). This decouples the voice from the language: a per-language
  // voice ElevenLabs won't accept drops to the base voice but KEEPS the language,
  // instead of the old single-retry that collapsed straight back to English and
  // made the demo answer in the wrong language. A 429/5xx is a real outage and
  // breaks out immediately — a second placement there would double-dial.
  const candidates = demoOverrideCandidates({
    language: opts.language,
    firstMessage,
    voiceId,
    defaultVoiceId: DEFAULT_VOICE_ID,
  });
  let res = await place({ ...base, ...candidates[0] });
  for (let i = 1; i < candidates.length; i++) {
    if (res.status !== 400 && res.status !== 422) break;
    console.warn(`[demo-call] override rejected (${res.status}), retrying leaner`);
    res = await place({ ...base, ...candidates[i] });
  }

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    conversation_id?: string;
    callSid?: string;
  };

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Call failed (${res.status}).`);
  }

  return { conversationId: data.conversation_id, callSid: data.callSid };
}

// The demo agent's configured greeting, fetched once per instance. Used as the
// source text for the localized first_message override on demo calls. null on
// any failure — the call then just uses the agent's own greeting.
const firstMessageCache = new Map<string, Promise<string | null>>();

function agentFirstMessage(agentId: string, apiKey: string): Promise<string | null> {
  if (!firstMessageCache.has(agentId)) {
    const p = (async () => {
      try {
        const res = await fetch(`${XI_BASE}/v1/convai/agents/${encodeURIComponent(agentId)}`, {
          headers: { "xi-api-key": apiKey },
        });
        if (!res.ok) return null;
        const data = (await res.json()) as {
          conversation_config?: { agent?: { first_message?: string } };
        };
        return data.conversation_config?.agent?.first_message?.trim() || null;
      } catch {
        return null;
      }
    })();
    // Don't cache a miss forever — a transient failure would permanently disable
    // the localized greeting on this warm instance. Evict on null so it retries.
    p.then((v) => {
      if (v === null) firstMessageCache.delete(agentId);
    });
    firstMessageCache.set(agentId, p);
  }
  return firstMessageCache.get(agentId)!;
}
