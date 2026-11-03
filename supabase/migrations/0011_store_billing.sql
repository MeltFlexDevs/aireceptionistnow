-- ─────────────────────────────────────────────────────────────────────────────
-- Store subscriptions (App Store / Google Play) on user_billing.
--
-- Apply after 0010_account_devices.sql. Independent of 0012 (account
-- deletion), which lands in parallel; the two touch different objects.
--
-- The web's gating never changes: every consumer still reads
-- `user_billing.status in ('active','trialing')` + `plan`. What this adds is
-- WHO bills the row (`provider`) and the store-side handle we need to match
-- renewals/refunds to a user (`provider_ref` = Apple originalTransactionId, or
-- the RevenueCat app user id = our user id for Google Play), plus the sandbox
-- flag provisioning uses to skip buying a live phone number for a test
-- purchase.
--
-- Precedence, enforced inside the SECURITY DEFINER writers rather than trusted
-- from route code:
--   * a LIVE Stripe row (status active/trialing/past_due/unpaid/incomplete and
--     period not ended) refuses an active store write -> 'stripe_active';
--   * an ACTIVE store row (apple/google, active/trialing, period not ended)
--     refuses a live Stripe write -> 'store_active' and silently ignores a
--     non-live one; Stripe must never overwrite the Apple originalTransactionId
--     of a subscription that is still being billed by Apple;
--   * a stale non-active store event never demotes another provider's (or
--     another store ref's) live entitlement - a live Stripe row included, even
--     while Stripe is still collecting;
--   * a Sandbox store write never replaces a live Production store row.
-- Every statement is idempotent so the file is safe to run twice.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.user_billing
  add column if not exists provider text
    check (provider in ('stripe', 'apple', 'google', 'comp')),
  add column if not exists provider_ref text,
  add column if not exists environment text,            -- 'Production' | 'Sandbox' | null (stores only)
  add column if not exists cancel_at_period_end boolean not null default false;

-- Legacy rows: everything written so far came from Stripe, or is a comp grant
-- (synthetic customer id 'comp:<uid>', see lib/comp-accounts.ts).
update public.user_billing
   set provider     = case when stripe_customer_id like 'comp:%' then 'comp' else 'stripe' end,
       provider_ref = stripe_customer_id
 where provider is null
   and stripe_customer_id is not null;

-- One store subscription belongs to one account. Stripe rows are excluded: the
-- customer id already has its own unique constraint and comp refs are per user.
create unique index if not exists user_billing_provider_ref_idx
  on public.user_billing (provider, provider_ref)
  where provider_ref is not null and provider in ('apple', 'google');

-- Idempotency store for store webhooks, keyed per source so an Apple
-- notificationUUID and a RevenueCat event id can never collide.
create table if not exists public.billing_events (
  source       text not null,           -- 'asn' (App Store Server Notifications) | 'rc' (RevenueCat)
  id           text not null,
  processed_at timestamptz not null default now(),
  primary key (source, id)
);
alter table public.billing_events enable row level security;  -- no policies: server-only

