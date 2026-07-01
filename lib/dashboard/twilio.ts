import twilio from "twilio";
import { CNAM_POLICY_SID, sanitizeCnam } from "./cnam";

// Dashboard-side Twilio: provision numbers, place calls, and read call logs.

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

export interface TwilioStatus {
  configured: boolean;
  ok: boolean;
  error?: string;
}

/**
 * Live health check of the Twilio integration for the dashboard badge: are creds
 * present, and do they actually authenticate? Does one cheap read (fetch the
 * account) so an invalid/rotated key shows red, not just "unset". Never throws.
 */
export async function getTwilioStatus(): Promise<TwilioStatus> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  if (!twilioConfigured() || !accountSid) {
    return { configured: false, ok: false, error: "Twilio credentials not set." };
  }
  const keySid = process.env.TWILIO_API_KEY_SID;
  const keySecret = process.env.TWILIO_API_KEY_SECRET;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const auth =
    keySid && keySecret ? `${keySid}:${keySecret}` : `${accountSid}:${token ?? ""}`;
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        headers: { authorization: `Basic ${Buffer.from(auth).toString("base64")}` },
        cache: "no-store",
      },
    );
    if (res.ok) return { configured: true, ok: true };
    return {
      configured: true,
      ok: false,
      error: res.status === 401 ? "Invalid Twilio credentials." : `Twilio error ${res.status}.`,
    };
  } catch {
    return { configured: true, ok: false, error: "Couldn't reach Twilio." };
  }
}

/**
 * Regulated countries (DE, GB, …) require an Address and/or Regulatory Bundle
 * on the purchase. Attach the account's matching ones if they exist, otherwise
 * buy unadorned (works for US/CA).
 */
async function regulatoryAttachments(
  client: ReturnType<typeof twilioClient>,
  country: string,
): Promise<{ addressSid?: string; bundleSid?: string }> {
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
  return reg;
}

export async function buyTwilioNumber(opts: {
  country: string;
  areaCode?: string;
}): Promise<BoughtNumber> {
  const [first] = await buyTwilioNumbers(opts, 1);
  if (!first) {
    const country = (opts.country || "US").toUpperCase();
    throw new Error(`Could not purchase a number in ${country}.`);
  }
  return first;
}

/**
 * Buy up to `count` voice numbers in one pass. Used to seed/replenish the shared
 * number pool. Lists `count` available numbers, then purchases each; numbers
 * snapped up by someone else between listing and buying are skipped. Throws only
 * when none could be bought (or on a regulatory-compliance blocker).
 */
