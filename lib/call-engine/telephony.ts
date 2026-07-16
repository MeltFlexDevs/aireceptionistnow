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

// Twilio alphanumeric sender: max 11 chars of [A-Za-z0-9 ], at least one letter.
function alphaSender(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 11)
    .trim();
  return /[A-Za-z]/.test(cleaned) ? cleaned : "";
}

export async function sendSms(
  to: string,
  from: string,
  body: string,
  senderName?: string,
): Promise<void> {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (messagingServiceSid) {
    await client().messages.create({ to, body, messagingServiceSid });
    return;
  }
  // Preferred sender: the business's own name (alphanumeric ID, works in most
  // of Europe). Fallback: TWILIO_SMS_FROM (voice-only numbers can't send),
  // then the passed number. Branded send retries on rejection (e.g. countries
  // that forbid alphanumeric senders).
  const fallback = process.env.TWILIO_SMS_FROM || from;
  const sender = (senderName ? alphaSender(senderName) : "") || fallback;
  try {
    await client().messages.create({ to, from: sender, body });
  } catch (err) {
    if (sender === fallback) throw err;
    console.warn(`[sms] branded sender "${sender}" rejected, retrying with fallback`, err);
    await client().messages.create({ to, from: fallback, body });
  }
}
