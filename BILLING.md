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
app/pricing  (PricingClient.tsx)
      │ not signed in → AuthDialog (next=/pricing?plan&cycle) → resumes on return
      │ POST /api/checkout { plan, cycle }
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
- `app/pricing/` — the pricing page (`PricingClient.tsx`).
- `app/api/checkout/route.ts` — creates a Checkout session.
- `app/api/billing-portal/route.ts` — opens the Stripe Customer Portal.
- `app/api/stripe/webhook/route.ts` — records subscription state; idempotent.
- `supabase/migrations/0002_billing.sql` — billing + idempotency tables/functions.
- `scripts/setup-stripe.mjs` — creates the products/prices in Stripe.

## Environment variables

Set in Vercel (Production + Preview) and `.env.local` for local testing:

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

1. Open `/pricing`, pick a cycle, choose a plan.
2. If signed out you'll sign in first and land back on `/pricing`, which resumes
   checkout automatically.
3. Pay with a test card (`4242 4242 4242 4242`, any future date/CVC).
4. Land on `/dashboard?checkout=success`; the webhook writes the plan +
   `active` status to `public.user_billing` within a few seconds.
5. Open the Stripe Customer Portal (via `openBillingPortal()`) to switch plans
   or cancel.

### 5. Go live

Swap the test keys/price ids for live ones on Vercel, redeploy, and do one real
low-value purchase to confirm the end-to-end webhook write.

## Notes

- **Idempotency:** every event id is claimed in `stripe_events` before
  processing and released on failure, so a subscription change is applied
  exactly once even across Stripe retries.
- **Server-authoritative:** all writes run through SECURITY DEFINER RPCs
  callable only with the service-role key; the browser can never grant itself a
  subscription.
- **No paywall yet:** the dashboard is gated on auth only. Read the current plan
  anywhere via `getBilling(userId)` (`lib/billing.ts`) when you want to gate
  features by plan.
