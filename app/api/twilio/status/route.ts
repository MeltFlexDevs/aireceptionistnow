import type { NextRequest } from "next/server";
import { getEnv } from "@/lib/call-engine/env";
import { verifyTwilioSignature } from "@/lib/call-engine/pickup";

// Twilio call status callback. The media server owns finalization + summary on
// stream stop; this endpoint is a verified backstop for observability (and a
// hook point for retrying summarization if the media server died mid-call).

export const dynamic = "force-dynamic";

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
    url: `${env.APP_BASE_URL}/api/twilio/status`,
    params,
  });
  if (!valid) return new Response("invalid signature", { status: 403 });

  console.log("[twilio:status]", params.CallSid, params.CallStatus);
  return new Response(null, { status: 204 });
}
