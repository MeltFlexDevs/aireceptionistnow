-- ─────────────────────────────────────────────────────────────────────────────
-- Expo push tickets that wait for their receipts.
--
-- Apply after 0017. Adds one table and touches nothing else.
-- NOT RUN: no local stack for this project; apply with `supabase db push`.
--
-- A push send returns one ticket per message, but Expo reports most dead
-- tokens only in the receipt for that ticket (DeviceNotRegistered).
-- sendPushToOwner (lib/mobile/push.ts) stores each ok ticket here. The
-- push-receipts cron (app/api/cron/push-receipts, every 15 minutes) asks Expo
-- for the receipts, deletes the dead push_devices rows and then the checked
-- tickets. Expo clears receipts after 24 hours, so the cron also deletes
-- tickets older than a day (lib/mobile/push-receipts.ts).
--
-- Idempotent: every statement is `if not exists`, an `alter` or a `revoke`,
-- so the file can be re-run safely.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── push_tickets ────────────────────────────────────────────────────────────
create table if not exists public.push_tickets (
  -- Expo's ticket id, which is also the receipt id.
  ticket_id      text primary key,
  -- The device the message went to. Deleting the device (sign-out, Remove,
  -- account deletion, a dead token) deletes its tickets too.
  push_device_id uuid not null references public.push_devices (id) on delete cascade,
  created_at     timestamptz not null default now()
);

-- The cron reads the oldest tickets first and deletes the ones older than a day.
create index if not exists push_tickets_created_at_idx
  on public.push_tickets (created_at);
-- Deleting a push_devices row has to find its tickets for the cascade.
create index if not exists push_tickets_push_device_id_idx
  on public.push_tickets (push_device_id);

alter table public.push_tickets enable row level security;
-- No policies, like push_devices: service role only.
revoke all on table public.push_tickets from anon, authenticated;
