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

const OUTBOUND_CALL_URL =
  "https://api.elevenlabs.io/v1/convai/twilio/outbound-call";
const CONVERSATIONS_URL = "https://api.elevenlabs.io/v1/convai/conversations";

export interface PlaceAgentCallResult {
  conversationId?: string;
  callSid?: string;
}

/**
 * Count how many calls this agent has started within the last `windowSecs`.
 * Used to cap usage so nobody can drain ElevenLabs credits by spamming the
 * public button. Fails open (returns 0) if the metrics call itself errors, so a
 * transient ElevenLabs hiccup doesn't take the button down.
 */
async function countRecentCalls(windowSecs: number): Promise<number> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) return 0;

  const sinceUnix = Math.floor(Date.now() / 1000) - windowSecs;
  const url = `${CONVERSATIONS_URL}?agent_id=${encodeURIComponent(agentId)}&page_size=100`;
  try {
    const res = await fetch(url, { headers: { "xi-api-key": apiKey } });
    if (!res.ok) return 0;
    const data = (await res.json()) as {
      conversations?: { start_time_unix_secs?: number }[];
    };
    return (data.conversations ?? []).filter(
      (c) => (c.start_time_unix_secs ?? 0) >= sinceUnix,
    ).length;
  } catch {
    return 0;
  }
}

/**
 * Reject the call if the agent has hit its hourly or daily usage cap. Caps are
 * configurable via env; defaults are generous enough for real demo traffic but
 * bound worst-case spend. Throws with a user-friendly message when over a cap.
 */
export async function assertUnderCallCaps(): Promise<void> {
  const hourlyCap = Number(process.env.ELEVENLABS_HOURLY_CALL_CAP || 15);
  const dailyCap = Number(process.env.ELEVENLABS_DAILY_CALL_CAP || 50);

  const lastDay = await countRecentCalls(24 * 3600);
  if (lastDay >= dailyCap) {
    throw new Error("Our AI demo line is busy today — please try again tomorrow.");
  }
  const lastHour = await countRecentCalls(3600);
  if (lastHour >= hourlyCap) {
    throw new Error("Our AI demo line is busy right now — please try again in a bit.");
  }
}

/** Have the configured ElevenLabs agent call `toNumber` (E.164). */
export async function placeAgentCall(
  toNumber: string,
): Promise<PlaceAgentCallResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const agentPhoneNumberId = process.env.ELEVENLABS_AGENT_PHONE_NUMBER_ID;

  if (!apiKey || !agentId || !agentPhoneNumberId) {
    throw new Error("Calling isn't configured.");
  }

  const res = await fetch(OUTBOUND_CALL_URL, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      agent_id: agentId,
      agent_phone_number_id: agentPhoneNumberId,
      to_number: toNumber,
    }),
  });

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
