import type { NextRequest } from "next/server";
import { assertUnderCallCaps, placeAgentCall } from "@/lib/call-engine/elevenlabs";
import { provisionDemoAgent } from "@/lib/call-engine/agent/sync";
import { pickDemoCallerId } from "@/lib/call-engine/demo-caller";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";
import { assignedElevenLabsNumberIds, listImportedFreeNumbers } from "@/lib/dashboard/db";

// Public "Talk to our AI now" endpoint: an ElevenLabs Conversational AI agent
// places an outbound call to the visitor's number and talks to them live.
// ElevenLabs hosts the real-time voice pipeline, so this runs fine on Vercel
// serverless - no standalone media server needed.

export const dynamic = "force-dynamic";

const E164 = /^\+[1-9]\d{6,15}$/;

// The demo agent must be fully provisioned (greeting + LLM + voice + multilingual
// presets) BEFORE a call is placed to it: a half-configured agent ACCEPTS the
// placement - the phone rings - then drops the call the moment it's answered.
// Self-provision once per warm instance instead of relying on anyone re-running
// /api/agent/setup after a deploy. A failure is logged and evicted (next call
// retries), and the call still goes out WITHOUT a language override - an English
// greeting beats a dead line.
let demoAgentReady: Promise<{ agentId: string; multilingual: boolean } | null> | null =
  null;
function ensureDemoAgent(): Promise<{ agentId: string; multilingual: boolean } | null> {
  demoAgentReady ??= provisionDemoAgent().catch((err) => {
    console.error("[test-call] demo agent provisioning failed:", (err as Error).message);
    demoAgentReady = null;
    return null;
  });
  return demoAgentReady;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Load the candidates and pick the line to dial from (see pickDemoCallerId).
 * Deliberately fails CLOSED on a DB error: without the in-use set we can't tell a
 * spare line from a customer's, and a demo that's briefly unavailable beats one
 * that dials out on a real customer's number.
 */
async function demoCallerNumberId(to: string): Promise<string | null> {
  try {
    const [pool, inUse] = await Promise.all([
      listImportedFreeNumbers(),
      assignedElevenLabsNumberIds(),
    ]);
    return pickDemoCallerId(to, pool, inUse, process.env.ELEVENLABS_AGENT_PHONE_NUMBER_ID);
  } catch (err) {
    console.error("[test-call] caller-ID lookup failed; refusing rather than guessing", err);
    return null;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  let to = "";
  try {
    to = String(((await req.json()) as { to?: unknown }).to ?? "").trim();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  if (!E164.test(to)) {
    return json({ ok: false, error: "Enter a valid phone number in international format." }, 400);
  }

  try {
    await assertUnderCallCaps();
  } catch (err) {
    // Over the hourly/daily usage cap - protect credits, ask them to retry later.
    return json({ ok: false, error: (err as Error).message }, 429);
  }

  try {
    // Provision-guard the agent, then answer in the language of the selected
    // country/dial code - but ONLY when the agent is actually multilingual;
    // overriding to a language the agent lacks is what hangs up on pickup.
    // Calls from the pool number nearest the visitor's country.
    const [demo, callerNumberId] = await Promise.all([
      ensureDemoAgent(),
      demoCallerNumberId(to),
    ]);
    // No free line to call from. Refuse instead of letting placeAgentCall fall
    // back to the env number unchecked - that fallback is what put demo calls on
    // a customer's line (and in their dashboard) in the first place.
    if (!callerNumberId) {
      console.error("[test-call] no unassigned caller ID available - demo call refused");
      return json(
        { ok: false, error: "Our demo line is busy right now. Please try again shortly." },
        503,
      );
    }
    await placeAgentCall(to, {
      language: demo?.multilingual ? (languageFromPhone(to) ?? undefined) : undefined,
      agentPhoneNumberId: callerNumberId,
    });
    return json({ ok: true });
  } catch (err) {
    console.error("[test-call] failed:", (err as Error).message);
    return json({ ok: false, error: (err as Error).message }, 500);
  }
}
