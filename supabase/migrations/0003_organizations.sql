-- ─────────────────────────────────────────────────────────────────────────────
-- Organizations — a user-facing corporation/workspace grouping. An organization
-- carries its own shared knowledge (websites, PDFs, notes); multiple assistants
-- are assigned to it and read that knowledge on every call (merged with their
-- own). This sits on top of the existing single-tenant `businesses` root used by
-- the call engine — it does not replace it, so number/business resolution is
-- unchanged.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists organizations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete set null,
  name        text not null default 'My organization',
  description text not null default '',
  knowledge   jsonb not null default '{}'::jsonb,   -- shared {notes, sources[]}
  deleted_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists organizations_owner_idx  on organizations (owner_id);
create index if not exists organizations_active_idx on organizations (owner_id) where deleted_at is null;

-- Link assistants to an organization. Nullable: an assistant can be unassigned.
-- ON DELETE SET NULL so deleting an organization never deletes its assistants.
alter table assistants
  add column if not exists organization_id uuid references organizations(id) on delete set null;
create index if not exists assistants_organization_idx on assistants (organization_id);

-- Enable RLS; the server uses the service role (bypasses RLS), matching every
-- other table. Dashboard policies are added as auth is wired up.
alter table organizations enable row level security;
