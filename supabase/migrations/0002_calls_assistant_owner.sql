-- ─────────────────────────────────────────────────────────────────────────────
-- Calls: denormalize assistant + owner onto each call row.
--
-- Calls already link to a user only transitively
-- (calls.phone_number_id → phone_numbers.assistant_id → assistants.owner_id),
-- which makes "history for this assistant / this user" a 2-hop join and breaks
-- the moment a number is reassigned to another assistant. Storing assistant_id
-- and owner_id directly on the call:
--   • makes per-assistant / per-user history a single indexed lookup, and
--   • snapshots who owned the call when it happened (immune to later reassignment).
--
-- The columns are populated automatically by a BEFORE INSERT/UPDATE trigger that
-- resolves them from phone_number_id, so every insert path (call engine, test
-- calls) fills them without app changes. Both stay nullable + ON DELETE SET NULL
-- so deleting an assistant/user never deletes call history.
-- ─────────────────────────────────────────────────────────────────────────────

alter table calls
  add column if not exists assistant_id uuid references assistants(id) on delete set null,
  add column if not exists owner_id     uuid references auth.users(id) on delete set null;

create index if not exists calls_assistant_idx on calls (assistant_id, started_at desc);
create index if not exists calls_owner_idx     on calls (owner_id, started_at desc);

-- Resolve assistant_id (from the number) and owner_id (from the assistant, or the
-- business owner as a fallback) whenever they are left unset on insert/update.
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

-- Backfill existing rows.
update calls c
set assistant_id = pn.assistant_id
from phone_numbers pn
where c.phone_number_id = pn.id
  and c.assistant_id is null
  and pn.assistant_id is not null;

update calls c
set owner_id = a.owner_id
from assistants a
where c.assistant_id = a.id
  and c.owner_id is null
  and a.owner_id is not null;

update calls c
set owner_id = b.owner_id
from businesses b
where c.business_id = b.id
  and c.owner_id is null
  and b.owner_id is not null;
