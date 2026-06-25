-- AI Receptionist — call engine schema
-- Apply with the Supabase CLI:  supabase db push
-- or paste into the SQL editor. The call-engine server connects with the
-- service-role key and bypasses RLS; dashboard/client access policies are
-- added in a later migration.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- Businesses (one per account/workspace)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists businesses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Phone numbers the AI answers. label = Home | Work | Organization | Personal...
-- Per-number voice + behavior + knowledge so one account can run several lines.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists phone_numbers (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  label         text not null default 'Work',
  e164          text not null unique,          -- +14155550142
  twilio_sid    text,                          -- PNxx␣ from Twilio
  greeting      text not null default 'Hello, thanks for calling. How can I help?',
  system_prompt text not null default '',      -- behavior / persona for this line
  voice_id      text not null default '',      -- ElevenLabs voice id
  language      text not null default 'en',
  knowledge     jsonb not null default '{}'::jsonb,  -- hours, services, pricing, FAQs
  routing       jsonb not null default '{}'::jsonb,  -- transfer targets, business hours
  enabled       boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists phone_numbers_business_idx on phone_numbers (business_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Third-party integrations (calendar, CRM, webhook). Provider-agnostic:
-- `provider` names the adapter (google | calcom | calendly | outlook | webhook),
-- `config` holds whatever that adapter needs (tokens, urls, calendar ids).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists integrations (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  type         text not null,                  -- 'calendar' | 'crm' | 'webhook'
  provider     text not null,                  -- 'google' | 'calcom' | 'webhook' ...
  config       jsonb not null default '{}'::jsonb,
  enabled      boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists integrations_business_idx on integrations (business_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Calls — one row per phone call.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists calls (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references businesses(id) on delete cascade,
  phone_number_id  uuid references phone_numbers(id) on delete set null,
  twilio_call_sid  text unique,
  from_number      text,
  to_number        text,
  direction        text not null default 'inbound',
  status           text not null default 'initiated', -- initiated|in_progress|completed|failed
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  duration_seconds integer,
  recording_url    text,
  outcome          text,                          -- booked|message|transferred|resolved|abandoned
  sentiment        text,                          -- positive|neutral|negative
  summary          text,
  median_latency_ms integer,                      -- reply latency observed during call
  created_at       timestamptz not null default now()
);
create index if not exists calls_business_idx on calls (business_id, started_at desc);

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
-- Dispatched to integrations live or after the call.
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

-- Enable RLS; the server uses the service role (bypasses RLS). Dashboard
-- policies are added later once auth is wired up.
alter table businesses     enable row level security;
alter table phone_numbers  enable row level security;
alter table integrations   enable row level security;
alter table calls          enable row level security;
alter table call_turns     enable row level security;
alter table call_actions   enable row level security;
