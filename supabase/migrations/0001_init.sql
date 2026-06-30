-- AI Receptionist — full schema (single migration).
-- Apply with the Supabase CLI:  supabase db push  (or paste into the SQL editor).
-- The call-engine + billing server connect with the service-role key and bypass
-- RLS; dashboard/client policies are added as auth is wired up.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- Businesses (one per account/workspace). The single-tenant root the call engine
-- resolves numbers through.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists businesses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Organizations — a user-facing corporation/workspace grouping. An organization
-- carries its own shared knowledge (websites, PDFs, notes); multiple assistants
-- are assigned to it and read that knowledge on every call (merged with their
-- own). This sits on top of the single-tenant `businesses` root used by the call
-- engine — it does not replace it, so number/business resolution is unchanged.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists organizations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete set null,
  name        text not null default 'My organization',
  description text not null default '',
  knowledge   jsonb not null default '{}'::jsonb,   -- shared {notes, sources[]}
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists organizations_owner_idx  on organizations (owner_id);
create index if not exists organizations_active_idx on organizations (owner_id) where deleted_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Assistants — the voice + behavior config. A phone number links to an assistant
-- and the engine builds the entire call config from it. Optionally assigned to an
-- organization, whose shared knowledge is merged in on every call. The org link is
-- nullable + ON DELETE SET NULL so deleting an organization never deletes its
-- assistants.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists assistants (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  owner_id        uuid references auth.users(id) on delete set null,
  name            text not null default 'My assistant',
  greeting        text not null default 'Hello, thanks for calling. How can I help?',
  system_prompt   text not null default '',
  voice_id        text not null default '',
  language        text not null default 'en',
  knowledge       jsonb not null default '{}'::jsonb,
  routing         jsonb not null default '{}'::jsonb,  -- transfer, sms alerts, calendar access, stt
  enabled         boolean not null default true,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists assistants_business_idx     on assistants (business_id);
create index if not exists assistants_organization_idx on assistants (organization_id);
create index if not exists assistants_owner_idx        on assistants (owner_id);
create index if not exists assistants_active_idx       on assistants (business_id) where deleted_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Phone numbers the AI answers. Only the number + its Twilio info + the assistant
-- it's assigned to; all behavior/voice config lives on the assistant, and the
-- business is derived through that assistant.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists phone_numbers (
  id            uuid primary key default gen_random_uuid(),
  assistant_id  uuid references assistants(id) on delete set null,
  e164          text not null unique,          -- +14155550142
  twilio_sid    text,                          -- PNxx␣ from Twilio
  enabled       boolean not null default true,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists phone_numbers_assistant_idx on phone_numbers (assistant_id);
create index if not exists phone_numbers_active_idx on phone_numbers (assistant_id) where deleted_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Third-party integrations (calendar, CRM, webhook). Provider-agnostic.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists integrations (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  type         text not null,                  -- 'calendar' | 'crm' | 'webhook'
  provider     text not null,                  -- 'google' | 'outlook' | 'calcom' | 'webhook' ...
  config       jsonb not null default '{}'::jsonb,
  enabled      boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists integrations_business_idx on integrations (business_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Calls — one row per phone call.
--
-- assistant_id + owner_id are denormalized onto each call: history for an
-- assistant/user becomes a single indexed lookup instead of a 2-hop join through
-- phone_numbers → assistants, and they snapshot who owned the call when it
-- happened (immune to later number reassignment). Both stay nullable + ON DELETE
-- SET NULL so deleting an assistant/user never deletes call history. They are
-- populated automatically by the BEFORE INSERT/UPDATE trigger below.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists calls (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references businesses(id) on delete cascade,
  phone_number_id   uuid references phone_numbers(id) on delete set null,
  assistant_id      uuid references assistants(id) on delete set null,
  owner_id          uuid references auth.users(id) on delete set null,
  twilio_call_sid   text unique,
  from_number       text,
  to_number         text,
  direction         text not null default 'inbound',
  status            text not null default 'initiated', -- initiated|in_progress|completed|failed
  started_at        timestamptz not null default now(),
  ended_at          timestamptz,
  duration_seconds  integer,
  recording_url     text,
  outcome           text,                          -- booked|message|transferred|resolved|abandoned
  sentiment         text,                          -- positive|neutral|negative
  summary           text,
  median_latency_ms integer,
  created_at        timestamptz not null default now()
);
create index if not exists calls_business_idx  on calls (business_id, started_at desc);
create index if not exists calls_assistant_idx on calls (assistant_id, started_at desc);
create index if not exists calls_owner_idx     on calls (owner_id, started_at desc);

-- Resolve assistant_id (from the number) and owner_id (from the assistant, or the
-- business owner as a fallback) whenever they are left unset on insert/update, so
-- every insert path (call engine, test calls) fills them without app changes.
create or replace function set_call_assignment()
returns trigger
language plpgsql
as $$
begin
  if new.assistant_id is null and new.phone_number_id is not null then
    select pn.assistant_id into new.assistant_id
    from phone_numbers pn
    where pn.id = new.phone_number_id;
  end if;

  if new.owner_id is null and new.assistant_id is not null then
    select a.owner_id into new.owner_id
    from assistants a
    where a.id = new.assistant_id;
  end if;

  if new.owner_id is null and new.business_id is not null then
    select b.owner_id into new.owner_id
    from businesses b
    where b.id = new.business_id;
  end if;

  return new;
end;
$$;

drop trigger if exists calls_set_assignment on calls;
create trigger calls_set_assignment
  before insert or update of phone_number_id, assistant_id on calls
  for each row execute function set_call_assignment();

-- ─────────────────────────────────────────────────────────────────────────────
-- Transcript turns — the running conversation, persisted live.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists call_turns (
  id          bigint generated always as identity primary key,
  call_id     uuid not null references calls(id) on delete cascade,
  role        text not null,                      -- caller | assistant
  text        text not null,
  ts_ms       integer not null default 0,         -- ms since call start
  created_at  timestamptz not null default now()
);
create index if not exists call_turns_call_idx on call_turns (call_id, id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Actions the AI took or queued (book appointment, take message, transfer).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists call_actions (
  id             uuid primary key default gen_random_uuid(),
  call_id        uuid not null references calls(id) on delete cascade,
  integration_id uuid references integrations(id) on delete set null,
  type           text not null,                   -- booking | message | transfer
  status         text not null default 'pending', -- pending|done|failed
  external_id    text,                            -- id returned by the provider
  payload        jsonb not null default '{}'::jsonb,
  error          text,
  created_at     timestamptz not null default now()
);
create index if not exists call_actions_call_idx on call_actions (call_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Account settings — one row per user. Holds profile details (name, company,
-- role, contact), an "about" blurb the user can choose to share with their AI
-- assistants (so callers can be told who the owner is), and notification
-- preferences. Billing lives in user_billing; this is everything else.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists account_settings (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  full_name              text not null default '',
  company                text not null default '',
  role                   text not null default '',
  phone                  text not null default '',
  timezone               text not null default '',
  about                  text not null default '',     -- shared with assistants when enabled
  share_with_assistants  boolean not null default true,
  notify_email           boolean not null default true,
  notify_email_address   text not null default '',
  notify_sms             boolean not null default false,
  notify_sms_number      text not null default '',
  updated_at             timestamptz not null default now()
);

-- Enable RLS; the server uses the service role (bypasses RLS). Dashboard
-- policies are added as auth is wired up.
alter table businesses       enable row level security;
alter table organizations    enable row level security;
alter table assistants       enable row level security;
alter table phone_numbers    enable row level security;
alter table integrations     enable row level security;
alter table calls            enable row level security;
alter table call_turns       enable row level security;
alter table call_actions     enable row level security;
alter table account_settings enable row level security;

-- ============================================================================
-- Stripe billing — subscription tracking + webhook idempotency. Self-contained.
-- Every writer is SECURITY DEFINER with EXECUTE revoked from anon/authenticated,
-- so it can only be called with the service-role key from trusted server code.
-- ============================================================================

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
alter table public.user_billing enable row level security;

drop policy if exists "user_billing self read" on public.user_billing;
create policy "user_billing self read"
  on public.user_billing for select
  to authenticated
  using (user_id = (select auth.uid()));

create table if not exists public.stripe_events (
  id           text primary key,        -- Stripe event id (evt_…)
  processed_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;  -- no policies: server-only

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

create or replace function public.get_billing(p_user uuid)
returns setof public.user_billing
language sql
security definer
set search_path = public
as $$
  select * from public.user_billing where user_id = p_user;
$$;

create or replace function public.get_user_by_customer(p_customer text)
returns table (user_id uuid)
language sql
security definer
set search_path = public
as $$
  select user_id from public.user_billing where stripe_customer_id = p_customer;
$$;

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

create or replace function public.release_stripe_event(p_event_id text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.stripe_events where id = p_event_id;
$$;

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
