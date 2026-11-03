# Billing (Stripe subscriptions)

Two subscription plans wired to Supabase. When a user pays, the Stripe webhook
records their plan + status on `public.user_billing`; the pricing page reads the
plan catalogue and starts Stripe Checkout.

## Plans

Defined once in `lib/plans.ts` and reused by the pricing page, checkout and the
webhook. Each plan is billable **monthly** or **annually** (annual = 15% off the
12× monthly price, billed once a year).

| Plan | Monthly | Annual (−15%)        | For            |
| ---- | ------- | -------------------- | -------------- |
| Solo | €99/mo  | €1,009.80/yr (≈€84/mo) | 1–20 calls/day  |
| Team | €299/mo | €3,049.80/yr (≈€254/mo) | 20–100 calls/day |

## Architecture

```
app/(main)/pricing  (PricingClient.tsx, also rendered at /<locale>/pricing)
      │ Terms ticked, not signed in → AuthDialog (next=<page>?plan&cycle)
      │   → resumes on return in the tab that holds the tick
      │ POST /api/checkout { plan, cycle, acceptedTerms }
      ▼
/api/checkout ──> Stripe Checkout (hosted) ──> success_url /dashboard?checkout=success
      │ (links Stripe customer ⇄ supabase user_id)
      ▼
Stripe ──(subscription events)──> /api/stripe/webhook
      │ verify signature → claim event (idempotent)
      ▼
set_subscription(user, plan, cycle, status, period_end)   [service-role RPC]
```

Files:

- `lib/stripe.ts` — server Stripe client.
- `lib/plans.ts` — plan catalogue (monthly + annual price ids from env).
- `lib/billing.ts` — service-role RPC wrappers (subscription state, idempotency).
- `lib/billing-client.ts` — browser helpers (`startCheckout`, `openBillingPortal`).
- `lib/supabase/admin.ts` — service-role Supabase client (server-only).
- `app/(main)/pricing/` — the pricing page (`PricingClient.tsx`).
- `app/api/checkout/route.ts` — creates a Checkout session.
- `app/api/billing-portal/route.ts` — opens the Stripe Customer Portal.
- `app/api/stripe/webhook/route.ts` — records subscription state; idempotent.
- `supabase/migrations/0002_billing.sql` — billing + idempotency tables/functions.
- `scripts/setup-stripe.mjs` — creates the products/prices in Stripe.

## Environment variables

Set in Vercel (Production + Preview) and `.env` for local testing:

| Var                                   | What                                                        |
| ------------------------------------- | ----------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                   | `sk_test_…` while testing, `sk_live_…`/`rk_live_…` in prod  |
| `STRIPE_WEBHOOK_SECRET`               | Signing secret of the webhook endpoint                      |
| `NEXT_PUBLIC_STRIPE_PRICE_SOLO_MONTHLY` | Solo monthly price id from the setup script               |
| `NEXT_PUBLIC_STRIPE_PRICE_SOLO_ANNUAL`  | Solo annual price id                                      |
| `NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY` | Team monthly price id                                     |
| `NEXT_PUBLIC_STRIPE_PRICE_TEAM_ANNUAL`  | Team annual price id                                      |
| `NEXT_PUBLIC_SITE_URL`                | Base URL for redirects (optional; request origin preferred) |

Reused (already present): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Activation — step by step

### 1. Apply the migration

Supabase SQL Editor → run `supabase/migrations/0002_billing.sql` (or
`supabase db push`).

### 2. Create the Stripe products/prices

```bash
# TEST mode first:
STRIPE_SECRET_KEY=sk_test_… node scripts/setup-stripe.mjs
```

Copy the printed `NEXT_PUBLIC_STRIPE_PRICE_*` lines into your env. Re-run with a
live `sk_live_…`/`rk_live_…` key to create the live prices.

### 3. Configure the webhook

Local testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copy the printed whsec_… into STRIPE_WEBHOOK_SECRET
```

Production: Stripe Dashboard → Developers → Webhooks → add endpoint
`https://<your-domain>/api/stripe/webhook`, subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET` on Vercel.

### 4. Test the flow

1. Open `/pricing`, pick a cycle, tick the Terms box and choose a plan.
   `/api/checkout` answers 400 without the tick.
2. If signed out you'll sign in first and land back on the same pricing page
   with `?plan=&cycle=`. It resumes checkout only in the tab that holds the
   Terms tick (`lib/terms-resume.ts`). A link alone only pre-selects the cycle.
3. Pay with a test card (`4242 4242 4242 4242`, any future date/CVC).
4. Land on `/dashboard?checkout=success`; the webhook writes the plan +
   `active` status to `public.user_billing` within a few seconds.
5. Open the Stripe Customer Portal (via `openBillingPortal()`) to switch plans
   or cancel.

### 5. Go live