export async function buyTwilioNumbers(
  opts: { country: string; areaCode?: string },
  count: number,
): Promise<BoughtNumber[]> {
  if (!twilioConfigured()) {
    throw new Error("Twilio credentials are not set on the server.");
  }
  if (count < 1) return [];
  const base = process.env.APP_BASE_URL;
  const client = twilioClient();
  const country = (opts.country || "US").toUpperCase();

  const available = await client
    .availablePhoneNumbers(country)
    .local.list({
      voiceEnabled: true,
      areaCode: opts.areaCode ? Number(opts.areaCode) : undefined,
      limit: count,
    });
  if (available.length === 0) {
    throw new Error(
      `No voice numbers available in ${country}${opts.areaCode ? ` area ${opts.areaCode}` : ""}.`,
    );
  }

  const reg = await regulatoryAttachments(client, country);

  const bought: BoughtNumber[] = [];
  for (const candidate of available) {
    try {
      const purchased = await client.incomingPhoneNumbers.create({
        phoneNumber: candidate.phoneNumber,
        voiceUrl: base ? `${base}/api/twilio/voice` : undefined,
        voiceMethod: "POST",
        statusCallback: base ? `${base}/api/twilio/status` : undefined,
        statusCallbackMethod: "POST",
        ...reg,
      });
      bought.push({ e164: purchased.phoneNumber, sid: purchased.sid });
    } catch (err) {
      const msg = (err as Error).message ?? "";
      if (/address|bundle/i.test(msg)) {
        throw new Error(
          `${country} numbers need a verified Address and Regulatory Bundle in your Twilio account (Console → Phone Numbers → Regulatory Compliance). Set those up, or pick US/CA.`,
        );
      }
      // Number taken between list and buy, or a transient error — skip it.
    }
  }
  if (bought.length === 0) {
    throw new Error(`Could not purchase any numbers in ${country}.`);
  }
  return bought;
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

/** Place an outbound call that runs the given TwiML when answered. */
export async function placeCall(
  to: string,
  from: string,
  twiml: string,
): Promise<string> {
  if (!twilioConfigured()) {
    throw new Error("Twilio credentials are not set on the server.");
  }
  const call = await twilioClient().calls.create({ to, from, twiml });
  return call.sid;
}

// ── Call logs (reconcile dashboard history against Twilio) ───────────────────

export interface TwilioCallLog {
  sid: string;
  date: string;
  status: string;
  direction: string;
  from: string;
  to: string;
  durationSec: number;
}

function normalizeDirection(dir: string | null | undefined): string {
  return (dir ?? "").startsWith("outbound") ? "outbound" : "inbound";
}

type TwilioCallInstance = {
  sid: string;
  startTime?: Date | null;
  dateCreated?: Date | null;
  status?: string | null;
  direction?: string | null;
  from?: string | null;
  to?: string | null;
  duration?: string | null;
};

function toLog(c: TwilioCallInstance): TwilioCallLog {
  const when = c.startTime ?? c.dateCreated;
  return {
    sid: c.sid,
    date: when ? new Date(when).toISOString() : "",
    status: c.status ?? "",
    direction: normalizeDirection(c.direction),
    from: c.from ?? "",
    to: c.to ?? "",
    durationSec: Number(c.duration ?? 0) || 0,
  };
}

/** Recent Twilio call logs for the account (matches the Twilio Console list). */
export async function listTwilioCalls(limit = 100): Promise<TwilioCallLog[]> {
  if (!twilioConfigured()) return [];
  const calls = await twilioClient().calls.list({ limit });
  return calls.map(toLog);
}

/** A single Twilio call by SID, or null if not configured / not found. */
export async function fetchTwilioCall(sid: string): Promise<TwilioCallLog | null> {
  if (!twilioConfigured() || !sid) return null;
  try {
    return toLog(await twilioClient().calls(sid).fetch());
  } catch {
    return null;
  }
}

// ── CNAM (caller ID name) via Trust Hub ──────────────────────────────────────

export interface CnamResult {
  trustProductSid: string;
  displayName: string;
  status: string;
}

/**
 * Register a CNAM display name for a phone number through Trust Hub, so the
 * recipient sees the business/assistant name on outbound calls. Requires an
 * approved Trust Hub Business Profile; US long-code numbers only; allow 48-72h
 * to propagate. Best-effort with actionable errors for the common blockers.
 */
export async function registerCnam(opts: {
  displayName: string;
  phoneSid: string;
  email?: string;
}): Promise<CnamResult> {
  if (!twilioConfigured()) throw new Error("Twilio credentials are not set on the server.");
  const display = sanitizeCnam(opts.displayName);
  if (display.length < 2) {
    throw new Error("CNAM name must start with a letter and be at least 2 characters.");
  }
  const client = twilioClient();

  const profiles = await client.trusthub.v1.customerProfiles.list({ limit: 50 });
  const profile = profiles.find((p) => p.status === "twilio-approved") ?? profiles[0];
  if (!profile) {
    throw new Error(
      "No Trust Hub Business Profile found. Create and verify one in Twilio Console > Trust Hub before registering CNAM.",
    );
  }
  if (profile.status !== "twilio-approved") {
    throw new Error(
      `Your Trust Hub Business Profile is '${profile.status}', not approved yet. CNAM can be registered once it is approved.`,
    );
  }

  const email = opts.email || profile.email || process.env.CNAM_CONTACT_EMAIL || "";
  const trustProduct = await client.trusthub.v1.trustProducts.create({
    email,
    friendlyName: `CNAM ${display}`,
    policySid: CNAM_POLICY_SID,
  });

  const endUser = await client.trusthub.v1.endUsers.create({
    type: "cnam_information",
    friendlyName: `CNAM ${display}`,
    attributes: { cnam_display_name: display },
  });

  await client.trusthub.v1
    .trustProducts(trustProduct.sid)
    .trustProductsEntityAssignments.create({ objectSid: profile.sid });
  await client.trusthub.v1
    .trustProducts(trustProduct.sid)
    .trustProductsEntityAssignments.create({ objectSid: endUser.sid });
  await client.trusthub.v1
    .trustProducts(trustProduct.sid)
    .trustProductsChannelEndpointAssignment.create({
      channelEndpointSid: opts.phoneSid,
      channelEndpointType: "phone-number",
    });

  const submitted = await client.trusthub.v1
    .trustProducts(trustProduct.sid)
    .update({ status: "pending-review" });

  return { trustProductSid: trustProduct.sid, displayName: display, status: submitted.status };
}
