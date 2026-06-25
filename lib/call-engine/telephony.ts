import twilio from "twilio";
import { getEnv } from "./env";

// Live telephony actions the AI takes mid-call: redirect (warm transfer) the
// caller to a personal number, and text message alerts. Both use the Twilio
// REST API with the account's main credentials.

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

/** Redirect a live call to another number — ends the media stream and dials out. */
export async function redirectCall(
  callSid: string,
  to: string,
  callerId?: string,
): Promise<void> {
  const response = new twilio.twiml.VoiceResponse();
  response.dial({ callerId }, to);
  await client().calls(callSid).update({ twiml: response.toString() });
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
