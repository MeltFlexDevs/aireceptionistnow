-- 0014_billing_event_claims.sql
--
-- Apply after 0013_stripe_current_subscription.sql.
--
-- 1. Webhook claims become leases (cr-billing-06). A claim used to count as
--    done as soon as it was inserted. A run that died after the claim and
--    before the release (a timeout, a crash) made every retry a duplicate, so
--    the event was lost. Now a claim stays in progress (processed_at null)
--    until the route marks it processed. A retry can take over a claim that
--    is still in progress after 5 minutes. Before that the claim returns
--    'busy' and the route answers 409, so the sender retries later. Rows from
--    before this migration keep their processed_at, so they stay done.
-- 2. Stripe's cancel-at-period-end flag (cr-billing-07). set_subscription
--    stored false on every write. It now takes the flag as a new last
--    parameter with default false, so 7-argument calls still work.
--    set_store_subscription treats a null flag as "keep the stored flag" when
--    the row is the same store subscription (same provider and provider_ref).
--
-- Apply this migration and deploy the code that calls the new functions
-- together. The claim functions now return text ('claimed', 'processed',
-- 'busy'), not boolean. The code from before this migration reads every text
-- result as a duplicate and answers 200, so an event that arrives in between
-- is lost. The new code answers 500 to the old boolean result, so the sender
-- retries it.

alter table public.stripe_events
  add column if not exists claimed_at timestamptz not null default now(),
  alter column processed_at drop not null,
  alter column processed_at drop default;

alter table public.billing_events
  add column if not exists claimed_at timestamptz not null default now(),
  alter column processed_at drop not null,
  alter column processed_at drop default;

-- The claim result: 'claimed' when this call owns the event (a new id, or a
-- claim still not processed after 5 minutes because the run that took it
-- died), 'processed' when a run handled it, 'busy' when another run claimed it
-- less than 5 minutes ago. The routes answer 200 duplicate only for
-- 'processed' and 409 for 'busy', so the sender retries after the lease ends.
-- The return type was boolean (0001, 0011), so drop the old function first.
drop function if exists public.claim_stripe_event(text);

create or replace function public.claim_stripe_event(p_event_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed boolean;
begin
  insert into public.stripe_events as e (id, claimed_at, processed_at)
  values (p_event_id, now(), null)
  on conflict (id) do update
    set claimed_at = now()
    where e.processed_at is null
      and e.claimed_at < now() - interval '5 minutes'
  returning true into claimed;
  if claimed then
    return 'claimed';
  end if;
  -- ON CONFLICT locked the row, so processed_at cannot change before this read.
  if exists (select 1 from public.stripe_events where id = p_event_id and processed_at is not null) then
    return 'processed';
  end if;
  return 'busy';
end;
$$;

create or replace function public.mark_stripe_event_processed(p_event_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.stripe_events set processed_at = now() where id = p_event_id;
$$;

-- The same result as claim_stripe_event, for store webhook deliveries.
drop function if exists public.claim_billing_event(text, text);

create or replace function public.claim_billing_event(p_source text, p_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed boolean;
begin
  insert into public.billing_events as e (source, id, claimed_at, processed_at)
  values (p_source, p_id, now(), null)
  on conflict (source, id) do update
    set claimed_at = now()
    where e.processed_at is null
      and e.claimed_at < now() - interval '5 minutes'
  returning true into claimed;
  if claimed then
    return 'claimed';
  end if;
  if exists (select 1 from public.billing_events where source = p_source and id = p_id and processed_at is not null) then
    return 'processed';
  end if;
  return 'busy';
end;
$$;

create or replace function public.mark_billing_event_processed(p_source text, p_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.billing_events set processed_at = now() where source = p_source and id = p_id;
$$;

-- set_subscription: the 0013 body plus p_cancel_at_period_end. A new
-- parameter is a new signature, so drop the 7-argument function first, or a
-- 7-argument call would match two functions.
drop function if exists public.set_subscription(uuid, text, text, text, text, text, timestamptz);

create or replace function public.set_subscription(
  p_user uuid,
  p_customer text,
  p_subscription text,
  p_plan text,
  p_cycle text,
  p_status text,
  p_current_period_end timestamptz,
  p_cancel_at_period_end boolean default false
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

  if found
     and coalesce(
           existing.provider,
           case
             when existing.stripe_customer_id like 'comp:%' then 'comp'
             when existing.stripe_customer_id is not null then 'stripe'
           end
         ) = 'stripe'
     and existing.stripe_subscription_id is not null
     and p_subscription is not null
     and existing.stripe_subscription_id <> p_subscription
     and existing.status in ('active', 'trialing', 'past_due', 'unpaid', 'incomplete')
     and (existing.current_period_end is null or existing.current_period_end > now())
     and not (existing.status in ('past_due', 'unpaid', 'incomplete')
              and p_status in ('active', 'trialing')) then
    -- An event of another Stripe subscription (an old one ending, or a second
    -- one): the row keeps following the live subscription it already tracks.
    -- Not when the tracked one grants no plan (past_due, unpaid, incomplete)
    -- and this one does (active, trialing): then the row follows the one that
    -- pays, so the owner gets the plan they pay for.
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
    p_customer, null, coalesce(p_cancel_at_period_end, false), now()
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
        cancel_at_period_end   = excluded.cancel_at_period_end,
        updated_at             = now();
end;
$$;

-- set_store_subscription: the 0011 body. Only the cancel_at_period_end update
-- changes. The Apple verify route passes null (a signed transaction has no
-- auto-renew state): keep the stored flag of the same store subscription.
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
        cancel_at_period_end = case
          when p_cancel_at_period_end is not null then p_cancel_at_period_end
          when public.user_billing.provider = excluded.provider
               and public.user_billing.provider_ref = excluded.provider_ref
            then public.user_billing.cancel_at_period_end
          else false
        end,
        updated_at           = now();
exception
  when unique_violation then
    -- user_billing_provider_ref_idx: this store subscription is already bound
    -- to another account.
    raise exception 'other_account' using errcode = 'P0001';
end;
$$;

revoke all on function public.set_subscription(uuid, text, text, text, text, text, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.set_store_subscription(uuid, text, text, text, text, text, timestamptz, text, boolean) from public, anon, authenticated;
revoke all on function public.claim_stripe_event(text) from public, anon, authenticated;
revoke all on function public.mark_stripe_event_processed(text) from public, anon, authenticated;
revoke all on function public.claim_billing_event(text, text) from public, anon, authenticated;
revoke all on function public.mark_billing_event_processed(text, text) from public, anon, authenticated;

grant execute on function public.set_subscription(uuid, text, text, text, text, text, timestamptz, boolean) to service_role;
grant execute on function public.set_store_subscription(uuid, text, text, text, text, text, timestamptz, text, boolean) to service_role;
grant execute on function public.claim_stripe_event(text) to service_role;
grant execute on function public.mark_stripe_event_processed(text) to service_role;
grant execute on function public.claim_billing_event(text, text) to service_role;
grant execute on function public.mark_billing_event_processed(text, text) to service_role;