Swap the test keys/price ids for live ones on Vercel, redeploy, and do one real
low-value purchase to confirm the end-to-end webhook write.

## Store subscriptions (App Store / Google Play)

The native app sells the same two plans as in-app purchases: StoreKit 2 on
iOS (expo-iap), RevenueCat on Android. Nothing is trusted from the app - every
purchase is verified server-side and lands on the same `user_billing` row the
web reads, so the dashboard, provisioning and plan limits work unchanged for a
store subscriber.

### Architecture

```
iOS app ── StoreKit purchase ──> POST /api/mobile/billing/apple/verify { jws }
      Apple's server library verifies the JWS (root certs embedded in
      lib/store-billing/apple-root-certs.ts, online OCSP), binds it to the
      account (appAccountToken = user id), writes user_billing.

Android app ── RevenueCat purchase ──> POST /api/mobile/billing/google/sync
      The server re-reads the subscriber from the RevenueCat REST API
      (app user id = our user id) and derives the entitlement itself.

App Store ──(Server Notifications v2)──> POST /api/apple/notifications
RevenueCat ──(webhook, Authorization header)──> POST /api/revenuecat/webhook
      Renewals, expiry, refunds, grace periods, pauses, transfers.
      Claimed in billing_events (idempotent), then the same write path.

GET /api/mobile/billing -> BillingSnapshot (uncached read of the row)
```

Files: `lib/store-billing/products.ts` (product ids), `apple.ts` (JWS +
notification verification), `revenuecat.ts` (subscriber fetch), `status.ts`
(event -> row mapping, unit tested), `snapshot.ts` (the app's view + the
precedence predicates), `entitle.ts` (the one write path: save, expire the
cached plan context, start provisioning). Migration:
`supabase/migrations/0011_store_billing.sql`.

### Product ids

| Plan | App Store product                          | Google Play base plan | RevenueCat package |
| ---- | ------------------------------------------ | --------------------- | ------------------ |
| Solo | `com.aireceptionistnow.app.solo.monthly`   | `solo:monthly`        | `solo_monthly`     |
|      | `com.aireceptionistnow.app.solo.annual`    | `solo:annual`         | `solo_annual`      |
| Team | `com.aireceptionistnow.app.team.monthly`   | `team:monthly`        | `team_monthly`     |
|      | `com.aireceptionistnow.app.team.annual`    | `team:annual`         | `team_annual`      |

RevenueCat entitlements are `solo` and `team`. The catalogue the app renders
(`/api/mobile/catalog`, `/api/mobile/onboarding`) also carries `storeIncluded`
(the `included` lines without euro prices - the store sets the price) and
`storeFeatures` (`features` minus "Connect own SIP" and "Outbound calls &
Campaigns", which the product does not deliver yet; the web pricing page still
advertises them).

### Environment variables

| Var                               | What                                                                 |
| --------------------------------- | -------------------------------------------------------------------- |
| `APPLE_BUNDLE_ID`                 | `com.aireceptionistnow.app`                                          |
| `APPLE_APP_APPLE_ID`              | The app's numeric Apple ID (App Store Connect > App Information). Required to verify Production payloads; Sandbox works without it. |
| `REVENUECAT_SECRET_KEY`           | RevenueCat secret API key (server-side subscriber reads)             |
| `REVENUECAT_WEBHOOK_AUTH`         | The Authorization header value configured on the RevenueCat webhook  |
| `STORE_SANDBOX_PROVISION_NUMBERS` | `1` lets a sandbox purchase buy a live Twilio number (test stacks only) |

Missing Apple / RevenueCat configuration makes the verify/sync routes answer
503 `Billing is not configured yet. Please try again later.`

### Webhook URLs

- App Store Connect > App > App Store Server Notifications: set
  `https://aireceptionistnow.com/api/apple/notifications` as BOTH the
  Production and the Sandbox URL (version 2). The route tells the environments
  apart by verifying against Production first, then Sandbox.
- RevenueCat > Project > Integrations > Webhooks: URL
  `https://aireceptionistnow.com/api/revenuecat/webhook`, Authorization header
  value = `REVENUECAT_WEBHOOK_AUTH`. Only Play Store events are applied; the
  event payload is never trusted - the subscriber is re-fetched and mapped by
  the same code as the sync route.

### Provider precedence

`user_billing` gained `provider` (`stripe` | `apple` | `google` | `comp`),
`provider_ref` (Apple originalTransactionId / RevenueCat app user id / Stripe
customer id), `environment` (`Production` | `Sandbox`, stores only) and
`cancel_at_period_end`. The rules live in the SQL writers, not in route code:

- A **live Stripe** row (status active/trialing/past_due/unpaid/incomplete and
  `current_period_end` null or in the future) refuses an active store write:
  `set_store_subscription` raises `stripe_active`, the routes answer
  `409 { code: 'stripe_active' }`. The app uses the identical rule to hide the
  paywall's buy button for web subscribers.