-- Store writer. Upserts the store entitlement for p_user while enforcing the
-- precedence rules above. Raises 'stripe_active' (P0001) when the account is
-- live on Stripe and the incoming status is active/trialing - the route maps
-- it to 409. Raises 'other_account' (P0001) when the (provider, provider_ref)
-- already belongs to a different user, which the routes pre-check but a race
-- can still reach. Keeps stripe_customer_id / stripe_subscription_id untouched
-- so a later Stripe checkout can reuse the customer.
create or replace function public.set_store_subscription(
  p_user uuid,
  p_provider text,
  p_provider_ref text,
  p_plan text,
  p_cycle text,
  p_status text,
  p_current_period_end timestamptz,
  p_environment text,
  p_cancel_at_period_end boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing          public.user_billing%rowtype;
  existing_provider text;
  existing_live     boolean;
  incoming_active   boolean := p_status in ('active', 'trialing');
begin
  if p_provider not in ('apple', 'google') then
    raise exception 'invalid_provider' using errcode = 'P0001';
  end if;

  -- Deleted account (webhooks keep arriving for a while): a no-op, not an FK
  -- violation that would make Apple/RevenueCat retry for days.
  if not exists (select 1 from auth.users where id = p_user) then
    return;
  end if;

  select * into existing from public.user_billing where user_id = p_user for update;

  if found then
    -- Rows written before this migration may predate the backfill.
    existing_provider := coalesce(
      existing.provider,
      case
        when existing.stripe_customer_id like 'comp:%' then 'comp'
        when existing.stripe_customer_id is not null then 'stripe'
      end
    );
    existing_live := existing.current_period_end is null or existing.current_period_end > now();

    -- Live Stripe subscription: the store must not become a second biller.
    if existing_provider = 'stripe'
       and existing.status in ('active', 'trialing', 'past_due', 'unpaid', 'incomplete')
       and existing_live
       and incoming_active then
      raise exception 'stripe_active' using errcode = 'P0001';
    end if;

    -- A non-active event (expired, refunded, canceled ...) for a different
    -- provider, or a different store subscription, must never demote a live
    -- entitlement. Only the subscription that owns the row can end it. A live
    -- Stripe row counts even while Stripe is still collecting (past_due,
    -- unpaid, incomplete - the same rule as the guard above): demoting it
    -- would let the app sell a store subscription on top of it.
    if not incoming_active
       and existing_live
       and (existing.status in ('active', 'trialing')
            or (existing_provider = 'stripe'
                and existing.status in ('past_due', 'unpaid', 'incomplete')))
       and (existing_provider is distinct from p_provider
            or existing.provider_ref is distinct from p_provider_ref) then
      return;
    end if;

    -- A sandbox entitlement (TestFlight, App Review, a Play test track) never
    -- replaces a live Production one: a paying customer who also runs test
    -- builds would otherwise lose the live number gate (canAssignNumber
    -- answers 'sandbox') until the next Production renewal flips the row back.
    if p_environment = 'Sandbox'
       and existing.environment = 'Production'
       and existing_provider in ('apple', 'google')
       and existing.status in ('active', 'trialing')
       and existing_live then
      return;
    end if;
  end if;

  insert into public.user_billing (
    user_id, provider, provider_ref,
    plan, billing_cycle, status, current_period_end,
    environment, cancel_at_period_end, updated_at
  )
  values (
    p_user, p_provider, p_provider_ref,
    p_plan, p_cycle, p_status, p_current_period_end,
    p_environment, coalesce(p_cancel_at_period_end, false), now()
  )
  on conflict (user_id) do update
    set provider             = excluded.provider,
        provider_ref         = excluded.provider_ref,
        plan                 = excluded.plan,
        billing_cycle        = excluded.billing_cycle,
        status               = excluded.status,
        current_period_end   = excluded.current_period_end,
        environment          = excluded.environment,
        cancel_at_period_end = excluded.cancel_at_period_end,
        updated_at           = now();
exception
  when unique_violation then
    -- user_billing_provider_ref_idx: this store subscription is already bound
    -- to another account.
    raise exception 'other_account' using errcode = 'P0001';
end;
$$;

-- Stripe writer, redefined with the same signature (create or replace is valid
-- because the parameters and return type are unchanged). Three differences from
-- 0001: a deleted account is a no-op; an active store row is never overwritten
-- (raises 'store_active' for a live Stripe status, ignores a non-live one); and
-- the provider columns are set from the customer id.
create or replace function public.set_subscription(
  p_user uuid,
  p_customer text,
  p_subscription text,
  p_plan text,
  p_cycle text,
  p_status text,
  p_current_period_end timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing      public.user_billing%rowtype;
  incoming_live boolean := p_status in ('active', 'trialing', 'past_due', 'unpaid', 'incomplete');
begin
  -- Account deleted (WP-06 cancels the Stripe subscription and then removes the
  -- auth user, so the resulting subscription events reference nobody): a no-op
  -- instead of an FK violation Stripe would retry for days.
  if not exists (select 1 from auth.users where id = p_user) then
    return;
  end if;

  select * into existing from public.user_billing where user_id = p_user for update;

  if found
     and existing.provider in ('apple', 'google')
     and existing.status in ('active', 'trialing')
     and (existing.current_period_end is null or existing.current_period_end > now()) then
    if incoming_live then
      -- Overwriting would lose the store provider_ref (the Apple
      -- originalTransactionId) and double-bill the account.
      raise exception 'store_active' using errcode = 'P0001';
    end if;
    return;
  end if;

  insert into public.user_billing (
    user_id, stripe_customer_id, stripe_subscription_id,
    plan, billing_cycle, status, current_period_end,
    provider, provider_ref, environment, cancel_at_period_end, updated_at
  )
  values (
    p_user, p_customer, p_subscription,
    p_plan, p_cycle, p_status, p_current_period_end,
    case when p_customer like 'comp:%' then 'comp' else 'stripe' end,
    p_customer, null, false, now()
  )
  on conflict (user_id) do update
    set stripe_customer_id     = coalesce(excluded.stripe_customer_id, public.user_billing.stripe_customer_id),
        stripe_subscription_id = excluded.stripe_subscription_id,
        plan                   = excluded.plan,
        billing_cycle          = excluded.billing_cycle,
        status                 = excluded.status,
        current_period_end     = excluded.current_period_end,
        provider               = excluded.provider,
        provider_ref           = coalesce(excluded.provider_ref, public.user_billing.stripe_customer_id),
        environment            = null,
        cancel_at_period_end   = false,
        updated_at             = now();
end;
$$;

-- Which account owns a store subscription (Apple originalTransactionId, or the
-- RevenueCat app user id). Used to bind a purchase to the signed-in user and to
-- route notifications that carry no appAccountToken.
create or replace function public.get_user_by_provider_ref(p_provider text, p_ref text)
returns table (user_id uuid)
language sql
security definer
set search_path = public
as $$
  select user_id from public.user_billing
   where provider = p_provider and provider_ref = p_ref;
$$;

create or replace function public.claim_billing_event(p_source text, p_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.billing_events (source, id) values (p_source, p_id);
  return true;
exception
  when unique_violation then
    return false;
end;
$$;

create or replace function public.release_billing_event(p_source text, p_id text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.billing_events where source = p_source and id = p_id;
$$;

revoke all on function public.set_store_subscription(uuid, text, text, text, text, text, timestamptz, text, boolean) from public, anon, authenticated;
revoke all on function public.set_subscription(uuid, text, text, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.get_user_by_provider_ref(text, text) from public, anon, authenticated;
revoke all on function public.claim_billing_event(text, text) from public, anon, authenticated;
revoke all on function public.release_billing_event(text, text) from public, anon, authenticated;

grant execute on function public.set_store_subscription(uuid, text, text, text, text, text, timestamptz, text, boolean) to service_role;
grant execute on function public.set_subscription(uuid, text, text, text, text, text, timestamptz) to service_role;
grant execute on function public.get_user_by_provider_ref(text, text) to service_role;
grant execute on function public.claim_billing_event(text, text) to service_role;
grant execute on function public.release_billing_event(text, text) to service_role;
