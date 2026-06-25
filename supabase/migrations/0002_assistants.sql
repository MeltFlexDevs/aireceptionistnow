-- AI assistants: the voice + behavior config, independent of a phone number.
-- A phone number links to an assistant; the engine builds the call config from
-- the linked assistant (falling back to the number's own columns).

create table if not exists assistants (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  name          text not null default 'My assistant',
  greeting      text not null default 'Hello, thanks for calling. How can I help?',
  system_prompt text not null default '',
  voice_id      text not null default '',
  language      text not null default 'en',
  knowledge     jsonb not null default '{}'::jsonb,
  routing       jsonb not null default '{}'::jsonb,  -- transfer, sms alerts, calendar access, stt
  enabled       boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists assistants_business_idx on assistants (business_id);

-- Which assistant answers this number (null = use the number's own settings).
alter table phone_numbers
  add column if not exists assistant_id uuid references assistants(id) on delete set null;

alter table assistants enable row level security;
