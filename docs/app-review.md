# App Review account

Store reviewers sign in with a demo account. They get its email and a fixed code from the review notes. They cannot read that inbox, so the normal email code never reaches them. The route `app/api/mobile/auth/review/route.ts` accepts the fixed code for that one email. The logic is in `lib/mobile/review-login.ts`.

## Environment variables

Set both in Vercel for Production. If one is missing, the route answers 404.

- `APP_REVIEW_EMAIL`: the demo account's email. Case does not matter.
- `APP_REVIEW_CODE`: exactly 6 digits (0-9). Pick a random one.

The app's code field keeps digits only and stops at 6. So the server refuses any other format: the review sign-in stays off, and the log shows `[review-login] APP_REVIEW_CODE must be exactly 6 digits`. The log never shows the code or the email.

Put the same email and code in the review notes in App Store Connect and Google Play Console.

## Seed the demo data

The notes say the account has a receptionist and sample calls. `scripts/seed-review-account.ts` makes that true. It needs `APP_REVIEW_EMAIL`, `APP_REVIEW_CODE`, `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment. It loads no .env file by itself.

    npx tsx scripts/seed-review-account.ts
    node --env-file=<env file> --import tsx scripts/seed-review-account.ts

It writes to the project that `SUPABASE_URL` points at. Try it on a local Supabase (`supabase start`) first, and run it twice there.

It writes:
- the auth user, if it is missing
- an organization "Bright Smile Dental (demo)" and a receptionist "Ava"
- the company name in account settings
- an onboarding profile with status `done`, so the app skips setup
- a comp plan (Solo, monthly, one year), unless the account already has an active plan
- 5 sample calls with transcripts, only if the account has no calls

It buys no number and calls neither Twilio nor ElevenLabs. So the sample calls have no audio, and the receptionist has no ElevenLabs agent. Say so in the review notes. It prints one line with counts. It never prints the email, the code or a key.

## Run it again

The seed is safe to run again. A second run adds nothing.
- After a reviewer deletes the account (Settings > Delete account), the next review sign-in creates an empty user. Run the seed again.
- If a run stops halfway, the calls may be incomplete. Delete that user's calls in Supabase, then run the seed again.
