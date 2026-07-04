-- Tenant-scope integrations: stamp the user who connected each one so listing,
-- disconnect, and call-time calendar resolution can filter by owner
-- (lib/dashboard/db.ts listIntegrations / upsertCalendarIntegration /
-- deleteIntegration). An integration's config holds calendar OAuth tokens, so
-- without this every tenant shares — and can overwrite or disconnect — the same
-- provider row.
--
-- Nullable like assistants.owner_id: pre-existing single-tenant rows stay
-- unowned and are claimed (stamped) the next time their provider is
-- (re)connected by a signed-in user.
alter table public.integrations
  add column if not exists owner_id uuid references auth.users(id) on delete set null;
create index if not exists integrations_owner_idx on public.integrations (owner_id);
