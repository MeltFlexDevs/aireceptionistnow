import twilio from "twilio";
import { getEnv } from "./env";

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

export async function sendSms(to: string, from: string, body: string): Promise<void> {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  await client().messages.create(
    messagingServiceSid ? { to, body, messagingServiceSid } : { to, from, body },
  );
}
