import type { NextRequest } from "next/server";
import { assertUnderCallCaps, placeAgentCall } from "@/lib/call-engine/elevenlabs";

// Public "Talk to our AI now" endpoint: an ElevenLabs Conversational AI agent
// places an outbound call to the visitor's number and talks to them live.
// ElevenLabs hosts the real-time voice pipeline, so this runs fine on Vercel
// serverless — no standalone media server needed.

export const dynamic = "force-dynamic";

const E164 = /^\+[1-9]\d{6,15}$/;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
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
    // Over the hourly/daily usage cap — protect credits, ask them to retry later.
    return json({ ok: false, error: (err as Error).message }, 429);
  }

  try {
    await placeAgentCall(to);
    return json({ ok: true });
  } catch (err) {
    console.error("[test-call] failed:", (err as Error).message);
    return json({ ok: false, error: (err as Error).message }, 500);
  }
}
