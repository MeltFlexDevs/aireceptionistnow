import { createHash, timingSafeEqual } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { DEFAULT_VOICE_ID } from "@/lib/call-engine/voice/catalog";
import { isActiveStatus } from "@/lib/store-billing/snapshot";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicSupabaseEnv } from "@/lib/supabase/config";

/**
 * App Review / Play review sign-in without an inbox.
 *
 * The app signs in with an email OTP. A store reviewer has the demo account's
 * email and a fixed code from App Review Information, but no access to that
 * mailbox, so the normal OTP never reaches them. This route accepts that fixed
 * code for that one email and mints a real Supabase session for it.
 *
 * Hardening, because this is a password on a route with no bearer:
 * - Unset env (`APP_REVIEW_EMAIL` / `APP_REVIEW_CODE`), or a code that is not
 *   exactly 6 digits, means the route does not exist: 404, always.
 * - Only requests for the review email are counted and rate limited (20 an
 *   hour, durable in `review_login_attempts`). The app calls this after every
 *   failed OTP, so an ordinary typo must not burn the reviewer's budget.
 *   A request over the limit gets the same 404 as any miss: a 429 would
 *   confirm the review email.
 * - Every 404 takes at least MIN_MISS_MS, so the response time does not show
 *   whether the email was the review email.
 * - Email and code compare in constant time over SHA-256 digests; every
 *   mismatch is the same 404 as "unset". Nothing here logs the email, the code
 *   or a token.
 * - Self-healing: a reviewer may test Settings > Delete account on the demo
 *   account, which would break sign-in for every later reviewer. A match with
 *   no auth user re-creates it (empty, still reviewable); the owner re-seeds
 *   it with scripts/seed-review-account.ts.
 */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 20;

/**
 * Every 404 takes at least this long from the start of the request. A miss on
 * another email makes no network call, and the review email makes two, so
 * without a floor the timing would show which email is the review email.
 */
export const MIN_MISS_MS = 500;

export interface ReviewLoginClock {
  now: () => number;
  sleep: (ms: number) => Promise<void>;
}

const realClock: ReviewLoginClock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

export type ReviewLoginResult =
  | { status: 200; access_token: string; refresh_token: string }
  | { status: 404 };

