-- ============================================================================
-- AI Receptionist — Stripe billing schema
--
-- Subscription tracking + webhook idempotency. These objects are self-contained
-- and do not touch the call-engine tables, so this file is safe to run as-is.
--
-- Convention (mirrors the rest of the schema): the call engine + billing server
-- code connect with the service-role key and bypass RLS. Every writer below is
-- SECURITY DEFINER with EXECUTE revoked from anon/authenticated, so it can only
-- be called with the service-role key from trusted server code.
-- ============================================================================

-- One row per user holding their Stripe linkage + current subscription state.
create table if not exists public.user_billing (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text,
  plan                   text,           -- 'solo' | 'team' | null (no subscription)
  billing_cycle          text,           -- 'monthly' | 'annual' | null
  status                 text,           -- Stripe subscription status, or null
  current_period_end     timestamptz,    -- when the paid period ends / renews
  updated_at             timestamptz not null default now()
);

-- The browser may read its own billing row (to show the current plan); all
-- writes go through the SECURITY DEFINER functions below.
alter table public.user_billing enable row level security;

drop policy if exists "user_billing self read" on public.user_billing;
create policy "user_billing self read"
  on public.user_billing for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Processed Stripe event ids — the webhook idempotency guard.
create table if not exists public.stripe_events (
  id           text primary key,        -- Stripe event id (evt_…)
  processed_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;  -- no policies: server-only

-- ----------------------------------------------------------------------------
-- Functions
-- ----------------------------------------------------------------------------

-- Record/refresh the Stripe customer id for a user (called when checkout starts).
create or replace function public.set_customer(p_user uuid, p_customer text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_billing (user_id, stripe_customer_id, updated_at)
  values (p_user, p_customer, now())
  on conflict (user_id) do update
    set stripe_customer_id = excluded.stripe_customer_id,
        updated_at = now();
end;
$$;

-- Persist the user's subscription state.
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
begin
  insert into public.user_billing (
    user_id, stripe_customer_id, stripe_subscription_id,
    plan, billing_cycle, status, current_period_end, updated_at
  )
  values (
    p_user, p_customer, p_subscription,
    p_plan, p_cycle, p_status, p_current_period_end, now()
  )
  on conflict (user_id) do update
    set stripe_customer_id     = coalesce(excluded.stripe_customer_id, public.user_billing.stripe_customer_id),
        stripe_subscription_id = excluded.stripe_subscription_id,
        plan                   = excluded.plan,
        billing_cycle          = excluded.billing_cycle,
        status                 = excluded.status,
        current_period_end     = excluded.current_period_end,
        updated_at             = now();
end;
$$;

-- Read a user's billing row (returns 0 rows if none).
create or replace function public.get_billing(p_user uuid)
returns setof public.user_billing
language sql
security definer
set search_path = public
as $$
  select * from public.user_billing where user_id = p_user;
$$;

-- Map a Stripe customer back to the Supabase user that owns it.
create or replace function public.get_user_by_customer(p_customer text)
returns table (user_id uuid)
language sql
security definer
set search_path = public
as $$
  select user_id from public.user_billing where stripe_customer_id = p_customer;
$$;

-- Idempotency: claim an event id. Returns true the first time only.
create or replace function public.claim_stripe_event(p_event_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.stripe_events (id) values (p_event_id);
  return true;
exception
  when unique_violation then
    return false;
end;
$$;

-- Release a claimed event so a later Stripe retry can reprocess it.
create or replace function public.release_stripe_event(p_event_id text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.stripe_events where id = p_event_id;
$$;

-- ----------------------------------------------------------------------------
-- Lock down EXECUTE: service-role only.
-- ----------------------------------------------------------------------------
revoke all on function public.set_customer(uuid, text) from public, anon, authenticated;
revoke all on function public.set_subscription(uuid, text, text, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.get_billing(uuid) from public, anon, authenticated;
revoke all on function public.get_user_by_customer(text) from public, anon, authenticated;
revoke all on function public.claim_stripe_event(text) from public, anon, authenticated;
revoke all on function public.release_stripe_event(text) from public, anon, authenticated;

grant execute on function public.set_customer(uuid, text) to service_role;
grant execute on function public.set_subscription(uuid, text, text, text, text, text, timestamptz) to service_role;
grant execute on function public.get_billing(uuid) to service_role;
grant execute on function public.get_user_by_customer(text) to service_role;
grant execute on function public.claim_stripe_event(text) to service_role;
grant execute on function public.release_stripe_event(text) to service_role;
