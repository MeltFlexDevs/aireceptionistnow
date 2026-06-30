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

-- Enable RLS; the server uses the service role (bypasses RLS), like every other
-- table. A self-read policy is added for when client reads land.
alter table account_settings enable row level security;
