import twilio from "twilio";
import { getEnv } from "./env";

// SMS message alerts. When the ElevenLabs agent takes a message (via our
// take_message webhook), we text the owner's personal number. Voice + transfer
// are handled natively by the ElevenLabs agent, so no live-call telephony lives
// here anymore — just outbound SMS through the Twilio REST API.

function client() {
  const env = getEnv();
  // Prefer a scoped API Key; fall back to the account auth token.
  if (env.TWILIO_API_KEY_SID && env.TWILIO_API_KEY_SECRET) {
    return twilio(env.TWILIO_API_KEY_SID, env.TWILIO_API_KEY_SECRET, {
      accountSid: env.TWILIO_ACCOUNT_SID,
    });
  }
  return twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

/**
 * Send an SMS (e.g. a message alert). If TWILIO_MESSAGING_SERVICE_SID is set,
 * send through that A2P-registered Messaging Service (required for US 10DLC
 * deliverability); otherwise send directly from the receptionist number.
 */
export async function sendSms(to: string, from: string, body: string): Promise<void> {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  await client().messages.create(
    messagingServiceSid ? { to, body, messagingServiceSid } : { to, from, body },
  );
}
