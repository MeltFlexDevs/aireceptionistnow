-- ─────────────────────────────────────────────────────────────────────────────
-- Call issue reports — a user flags a problem with a specific call from the
-- call detail page. The context jsonb snapshots everything support needs to
-- triage without joining live tables (full transcript, latency, duration,
-- date), so the report stays intact even if the call or its turns are later
-- deleted.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists call_reports (
  id           uuid primary key default gen_random_uuid(),
  call_id      uuid references calls(id) on delete set null,
  reporter_id  uuid references auth.users(id) on delete set null,
  message      text not null,
  context      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists call_reports_created_idx on call_reports (created_at desc);
