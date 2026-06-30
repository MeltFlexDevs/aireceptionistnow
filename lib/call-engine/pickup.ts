import crypto from "node:crypto";
import twilio from "twilio";
import { streamSecret } from "./env";

// "Picking up the phone": turn an inbound Twilio call into a bidirectional
// media stream pointed at our WebSocket server, passing the resolved call
// context along as stream parameters so the media server can attach without a
// second lookup.

export interface ConnectParams {
  callId: string;
  businessId: string;
  numberId: string;
  from: string;
  to: string;
}

// How long a signed stream parameter set stays valid. Twilio opens the media
// stream within seconds of the webhook, so a short window is plenty and bounds
// replay.
const STREAM_SIG_TTL_MS = 5 * 60_000;

function streamPayload(callId: string, to: string, ts: string): string {
  return `${callId}.${to}.${ts}`;
}

/** HMAC over the call-identifying stream params, so the media server can prove a
 *  WebSocket connection really originated from our signed TwiML. */
export function signStreamParams(callId: string, to: string, ts: string): string {
  return crypto
    .createHmac("sha256", streamSecret())
    .update(streamPayload(callId, to, ts))
    .digest("hex");
}

/**
 * Verify a media-stream parameter signature. The Twilio webhook is signature-
 * verified, but the media WebSocket is a separate, public connection that only
 * carries the parameters we put in the TwiML — so we sign them here and check
 * them on the media side. Rejects missing fields, bad HMACs, and stale/replayed
 * timestamps. timingSafeEqual avoids leaking the HMAC via comparison timing.
 */
export function verifyStreamSignature(args: {
  callId: string;
  to: string;
  ts: string;
  sig: string;
}): boolean {
  if (!args.callId || !args.to || !args.ts || !args.sig) return false;
  const ageMs = Date.now() - Number(args.ts);
  if (!Number.isFinite(ageMs) || ageMs < -30_000 || ageMs > STREAM_SIG_TTL_MS) {
    return false;
  }
  const expected = signStreamParams(args.callId, args.to, args.ts);
  const a = Buffer.from(expected);
  const b = Buffer.from(args.sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** TwiML that hands the call's audio to the media WebSocket server. Adds a
 *  timestamp + HMAC so the media server can reject unsigned/forged streams. */
export function buildConnectResponse(
  mediaWsUrl: string,
  params: ConnectParams,
): string {
  const response = new twilio.twiml.VoiceResponse();
  const connect = response.connect();
  const stream = connect.stream({ url: mediaWsUrl });
  const ts = String(Date.now());
  const signed: Record<string, string> = {
    ...params,
    ts,
    sig: signStreamParams(params.callId, params.to, ts),
  };
  for (const [name, value] of Object.entries(signed)) {
    stream.parameter({ name, value: String(value) });
  }
  return response.toString();
}

/** TwiML for an unknown or disabled number — say a line and hang up. */
export function buildRejectResponse(message: string): string {
  const response = new twilio.twiml.VoiceResponse();
  response.say(
    { voice: "Polly.Joanna" },
    message || "Sorry, this number is not available right now. Goodbye.",
  );
  response.hangup();
  return response.toString();
}

/**
 * Verify a Twilio webhook signature. Twilio signs the full request URL plus the
 * POSTed form fields with the account auth token; rejecting unsigned requests
 * stops anyone from spoofing inbound-call webhooks.
 */
export function verifyTwilioSignature(args: {
  authToken: string;
  signature: string | null;
  url: string;
  params: Record<string, string>;
}): boolean {
  if (!args.signature) return false;
  return twilio.validateRequest(
    args.authToken,
    args.signature,
    args.url,
    args.params,
  );
}
