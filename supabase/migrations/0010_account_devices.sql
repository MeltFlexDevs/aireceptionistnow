-- ─────────────────────────────────────────────────────────────────────────────
-- Installs of the native app, linked to the website account that signed in.
--
-- Why this exists alongside `push_devices`: that table is keyed by the Expo push
-- token, which only exists on a physical device that granted notification
-- permission. It is a delivery address, not an identity - a simulator, a handset
-- that declined the prompt, and an install waiting on a token all have a real
-- session and no row there at all.
--
-- `device_id` is minted by the app on first launch and kept in the OS keychain,
-- so it survives sign-out, a token refresh and a new push token. That makes this
-- the table that answers "which devices is this account signed in on", which is
-- what the web dashboard lists and what a user revokes from.
--
-- Revoking a row does NOT end that device's Supabase session - the refresh token
-- lives in the device keychain and only GoTrue can invalidate it. What it does
-- is drop the record and let the next `/api/mobile/*` call see the device is
-- gone. Treat this as an inventory, not as an auth boundary; the bearer token
-- check in lib/mobile/auth.ts is the boundary.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.account_devices (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  -- The app's keychain UUID. Unique per (owner, device) rather than globally:
  -- one handset legitimately signs into two accounts, and a global unique would
  -- make the second sign-in steal the first account's row.
  device_id    text not null,
  platform     text not null default 'unknown', -- ios | android | unknown
  -- Shown in the dashboard's device list so a person can tell which handset a
  -- row is. Free text from the client, so never trusted for anything but
  -- display, and length-capped on write.
  model        text,
  os_version   text,
  app_version  text,
  -- Bumped by the register call the app makes once per foreground session. This
  -- is what "Last active" reads.
  last_seen_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  unique (owner_id, device_id)
);

-- The dashboard's only query shape: every device for one account, newest use
-- first.
create index if not exists account_devices_owner_idx
  on public.account_devices (owner_id, last_seen_at desc);

alter table public.account_devices enable row level security;

-- No policies, matching `push_devices`: the anon key never touches this table.
-- Writes come from POST /api/mobile/devices, which verifies the bearer token
-- and runs on the service-role client.
