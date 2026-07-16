-- Cross-instance cache of calendar busy windows. Prefetched at call start
-- (/api/agent/init) so mid-call availability checks and the booking re-check
-- answer from one indexed read instead of live provider round trips.
create table if not exists availability_snapshots (
  integration_id uuid primary key references integrations(id) on delete cascade,
  time_min timestamptz not null,
  time_max timestamptz not null,
  busy jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now()
);

-- Service-role only; no policies on purpose.
alter table availability_snapshots enable row level security;
