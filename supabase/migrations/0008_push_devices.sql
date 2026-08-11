-- ─────────────────────────────────────────────────────────────────────────────
-- Push notification targets for the native app (`aireceptionistnowapp`).
--
-- One row per install, keyed by the Expo push token. The token is the identity:
-- it is what the Expo push service routes on, and reinstalling the app or
-- restoring to a new device mints a new one, so a user legitimately has several
-- live rows at once (phone + tablet, or a stale row from a wiped handset).
--
-- Why a token is not a secret worth guarding beyond RLS: possessing it lets
-- someone send a notification to that install, nothing more - it grants no read
-- access to any call data. It is still owner-scoped here so one tenant cannot
-- enumerate another's devices.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.push_devices (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  -- ExponentPushToken[...] - unique because the same install re-registering on
  -- every cold start must update its row, not accumulate duplicates that would
  -- buzz the phone once per stale row.
  token       text not null unique,
  platform    text not null default 'unknown', -- ios | android | unknown
  -- The user's own switch, flipped from Settings > Alerts. Kept here rather
  -- than only in app state so turning alerts off actually stops the send at the
  -- source; a client-side mute still delivers to the OS and still buzzes.
  enabled     boolean not null default true,
  -- Refreshed on every register call. A token Expo has not seen in months is
  -- almost certainly a dead install; this is what a future prune reads.
  last_seen_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- The send path's only lookup: every device for one owner. Partial, because a
-- disabled row is never a send target and there is no other query shape.
create index if not exists push_devices_owner_idx
  on public.push_devices (owner_id)
  where enabled;

alter table public.push_devices enable row level security;

-- No policies, matching `calls` / `phone_numbers` / `stripe_events`: the app
-- never touches this table with the anon key. Registration goes through
-- POST /api/mobile/push, which verifies the bearer token and writes on the
-- service-role client. See lib/mobile/push.ts for why that boundary matters.
