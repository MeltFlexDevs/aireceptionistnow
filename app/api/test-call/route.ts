import type { NextRequest } from "next/server";
import { buildConnectResponse } from "@/lib/call-engine/pickup";
import {
  createTestCall,
  getDefaultCallableNumber,
  setCallTwilioSid,
} from "@/lib/dashboard/db";
import { placeCall } from "@/lib/dashboard/twilio";

// Public "Talk to our AI now" endpoint: places an outbound Twilio call to the
// visitor's number, connecting the audio to the media server with the default
// assistant's config. Note: on a Twilio trial, outbound calls only reach
// verified numbers — the carrier error is surfaced to the caller.

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

  const mediaWsUrl = process.env.MEDIA_WS_URL;
  if (!mediaWsUrl) {
    return json({ ok: false, error: "Calling isn't available right now." }, 503);
  }

  let number: Awaited<ReturnType<typeof getDefaultCallableNumber>> = null;
  try {
    number = await getDefaultCallableNumber();
  } catch {
    number = null;
  }
  if (!number) {
    return json({ ok: false, error: "No assistant number is available to call from." }, 503);
  }

  try {
    const callId = await createTestCall({
      businessId: number.businessId,
      numberId: number.id,
      e164: number.e164,
    });
    const twiml = buildConnectResponse(mediaWsUrl, {
      callId,
      businessId: number.businessId,
      numberId: number.id,
      from: number.e164,
      to: number.e164,
    });
    const sid = await placeCall(to, number.e164, twiml);
    await setCallTwilioSid(callId, sid).catch(() => {});
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 500);
  }
}
