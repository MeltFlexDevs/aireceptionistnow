import twilio from "twilio";

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

/** TwiML that hands the call's audio to the media WebSocket server. */
export function buildConnectResponse(
  mediaWsUrl: string,
  params: ConnectParams,
): string {
  const response = new twilio.twiml.VoiceResponse();
  const connect = response.connect();
  const stream = connect.stream({ url: mediaWsUrl });
  for (const [name, value] of Object.entries(params)) {
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
