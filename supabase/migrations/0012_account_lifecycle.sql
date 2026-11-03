-- ─────────────────────────────────────────────────────────────────────────────
-- Account lifecycle for the native app: in-app account deletion, Sign in with
-- Apple token revocation, App Review sign-in and "revoke a device stops push".
--
-- Idempotent and independent of 0011 (store billing): every statement is
-- `if not exists` or re-derives its target from the catalog, so it can be run
-- before or after 0011 and re-run safely.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── push_devices.device_id ──────────────────────────────────────────────────
-- The app's keychain install id (the same value account_devices keys on). Until
-- now a push row was addressable only by its Expo token, so revoking a device
-- from the dashboard dropped its account_devices row and the handset kept
-- receiving call alerts. Nullable: an older app build does not send the header.
alter table public.push_devices add column if not exists device_id text;

create index if not exists push_devices_owner_device_idx
  on public.push_devices (owner_id, device_id);

-- ── apple_signin_tokens ─────────────────────────────────────────────────────
-- The Sign in with Apple refresh token captured by POST /api/mobile/auth/apple-token
-- after the native flow. Apple requires an app that offers account deletion to
-- also revoke the user's Sign in with Apple token (5.1.1(v)); that revoke call
-- needs a refresh token, which only the authorization-code exchange yields.
-- One row per user; cascades away with the auth user.
create table if not exists public.apple_signin_tokens (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  -- The client_id (bundle id / services id) the token was issued to. Apple
  -- rejects a revoke made with a different client, so it is stored beside it.
  client_id     text not null,
  updated_at    timestamptz not null default now()
);

alter table public.apple_signin_tokens enable row level security;
-- No policies: written and read with the service-role key only.

-- ── review_login_attempts ───────────────────────────────────────────────────
-- Durable rate limit for POST /api/mobile/auth/review (App Review / Play review
-- sign-in without an inbox). One row per attempt against the review email; the
-- route counts the last hour and refuses at 20. Kept in the database rather than
-- in memory because the route runs on serverless instances that share nothing.
-- No email, code or token is ever stored here.
create table if not exists public.review_login_attempts (
  id           bigserial primary key,
  attempted_at timestamptz not null default now(),
  ok           boolean not null default false
);

create index if not exists review_login_attempts_time_idx
  on public.review_login_attempts (attempted_at desc);

alter table public.review_login_attempts enable row level security;
-- No policies: service role only.

-- ── owner_id foreign keys: SET NULL -> CASCADE ──────────────────────────────
-- Account deletion (lib/dashboard/account-deletion.ts) deletes these rows
-- explicitly, in order, before the auth user goes. CASCADE is the backstop so a
-- user deleted from the Supabase dashboard never leaves null-owner rows behind:
-- several reads treat `owner_id is null` as visible to everyone, which would
-- hand the deleted tenant's calls and calendar OAuth tokens to other tenants.
--
-- What the cascade reaches (checked against 0001, 0003, 0009 before choosing):
--   organizations -> assistants.organization_id      ON DELETE SET NULL
--   assistants    -> phone_numbers.assistant_id      ON DELETE SET NULL  (pool number is unassigned, never deleted)
--                 -> calls.assistant_id              ON DELETE SET NULL
--   integrations  -> call_actions.integration_id     ON DELETE SET NULL
--                 -> availability_snapshots           ON DELETE CASCADE   (per-integration cache)
--   calls         -> call_turns, call_actions,
--                    call_receipts, demand_signals    ON DELETE CASCADE   (the call's own rows)
--                 -> call_reports.call_id            ON DELETE SET NULL  (support triage snapshot, kept)
-- Nothing shared is reachable: phone_numbers only ever loses its assistant link.
do $$
declare
  rec record;
begin
  for rec in
    select con.conname, cls.relname
    from pg_constraint con
    join pg_class cls on cls.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = cls.relnamespace
    join pg_class ref on ref.oid = con.confrelid
    join pg_namespace refnsp on refnsp.oid = ref.relnamespace
    join pg_attribute att
      on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
    where con.contype = 'f'
      and nsp.nspname = 'public'
      and cls.relname in ('organizations', 'assistants', 'integrations', 'calls')
      and refnsp.nspname = 'auth'
      and ref.relname = 'users'
      and array_length(con.conkey, 1) = 1
      and att.attname = 'owner_id'
      and con.confdeltype <> 'c'
  loop
    execute format('alter table public.%I drop constraint %I', rec.relname, rec.conname);
    execute format(
      'alter table public.%I add constraint %I foreign key (owner_id) references auth.users (id) on delete cascade',
      rec.relname, rec.conname
    );
  end loop;
end $$;
