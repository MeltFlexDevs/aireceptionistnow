/**
 * Seed the App Review demo account for APP_REVIEW_EMAIL: the auth user, one
 * organization and receptionist, a finished onboarding profile, a comp plan
 * and sample calls with transcripts (seedReviewAccount in
 * lib/mobile/review-login.ts).
 *
 * Safe to run again: it only adds what is missing. Run it again after a
 * reviewer deletes the account. It buys no number and calls neither Twilio nor
 * ElevenLabs, so the sample calls have no audio. It prints counts only.
 *
 * Needs APP_REVIEW_EMAIL, APP_REVIEW_CODE (exactly 6 digits), SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY in the environment. It loads no .env file itself.
 * It writes to the project that SUPABASE_URL points at.
 *
 * Usage:
 *   npx tsx scripts/seed-review-account.ts
 *   node --env-file=<env file> --import tsx scripts/seed-review-account.ts
 */
import { reviewCredentials, seedReviewAccount } from "../lib/mobile/review-login";
import { createAdminClient } from "../lib/supabase/admin";

async function main() {
  const credentials = reviewCredentials();
  if (!credentials) {
    console.error("Set APP_REVIEW_EMAIL and APP_REVIEW_CODE (exactly 6 digits) first.");
    process.exit(1);
  }
  const result = await seedReviewAccount(createAdminClient(), credentials.email);
  console.log(
    `review account: user ${result.userCreated ? "created" : "exists"}, ` +
      `organization ${result.organizationCreated ? "created" : "exists"}, ` +
      `assistant ${result.assistantCreated ? "created" : "exists"}, ` +
      `plan ${result.subscriptionSet ? "granted" : "kept"}, ` +
      `${result.callsInserted} calls and ${result.turnsInserted} turns added`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
