
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

export async function releaseNumberFromAgent(
  e164: string,
  phoneNumberId?: string | null,
): Promise<void> {
  const id = phoneNumberId || (await findAgentPhoneNumberId(e164));
  if (id) await unassignInboundAgent(id);
}

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

export async function routeNumberToAgent(
  e164: string,
  agentId?: string,
  label?: string,
): Promise<string> {
  const agent = (agentId ?? "").trim();
  if (!agent) {
    throw new Error(
      "No ElevenLabs agent for this assistant yet - save the assistant first, then connect a number.",
    );
  }

  const phoneNumberId = await findAgentPhoneNumberId(e164);
  if (phoneNumberId) {
    await assignInboundAgent(phoneNumberId, agent);
    return phoneNumberId;
  }
  // Not in ElevenLabs yet - import it from Twilio and assign the agent in one go.
  return importTwilioNumber(e164, { agentId: agent, label });
}

export interface PlaceAgentCallResult {
  conversationId?: string;
  callSid?: string;
}

async function recentCallStarts(): Promise<number[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) return [];

  const url = `${CONVERSATIONS_URL}?agent_id=${encodeURIComponent(agentId)}&page_size=100`;
  // Failures fail OPEN (caps stop protecting) so demo calls keep working
  // through an ElevenLabs blip - but say so, or the cap silently vanishes.
  try {
    const res = await fetch(url, { headers: { "xi-api-key": apiKey } });
    if (!res.ok) {
      console.error(`[call-caps] conversation list failed (${res.status}) - caps not enforced this call`);
      return [];
    }
    const data = (await res.json()) as {
      conversations?: { start_time_unix_secs?: number }[];
    };
    return (data.conversations ?? []).map((c) => c.start_time_unix_secs ?? 0);
  } catch (err) {
    console.error("[call-caps] conversation list threw - caps not enforced this call", err);
    return [];
  }
}

function capFromEnv(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function assertUnderCallCaps(): Promise<void> {
  const hourlyCap = capFromEnv(process.env.ELEVENLABS_HOURLY_CALL_CAP, 15);
  const dailyCap = capFromEnv(process.env.ELEVENLABS_DAILY_CALL_CAP, 50);

  const starts = await recentCallStarts();
  const now = Math.floor(Date.now() / 1000);
  if (starts.filter((t) => t >= now - 24 * 3600).length >= dailyCap) {
    throw new Error("Our AI demo line is busy today - please try again tomorrow.");
  }
  if (starts.filter((t) => t >= now - 3600).length >= hourlyCap) {
    throw new Error("Our AI demo line is busy right now - please try again in a bit.");
  }
}

const DEMO_VOICE_BUDGET_MS = 4000;

export function demoOverrideCandidates(opts: {
  language?: string;
  firstMessage?: string;
  voiceId?: string;
  defaultVoiceId: string;
}): Record<string, unknown>[] {
  const { language, firstMessage, voiceId, defaultVoiceId } = opts;
  const candidates: Record<string, unknown>[] = [];
  if (language && language !== "en") {
    const agent: Record<string, unknown> = { language };
    if (firstMessage) agent.first_message = firstMessage;
    const wrap = (override: Record<string, unknown>) => ({
      conversation_initiation_client_data: { conversation_config_override: override },
    });
    if (voiceId && voiceId !== defaultVoiceId) {
      candidates.push(wrap({ agent, tts: { voice_id: voiceId } }));
    }
    candidates.push(wrap({ agent }));
  }
  candidates.push({}); // English default - the phone rings no matter what.
  return candidates;
}

export function customOverrideCandidates(opts: {
  language?: string;
  firstMessage?: string;
  prompt?: string;
  voiceId?: string;
  defaultVoiceId: string;
}): Record<string, unknown>[] {
  const { language, firstMessage, prompt, voiceId, defaultVoiceId } = opts;
  const agent: Record<string, unknown> = {};
  if (firstMessage) agent.first_message = firstMessage;
  if (prompt) agent.prompt = { prompt };
  if (language && language !== "en") agent.language = language;

  const wrap = (override: Record<string, unknown>) => ({
    conversation_initiation_client_data: { conversation_config_override: override },
  });

  const candidates: Record<string, unknown>[] = [];
  if (voiceId && voiceId !== defaultVoiceId) {
    candidates.push(wrap({ agent, tts: { voice_id: voiceId } }));
  }
  candidates.push(wrap({ agent }));
  if (agent.language) {
    const { language: _drop, ...agentNoLang } = agent;
    void _drop;
    candidates.push(wrap({ agent: agentNoLang }));
  }
  return candidates;
}

export async function placeAgentCall(
  toNumber: string,
  opts: {
    agentId?: string;
    agentPhoneNumberId?: string;
    language?: string;
    firstMessage?: string;
    prompt?: string;
  } = {},
): Promise<PlaceAgentCallResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = opts.agentId || process.env.ELEVENLABS_AGENT_ID;
  const agentPhoneNumberId =
    opts.agentPhoneNumberId || process.env.ELEVENLABS_AGENT_PHONE_NUMBER_ID;

  if (!apiKey || !agentId || !agentPhoneNumberId) {
    throw new Error("Calling isn't configured.");
  }

  const custom = Boolean(opts.prompt || opts.firstMessage);

  let firstMessage: string | undefined = opts.firstMessage;
  let voiceId: string | undefined;
  if (opts.language && opts.language !== "en") {
    const source = opts.firstMessage ?? (await agentFirstMessage(agentId, apiKey));
    if (source) {
      // Cached per (text, language) - repeat calls skip the Gemini trip.
      const localized = await localizeGreeting(source, opts.language);
      if (localized !== source) firstMessage = localized;
    }
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

  const candidates = custom
    ? customOverrideCandidates({
        language: opts.language,
        firstMessage,
        prompt: opts.prompt,
        voiceId,
        defaultVoiceId: DEFAULT_VOICE_ID,
      })
    : demoOverrideCandidates({
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
    p.then((v) => {
      if (v === null) firstMessageCache.delete(agentId);
    });
    firstMessageCache.set(agentId, p);
  }
  return firstMessageCache.get(agentId)!;
}