/** Trim + lowercase: what the user typed versus what the env holds must not differ by case. */
export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeCode(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Constant-time equality. Hashing first makes both sides the same length, so
 * `timingSafeEqual` never throws and the comparison leaks nothing about the
 * expected value's length either.
 */
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

export interface ReviewCredentials {
  email: string;
  code: string;
}

export function reviewCredentials(): ReviewCredentials | null {
  const email = normalizeEmail(process.env.APP_REVIEW_EMAIL);
  const code = normalizeCode(process.env.APP_REVIEW_CODE);
  if (!email || !code) return null;
  // The app's code field keeps digits only and stops at 6, so any other code can never be typed.
  if (!/^\d{6}$/.test(code)) {
    console.error("[review-login] APP_REVIEW_CODE must be exactly 6 digits");
    return null;
  }
  return { email, code };
}

/** Whether the request is for the review account at all (decides if it is counted). */
export function isReviewEmail(input: unknown, expected: ReviewCredentials): boolean {
  const email = normalizeEmail(input);
  return email.length > 0 && safeEqual(email, expected.email);
}

/** Both halves must match; the email is re-checked so this is safe on its own. */
export function reviewCredentialsMatch(
  input: { email: unknown; code: unknown },
  expected: ReviewCredentials,
): boolean {
  const emailOk = isReviewEmail(input.email, expected);
  const code = normalizeCode(input.code);
  const codeOk = code.length > 0 && safeEqual(code, expected.code);
  // Evaluate both before combining so a wrong email costs the same as a wrong code.
  return emailOk && codeOk;
}

/** Record this attempt and say whether the hourly budget is already spent. */
async function recordAttempt(): Promise<{ id: number | null; limited: boolean }> {
  const admin = createAdminClient();
  const inserted = await admin
    .from("review_login_attempts")
    .insert({ ok: false })
    .select("id")
    .single();
  if (inserted.error) throw new Error(inserted.error.message);

  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await admin
    .from("review_login_attempts")
    .select("id", { count: "exact", head: true })
    .gte("attempted_at", since);
  if (error) throw new Error(error.message);

  const id = typeof inserted.data?.id === "number" ? inserted.data.id : Number(inserted.data?.id);
  // The row just inserted is in the count, so "20 before this one" is > 20.
  return { id: Number.isFinite(id) ? id : null, limited: (count ?? 0) > MAX_ATTEMPTS_PER_WINDOW };
}

/** Make sure an auth user exists for the review email; true when it had to be re-created. */
async function ensureReviewUser(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (!error) return true;
  if (error.code === "email_exists" || error.code === "user_already_exists" || error.status === 422) {
    return false;
  }
  throw new Error(error.message);
}

/**
 * A session for the review user: a magic link minted with the service role and
 * redeemed here with the anon client, exactly what the app would get from a
 * real OTP.
 */
async function mintSession(email: string): Promise<{ access_token: string; refresh_token: string } | null> {
  const pub = publicSupabaseEnv();
  if (!pub) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) throw new Error(error?.message ?? "magic link refused");

  const anon = createClient(pub.url, pub.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const verified = await anon.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  const session = verified.data.session;
  if (verified.error || !session) throw new Error(verified.error?.message ?? "verify refused");
  return { access_token: session.access_token, refresh_token: session.refresh_token };
}

async function attemptReviewLogin(input: { email: unknown; code: unknown }): Promise<ReviewLoginResult> {
  const expected = reviewCredentials();
  if (!expected) return { status: 404 };

  // Not the review account: same answer as "route does not exist", not counted.
  if (!isReviewEmail(input.email, expected)) return { status: 404 };

  let attempt: { id: number | null; limited: boolean };
  try {
    attempt = await recordAttempt();
  } catch (err) {
    // Fail closed: without the attempts table there is no rate limit, and a
    // rate-limit-free fixed code is not something to expose.
    console.error("[review-login] attempts table unavailable - run migration 0012", err);
    return { status: 404 };
  }
  // A spent budget looks like any miss, so the limit never confirms the email.
  if (attempt.limited) return { status: 404 };

  if (!reviewCredentialsMatch(input, expected)) return { status: 404 };

  try {
    if (await ensureReviewUser(expected.email)) {
      console.warn("[review-login] review user re-created");
    }
    const session = await mintSession(expected.email);
    if (!session) return { status: 404 };

    if (attempt.id !== null) {
      await createAdminClient()
        .from("review_login_attempts")
        .update({ ok: true })
        .eq("id", attempt.id);
    }
    return { status: 200, ...session };
  } catch (err) {
    console.error("[review-login] sign-in failed", err instanceof Error ? err.message : err);
    return { status: 404 };
  }
}

export async function reviewLogin(
  input: { email: unknown; code: unknown },
  clock: ReviewLoginClock = realClock,
): Promise<ReviewLoginResult> {
  const started = clock.now();
  const result = await attemptReviewLogin(input);
  if (result.status === 404) {
    // Same floor for every miss: unset env, other email, spent budget, wrong code, errors.
    const left = MIN_MISS_MS - (clock.now() - started);
    if (left > 0) await clock.sleep(left);
  }
  return result;
}

/*
 * App Review demo data, written by scripts/seed-review-account.ts.
 *
 * The review notes promise a receptionist and sample calls. This writes them
 * with the service role and only adds what is missing, so it is safe to run
 * again. It buys no number and calls neither Twilio nor ElevenLabs: the sample
 * calls have transcripts but no audio.
 */

const REVIEW_COMPANY = "Bright Smile Dental (demo)";
const REVIEW_ASSISTANT = "Ava";
const REVIEW_GREETING = "Thanks for calling Bright Smile Dental, this is Ava. How can I help you today?";

export interface ReviewSampleCall {
  minutesAgo: number;
  durationSec: number;
  from: string;
  outcome: "booked" | "message" | "resolved";
  sentiment: "positive" | "neutral" | "negative";
  summary: string;
  turns: { role: "caller" | "assistant"; atSec: number; text: string }[];
}

/** 5 short calls from fictional 555-01xx numbers, newest first. */
export const REVIEW_SAMPLE_CALLS: readonly ReviewSampleCall[] = [
  {
    minutesAgo: 42,
    durationSec: 41,
    from: "+15555550101",
    outcome: "booked",
    sentiment: "positive",
    summary: "New patient Maria Lopez booked a cleaning for Tuesday at 10 AM.",
    turns: [
      { role: "assistant", atSec: 0, text: REVIEW_GREETING },
      { role: "caller", atSec: 4, text: "Hi, I'd like to book a teeth cleaning. I'm a new patient." },
      { role: "assistant", atSec: 9, text: "Happy to help. I have Tuesday at 10 AM or Thursday at 2 PM. Which works better?" },
      { role: "caller", atSec: 16, text: "Tuesday at 10 is perfect." },
      { role: "assistant", atSec: 20, text: "Great. Can I have your full name, please?" },
      { role: "caller", atSec: 26, text: "Maria Lopez." },
      {
        role: "assistant",
        atSec: 31,
        text: "You're all set for Tuesday at 10 AM, Maria. Please come ten minutes early to fill in the new patient form.",
      },
    ],
  },
  {
    minutesAgo: 185,
    durationSec: 29,
    from: "+15555550102",
    outcome: "message",
    sentiment: "neutral",
    summary: "James Carter asked about a charge on his last bill and wants a call back from billing after 3 PM.",
    turns: [
      { role: "assistant", atSec: 0, text: REVIEW_GREETING },
      { role: "caller", atSec: 3, text: "I have a question about a charge on my last bill." },
      {
        role: "assistant",
        atSec: 8,
        text: "I can take a message for our billing team. What's your name and the best time to call you back?",
      },
      { role: "caller", atSec: 15, text: "James Carter. Any time after 3 PM works." },
      {
        role: "assistant",
        atSec: 21,
        text: "Thanks, James. I've passed this on, and someone from billing will call you back after 3 PM.",
      },
    ],
  },
  {
    minutesAgo: 1450,
    durationSec: 24,
    from: "+15555550103",
    outcome: "resolved",
    sentiment: "positive",
    summary: "A caller asked about Saturday hours and parking. Ava gave the hours and said parking is free behind the building.",
    turns: [
      { role: "assistant", atSec: 0, text: REVIEW_GREETING },
      { role: "caller", atSec: 3, text: "Are you open on Saturdays?" },
      { role: "assistant", atSec: 6, text: "Yes, we're open on Saturdays from 9 AM to 1 PM." },
      { role: "caller", atSec: 11, text: "Great. Is there parking nearby?" },
      { role: "assistant", atSec: 15, text: "Yes, there's free parking right behind the building." },
      { role: "caller", atSec: 19, text: "Perfect, thank you." },
    ],
  },
  {
    minutesAgo: 2890,
    durationSec: 36,
    from: "+15555550104",
    outcome: "booked",
    sentiment: "positive",
    summary: "Priya Shah moved her Friday check-up to Monday at 4 PM.",
    turns: [
      { role: "assistant", atSec: 0, text: REVIEW_GREETING },
      { role: "caller", atSec: 4, text: "Hi, I need to move my check-up on Friday." },
      { role: "assistant", atSec: 9, text: "No problem. Can I have your name, please?" },
      { role: "caller", atSec: 13, text: "Priya Shah." },
      { role: "assistant", atSec: 18, text: "Thanks, Priya. I can offer Monday at 4 PM or Wednesday at 11 AM." },
      { role: "caller", atSec: 25, text: "Monday at 4, please." },
      { role: "assistant", atSec: 29, text: "Done. Your check-up is now on Monday at 4 PM." },
    ],
  },
  {
    minutesAgo: 4370,
    durationSec: 26,
    from: "+15555550105",
    outcome: "resolved",
    sentiment: "neutral",
    summary:
      "A caller asked if their employer's dental insurance is accepted. Ava said most major plans are and asked them to bring their card.",
    turns: [
      { role: "assistant", atSec: 0, text: REVIEW_GREETING },
      { role: "caller", atSec: 3, text: "Do you take my dental insurance? It's through my employer." },
      {
        role: "assistant",
        atSec: 9,
        text: "We accept most major dental plans. Please bring your insurance card to your visit and we'll check your coverage.",
      },
      { role: "caller", atSec: 17, text: "Okay, will do. Thanks." },
      { role: "assistant", atSec: 20, text: "You're welcome. Have a great day." },
    ],
  },
];

export interface ReviewSeedResult {
  userCreated: boolean;
  organizationCreated: boolean;
  assistantCreated: boolean;
  subscriptionSet: boolean;
  callsInserted: number;
  turnsInserted: number;
}

const USERS_PER_PAGE = 1000;
const MAX_USER_PAGES = 100;

/** The auth user with this email, created with the email confirmed when there is none. */
async function findOrCreateUser(admin: SupabaseClient, email: string): Promise<{ id: string; created: boolean }> {
  for (let page = 1; page <= MAX_USER_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: USERS_PER_PAGE });
    if (error) throw new Error(error.message);
    const found = data.users.find((user) => normalizeEmail(user.email) === email);
    if (found) return { id: found.id, created: false };
    if (data.users.length < USERS_PER_PAGE) break;
  }
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error || !data.user) throw new Error(error?.message ?? "createUser returned no user");
  return { id: data.user.id, created: true };
}

