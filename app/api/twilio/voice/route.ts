import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/call-engine/env";
import {
  buildConnectResponse,
  buildRejectResponse,
  verifyTwilioSignature,
} from "@/lib/call-engine/pickup";
import { getRepository } from "@/lib/call-engine/persistence/supabase";

// Inbound call webhook. Twilio POSTs here when a call arrives; we verify the
// signature, resolve the dialed number's config, create the call record, and
// return TwiML that connects the call's audio to the media WebSocket server.

export const dynamic = "force-dynamic";

function xml(body: string): Response {
  return new Response(body, {
    headers: { "content-type": "text/xml; charset=utf-8" },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  const env = getEnv();

  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    params[key] = typeof value === "string" ? value : "";
  }

  const valid = verifyTwilioSignature({
    authToken: env.TWILIO_AUTH_TOKEN,
    signature: req.headers.get("x-twilio-signature"),
    url: `${env.APP_BASE_URL}/api/twilio/voice`,
    params,
  });
  if (!valid) return new Response("invalid signature", { status: 403 });

  const to = params.To ?? "";
  const from = params.From ?? "";
  const callSid = params.CallSid ?? "";

  const repo = getRepository();
  const config = to ? await repo.resolveInboundNumber(to) : null;
  if (!config) {
    return xml(
      buildRejectResponse("Sorry, this number isn't available right now. Goodbye."),
    );
  }

  const callId = await repo.createCall({
    businessId: config.businessId,
    numberId: config.numberId,
    callSid,
    from,
    to,
  });

  return xml(
    buildConnectResponse(env.MEDIA_WS_URL, {
      callId,
      businessId: config.businessId,
      numberId: config.numberId,
      from,
      to,
    }),
  );
}
