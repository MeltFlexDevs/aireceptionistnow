import twilio from "twilio";
import { getEnv } from "./env";

// Live telephony actions the AI takes mid-call: redirect (warm transfer) the
// caller to a personal number, and text message alerts. Both use the Twilio
// REST API with the account's main credentials.

function client() {
  const env = getEnv();
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

/** Send an SMS (e.g. a message alert) from the receptionist number. */
export async function sendSms(to: string, from: string, body: string): Promise<void> {
  await client().messages.create({ to, from, body });
}