/** The oldest live row of `table` that the user owns, or null. */
async function firstOwnedId(
  admin: SupabaseClient,
  table: "organizations" | "assistants",
  userId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from(table)
    .select("id")
    .eq("owner_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) throw new Error(error.message);
  const id = data?.[0]?.id;
  return typeof id === "string" ? id : null;
}

async function insertId(admin: SupabaseClient, table: string, row: Record<string, unknown>): Promise<string> {
  const { data, error } = await admin.from(table).insert(row).select("id").single();
  if (error) throw new Error(error.message);
  const id = data?.id;
  if (typeof id !== "string") throw new Error(`${table} insert returned no id`);
  return id;
}

export async function seedReviewAccount(
  admin: SupabaseClient,
  email: string,
  now: Date = new Date(),
): Promise<ReviewSeedResult> {
  const target = normalizeEmail(email);
  if (!target) throw new Error("review email is empty");
  const user = await findOrCreateUser(admin, target);

  let orgId = await firstOwnedId(admin, "organizations", user.id);
  const organizationCreated = orgId === null;
  if (orgId === null) {
    orgId = await insertId(admin, "organizations", { owner_id: user.id, name: REVIEW_COMPANY });
  }

  let assistantId = await firstOwnedId(admin, "assistants", user.id);
  const assistantCreated = assistantId === null;
  if (assistantId === null) {
    // The defaults of createAssistant (lib/dashboard/db.ts), plus the organization and the demo greeting.
    // No ElevenLabs agent and no number: nothing outside the database is touched.
    assistantId = await insertId(admin, "assistants", {
      owner_id: user.id,
      organization_id: orgId,
      name: REVIEW_ASSISTANT,
      greeting: REVIEW_GREETING,
      voice_id: DEFAULT_VOICE_ID,
      language: "multi",
      routing: { sttProvider: "elevenlabs", voiceTier: "natural" },
    });
  }

  const settings = await admin
    .from("account_settings")
    .upsert({ user_id: user.id, company: REVIEW_COMPANY }, { onConflict: "user_id" });
  if (settings.error) throw new Error(settings.error.message);

  // Status "done" is what app/api/mobile/onboarding/route.ts reads, so the app skips setup.
  const profile = await admin.from("onboarding_profiles").upsert(
    {
      user_id: user.id,
      status: "done",
      step: 3,
      config: { companyName: REVIEW_COMPANY, assistantName: REVIEW_ASSISTANT },
      result: { orgId, assistantId },
      updated_at: now.toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (profile.error) throw new Error(profile.error.message);

  // A comp plan (customer "comp:<user id>"), unless the account already has an active plan.
  const billing = await admin.rpc("get_billing", { p_user: user.id });
  if (billing.error) throw new Error(billing.error.message);
  const current = Array.isArray(billing.data) ? billing.data[0] : billing.data;
  const hasPlan = Boolean(current?.plan) && isActiveStatus(current?.status);
  if (!hasPlan) {
    const periodEnd = new Date(now);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    const granted = await admin.rpc("set_subscription", {
      p_user: user.id,
      p_customer: `comp:${user.id}`,
      p_subscription: null,
      p_plan: "solo",
      p_cycle: "monthly",
      p_status: "active",
      p_current_period_end: periodEnd.toISOString(),
      p_cancel_at_period_end: false,
    });
    if (granted.error) throw new Error(granted.error.message);
  }

  // Sample calls go only into an account with no calls, so a second run adds none.
  const existing = await admin.from("calls").select("id").eq("owner_id", user.id).limit(1);
  if (existing.error) throw new Error(existing.error.message);
  let callsInserted = 0;
  let turnsInserted = 0;
  if ((existing.data ?? []).length === 0) {
    for (const sample of REVIEW_SAMPLE_CALLS) {
      const startedAt = new Date(now.getTime() - sample.minutesAgo * 60_000);
      const endedAt = new Date(startedAt.getTime() + sample.durationSec * 1000);
      // No twilio_call_sid and no elevenlabs_conversation_id: the call detail asks
      // neither Twilio nor ElevenLabs, and there is no recording to play.
      const callId = await insertId(admin, "calls", {
        owner_id: user.id,
        assistant_id: assistantId,
        direction: "inbound",
        status: "completed",
        from_number: sample.from,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_seconds: sample.durationSec,
        outcome: sample.outcome,
        sentiment: sample.sentiment,
        summary: sample.summary,
      });
      callsInserted += 1;
      const turns = await admin
        .from("call_turns")
        .insert(sample.turns.map((turn) => ({ call_id: callId, role: turn.role, text: turn.text, ts_ms: turn.atSec * 1000 })));
      if (turns.error) throw new Error(turns.error.message);
      turnsInserted += sample.turns.length;
    }
  }

  return {
    userCreated: user.created,
    organizationCreated,
    assistantCreated,
    subscriptionSet: !hasPlan,
    callsInserted,
    turnsInserted,
  };
}