- An **active store** row refuses a live Stripe write (`set_subscription`
  raises `store_active`; the Stripe webhook logs the subscription id and
  answers 200 - that subscription needs a manual refund) and ignores a
  non-live one. `/api/checkout` answers 409 up front when a store subscription
  is active.
- A non-active store event (expired, refunded, ...) never demotes a live row
  of another provider or another store subscription. A live Stripe row counts
  even while Stripe is still collecting (past_due/unpaid/incomplete), so a
  stale store event cannot open the paywall on top of it.
- A Sandbox store write never replaces a live Production store row (a paying
  customer who also runs TestFlight keeps the live number gate); the write is
  a no-op and the route returns the Production snapshot.
- Apple `SUBSCRIBED`/`DID_RENEW` retried past the period end (or after the
  `EXPIRED` that followed) do not re-activate: an ended transaction maps to
  grace/past_due/canceled from the renewal info instead.
- A store subscription is bound to one account: `appAccountToken` must be the
  signed-in user, and an `originalTransactionId` already recorded for someone
  else answers `409 { code: 'other_account' }` (also enforced by a unique
  index).
- Both writers are no-ops for a deleted auth user, so post-deletion webhooks
  do not fail on the foreign key.

### Sandbox purchases

App Review, TestFlight and Play test tracks buy in the store sandbox. Those
entitlements are recorded (`environment = 'Sandbox'`) and unlock the app like
a real one, but provisioning never buys a live phone number for them: the
assistant is deployed, `onboarding_profiles.result.sandbox = true`, and the
number gate (`canAssignNumber`) answers `code: 'sandbox'`. Set
`STORE_SANDBOX_PROVISION_NUMBERS=1` on a test stack to lift that.

### Status mapping

See `lib/store-billing/status.ts` and its tests. In short: Apple
`SUBSCRIBED`/`DID_RENEW` -> active until `expiresDate`; auto-renew toggles only
set `cancel_at_period_end`; `DID_FAIL_TO_RENEW` -> active until the grace date
or `past_due`; `EXPIRED`/`REFUND`/`REVOKE` -> canceled, except a late event
for a period the stored row already moved past, which changes nothing.
RevenueCat: active
while `expires_date` runs (cancel flag from `unsubscribe_detected_at`),
billing issue -> active until the grace date else `past_due`, paused ->
`paused` until `auto_resume_date`, expired/refunded -> canceled.

## Notes

- **Idempotency:** every event id is claimed in `stripe_events` before
  processing, marked processed after success and released on failure, so a
  retry of a handled event is skipped. A claim that is still not processed
  after 5 minutes (a crashed or timed-out run) is claimed again by the next
  retry (0014). While another run holds the claim, the claim returns `busy`
  and the route answers 409, so the sender retries. Only a processed event
  answers 200 duplicate. Store webhooks do the same in `billing_events` (keyed
  by source + id).
- **Cancel flag:** the Stripe webhook stores `cancel_at_period_end` when Stripe
  sets it, or when `cancel_at` is at or before the period end
  (`lib/stripe-subscription.ts`). A store write with no flag (the Apple verify
  route) keeps the stored flag of the same subscription (0014).
- **One tracked Stripe subscription:** while the stored subscription is live
  (active, trialing, past_due, unpaid or incomplete, with the period open),
  `set_subscription` ignores the events of another Stripe subscription (0013).
  When the stored one stops billing (deleted, or updated to a status that is
  not live), the webhook lists the customer's subscriptions and applies another
  live one, if any (`pickLiveSibling` in `lib/stripe-subscription.ts`). A status
  that grants a plan (active, trialing) wins, then the latest period end.
  Exception: a stored one that grants no plan (past_due, unpaid, incomplete)
  gives way to an active or trialing one. The webhook follows such a sibling
  after the stored one's update (`siblingToFollow`).
- **Server-authoritative:** all writes run through SECURITY DEFINER RPCs
  callable only with the service-role key; the browser can never grant itself a
  subscription.
- **Plan gating:** the dashboard needs sign-in. Paid features check the plan
  in `lib/dashboard/plan.ts`: `getPlanContext` gives the plan, its limits and
  the usage, and `canAssignNumber` refuses a number with `plan_required` (no
  plan) or `limit_reached` (the plan's number limit is used up).
- **Store period rule:** both read the row through `grantsPlan`
  (`lib/store-billing/snapshot.ts`), the same rule as the app's billing
  snapshot (`toSnapshot`). A row grants its plan only when it is active or
  trialing and has a plan. An App Store or Google Play row also needs
  `current_period_end` to be null or in the future, so a missed expiry event
  does not keep paid features on. Stripe rows keep the status rule (the
  Stripe webhook ends them), and comp grants do not expire.
