-- ─────────────────────────────────────────────────────────────────────────────
-- Stripe: one tracked subscription per account.
--
-- Apply after 0011_store_billing.sql. Redefines public.set_subscription with
-- the same signature and adds one rule: while the stored Stripe subscription
-- is live (the LIVE STRIPE rule of 0011), an event of another Stripe
-- subscription is ignored. One exception: a stored subscription that grants
-- no plan (past_due, unpaid, incomplete) gives way to another one that does
-- (active, trialing). Before, every event overwrote the row, so the
-- events of an old or a second subscription replaced the one the account
-- pays for (an old subscription's 'canceled' event cleared the plan).
--
-- Unchanged: writes for the stored subscription id, writes with no
-- subscription id (comp grants) and any write once the stored subscription
-- has ended. Idempotent: create or replace, then the same revoke / grant.
-- ─────────────────────────────────────────────────────────────────────────────

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

revoke all on function public.set_subscription(uuid, text, text, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.set_subscription(uuid, text, text, text, text, text, timestamptz) to service_role;
