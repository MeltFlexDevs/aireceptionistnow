import twilio from "twilio";

// Provision a Twilio number from the dashboard: search a voice-capable number,
// buy it, and point its Voice webhook at our app — so the user never copies a
// SID or touches the Twilio console.

function twilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      (process.env.TWILIO_AUTH_TOKEN ||
        (process.env.TWILIO_API_KEY_SID && process.env.TWILIO_API_KEY_SECRET)),
  );
}

// Prefer a scoped API Key (SK…) for REST calls; fall back to the auth token.
function twilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const keySid = process.env.TWILIO_API_KEY_SID;
  const keySecret = process.env.TWILIO_API_KEY_SECRET;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid) throw new Error("TWILIO_ACCOUNT_SID is not set.");
  if (keySid && keySecret) return twilio(keySid, keySecret, { accountSid });
  if (token) return twilio(accountSid, token);
  throw new Error("Set TWILIO_API_KEY_SID/SECRET or TWILIO_AUTH_TOKEN.");
}

export interface BoughtNumber {
  e164: string;
  sid: string;
}

export async function buyTwilioNumber(opts: {
  country: string;
  areaCode?: string;
}): Promise<BoughtNumber> {
  if (!twilioConfigured()) {
    throw new Error("Twilio credentials are not set on the server.");
  }
  const base = process.env.APP_BASE_URL;
  const client = twilioClient();
  const country = (opts.country || "US").toUpperCase();

  const available = await client
    .availablePhoneNumbers(country)
    .local.list({
      voiceEnabled: true,
      areaCode: opts.areaCode ? Number(opts.areaCode) : undefined,
      limit: 1,
    });
  if (available.length === 0) {
    throw new Error(
      `No voice numbers available in ${country}${opts.areaCode ? ` area ${opts.areaCode}` : ""}.`,
    );
  }

  // Regulated countries (DE, GB, …) require an Address and/or Regulatory Bundle.
  // Attach the account's matching ones if they exist.
  const reg: { addressSid?: string; bundleSid?: string } = {};
  try {
    const addresses = await client.addresses.list({ limit: 50 });
    const addr = addresses.find((a) => a.isoCountry === country) ?? addresses[0];
    if (addr) reg.addressSid = addr.sid;
  } catch {
    // no addresses available — ignore
  }
  try {
    const bundles = await client.numbers.v2.regulatoryCompliance.bundles.list({ limit: 50 });
    const bundle = bundles.find(
      (b) =>
        (b as { isoCountry?: string }).isoCountry === country &&
        b.status === "twilio-approved",
    );
    if (bundle) reg.bundleSid = bundle.sid;
  } catch {
    // no bundles available — ignore
  }

  let purchased: Awaited<ReturnType<typeof client.incomingPhoneNumbers.create>>;
  try {
    purchased = await client.incomingPhoneNumbers.create({
      phoneNumber: available[0].phoneNumber,
      voiceUrl: base ? `${base}/api/twilio/voice` : undefined,
      voiceMethod: "POST",
      statusCallback: base ? `${base}/api/twilio/status` : undefined,
      statusCallbackMethod: "POST",
      ...reg,
    });
  } catch (err) {
    const msg = (err as Error).message ?? "";
    if (/address|bundle/i.test(msg)) {
      throw new Error(
        `${country} numbers need a verified Address and Regulatory Bundle in your Twilio account (Console → Phone Numbers → Regulatory Compliance). Set those up, or pick US/CA.`,
      );
    }
    throw err;
  }

  return { e164: purchased.phoneNumber, sid: purchased.sid };
}

/**
 * Make sure a specific number is set up in Twilio. If the account already owns
 * it, just (re)point its Voice webhook at our app. If not, provision that exact
 * number. Returns its SID, or null when Twilio isn't configured (connect-only).
 */
export async function ensureTwilioNumber(
  e164: string,
): Promise<{ sid: string | null; provisioned: boolean }> {
  if (!twilioConfigured()) return { sid: null, provisioned: false };
  const base = process.env.APP_BASE_URL;
  const client = twilioClient();
  const voiceUrl = base ? `${base}/api/twilio/voice` : undefined;
  const statusCallback = base ? `${base}/api/twilio/status` : undefined;

  const owned = (
    await client.incomingPhoneNumbers.list({ phoneNumber: e164, limit: 20 })
  ).find((n) => n.phoneNumber === e164);

  if (owned) {
    await client.incomingPhoneNumbers(owned.sid).update({
      voiceUrl,
      voiceMethod: "POST",
      statusCallback,
      statusCallbackMethod: "POST",
    });
    return { sid: owned.sid, provisioned: false };
  }

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: e164,
    voiceUrl,
    voiceMethod: "POST",
    statusCallback,
    statusCallbackMethod: "POST",
  });
  return { sid: purchased.sid, provisioned: true };
}

/** Release (delete) a number from the Twilio account so it stops billing. */
export async function releaseTwilioNumber(sid: string): Promise<void> {
  if (!twilioConfigured()) return;
  await twilioClient().incomingPhoneNumbers(sid).remove();
}
