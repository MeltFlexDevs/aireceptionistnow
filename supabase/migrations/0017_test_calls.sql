-- ─────────────────────────────────────────────────────────────────────────────
-- Test calls: a daily limit per owner and a shared limit for free accounts.
--
-- Apply after 0016. Touches only the table and the two functions below.
-- NOT RUN: no local stack for this project; apply with `supabase db push`.
--
-- The owner's "call me" test call (app route and dashboard action) runs on the
-- owner's own agent, so the demo-line caps never counted it. reserve_test_call
-- counts the rolling 24 hours and inserts the row in one step under a lock, so
-- parallel taps cannot pass the check together. The app calls
-- release_test_call when the placement fails (a failed call does not count).
--
-- assistant_id has no foreign key on purpose: deleting an assistant must not
-- reset the owner's count. Rows go with the account (owner_id cascade).
-- Server-only: RLS on, no policies.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.test_calls (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  assistant_id uuid not null,
  free         boolean not null,
  to_country   text not null,  -- 2-letter code only, never the number
  created_at   timestamptz not null default now()
);
create index if not exists test_calls_owner_created_idx
  on public.test_calls (owner_id, created_at);
create index if not exists test_calls_free_created_idx
  on public.test_calls (created_at) where free;
alter table public.test_calls enable row level security;  -- no policies: server-only
revoke all on table public.test_calls from anon, authenticated;

-- Returns the new row id (as text), 'owner_limit' (the owner has p_owner_cap
-- rows in the last 24 hours) or 'free_limit' (a free account, and all free
-- rows in the last 24 hours reach p_free_cap).
create or replace function public.reserve_test_call(
  p_owner uuid,
  p_assistant uuid,
  p_free boolean,
  p_country text,
  p_owner_cap int,
  p_free_cap int
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- Lock order is always shared first, then owner, so two runs cannot deadlock.
  if p_free then
    perform pg_advisory_xact_lock(hashtext('test_calls:free'));
  end if;
  perform pg_advisory_xact_lock(hashtext('test_calls:' || p_owner::text));

  -- Old rows no longer count; keep the table small.
  delete from public.test_calls
   where owner_id = p_owner
     and created_at < now() - interval '2 days';

  if (select count(*) from public.test_calls
       where owner_id = p_owner
         and created_at > now() - interval '24 hours') >= p_owner_cap then
    return 'owner_limit';
  end if;

  if p_free and (select count(*) from public.test_calls
                  where free
                    and created_at > now() - interval '24 hours') >= p_free_cap then
    return 'free_limit';
  end if;

  insert into public.test_calls (owner_id, assistant_id, free, to_country)
  values (p_owner, p_assistant, p_free, p_country)
  returning id into v_id;
  return v_id::text;
end;
$$;

create or replace function public.release_test_call(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.test_calls where id = p_id;
$$;

revoke all on function public.reserve_test_call(uuid, uuid, boolean, text, int, int) from public, anon, authenticated;
revoke all on function public.release_test_call(uuid) from public, anon, authenticated;

grant execute on function public.reserve_test_call(uuid, uuid, boolean, text, int, int) to service_role;
grant execute on function public.release_test_call(uuid) to service_role;
