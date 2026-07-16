-- public.businesses was removed (dead single-tenant root; the drop happened
-- manually in the dashboard). Repair what still referenced it so inserts work
-- again: the owner-backfill trigger and the NOT NULL business_id columns.

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

  return new;
end;
$$;

alter table assistants   alter column business_id drop not null;
alter table integrations alter column business_id drop not null;
alter table calls        alter column business_id drop not null;

-- Dead scoping indexes for the dropped tenant root.
drop index if exists assistants_business_idx;
drop index if exists assistants_active_idx;
drop index if exists integrations_business_idx;
drop index if exists calls_business_idx;
create index if not exists assistants_active_idx on assistants (id) where deleted_at is null;
create index if not exists calls_started_idx on calls (started_at desc);
