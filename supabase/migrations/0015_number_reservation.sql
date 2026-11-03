-- ─────────────────────────────────────────────────────────────────────────────
-- Number reservations: one "get a number" run per assistant at a time, and
-- never more numbers than the plan allows.
--
-- Apply after 0014. Touches only the table and the two functions below.
--
-- lib/dashboard/number-assign.ts claims a pool number or buys one from
-- Twilio, then stores it. Before this, two parallel requests (a double tap,
-- an app retry, the web and the app at once) both passed the checks and both
-- bought a number. phone_numbers_one_active_per_assistant (0001) let one
-- insert win, and the other number stayed bought at Twilio. Parallel requests
-- for two assistants of one owner could also pass the plan limit.
--
-- reserve_number_slot takes a per-owner lock, so the checks and the
-- reservation are one step. The app deletes the row in a finally block
-- (release_number_slot). A row older than 10 minutes (a crashed run) is
-- deleted by the owner's next call. Server-only: RLS on, no policies.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.number_reservations (
  assistant_id uuid primary key references public.assistants(id) on delete cascade,
  owner_id     uuid not null,
  created_at   timestamptz not null default now()
);
create index if not exists number_reservations_owner_idx
  on public.number_reservations (owner_id);
alter table public.number_reservations enable row level security;  -- no policies: server-only

-- Returns 'exists' (the assistant has a number), 'busy' (another run holds
-- this assistant's slot), 'limit' (the owner's numbers plus open reservations
-- reach p_limit; null means no limit) or 'ok' (the slot is reserved).
create or replace function public.reserve_number_slot(p_owner uuid, p_assistant uuid, p_limit int)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used bigint;
begin
  perform pg_advisory_xact_lock(hashtext('number:' || p_owner::text));

  delete from public.number_reservations
   where owner_id = p_owner
     and created_at < now() - interval '10 minutes';

  if exists (
    select 1 from public.phone_numbers
     where assistant_id = p_assistant and deleted_at is null
  ) then
    return 'exists';
  end if;

  if exists (select 1 from public.number_reservations where assistant_id = p_assistant) then
    return 'busy';
  end if;

  -- The numbers are the rows getOwnedNumbers (lib/dashboard/db.ts) returns,
  -- which canAssignNumber counts. A reservation whose assistant already has a
  -- number row is counted there already.
  select (select count(*)
            from public.phone_numbers pn
            join public.assistants a on a.id = pn.assistant_id
           where a.owner_id = p_owner)
       + (select count(*)
            from public.number_reservations r
           where r.owner_id = p_owner
             and not exists (
               select 1 from public.phone_numbers pn
                where pn.assistant_id = r.assistant_id))
    into v_used;

  if p_limit is not null and v_used >= p_limit then
    return 'limit';
  end if;

  insert into public.number_reservations (assistant_id, owner_id)
  values (p_assistant, p_owner);
  return 'ok';
end;
$$;

create or replace function public.release_number_slot(p_assistant uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.number_reservations where assistant_id = p_assistant;
$$;

revoke all on function public.reserve_number_slot(uuid, uuid, int) from public, anon, authenticated;
revoke all on function public.release_number_slot(uuid) from public, anon, authenticated;

grant execute on function public.reserve_number_slot(uuid, uuid, int) to service_role;
grant execute on function public.release_number_slot(uuid) to service_role;
