import { createHash, timingSafeEqual } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

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
 * - Unset env (`APP_REVIEW_EMAIL` / `APP_REVIEW_CODE`) means the route does
 *   not exist: 404, always.
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
 *   no auth user re-creates it (empty, still reviewable); the owner re-seeds.
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
  return email && code ? { email, code } : null;
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
