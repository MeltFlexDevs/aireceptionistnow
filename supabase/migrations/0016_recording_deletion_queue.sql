-- ─────────────────────────────────────────────────────────────────────────────
-- Recording deletion queue for account deletion, plus three database lint
-- fixes (unindexed foreign keys, a per-row auth.uid() call, a function without
-- a fixed search_path).
--
-- Idempotent: every statement is `if not exists` or an `alter`, so the file can
-- be re-run safely.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── pending_recording_deletions ─────────────────────────────────────────────
-- Account deletion (lib/dashboard/account-deletion.ts, step e) deletes each
-- call's ElevenLabs conversation (audio and transcript) before it deletes the
-- call rows. A delete that fails there is queued here first, because the call
-- row and its conversation id go next. The cancellation-sweep cron retries the
-- queue and gives up after 10 attempts. No owner id: the account is gone by
-- the time a row is retried.
create table if not exists public.pending_recording_deletions (
  conversation_id text primary key,
  created_at      timestamptz not null default now(),
  attempts        int not null default 0,
  -- A failed retry moves this forward, so a long ElevenLabs outage does not
  -- use up all attempts in a few cron runs.
  next_attempt_at timestamptz not null default now(),
  last_error      text
);

alter table public.pending_recording_deletions enable row level security;
-- No policies: service role only.
revoke all on table public.pending_recording_deletions from anon, authenticated;

-- ── Foreign keys without an index ───────────────────────────────────────────
-- Deleting a call or an integration has to find these rows for the ON DELETE
-- SET NULL, and account deletion deletes call_reports by reporter_id.
create index if not exists call_reports_call_id_idx
  on public.call_reports (call_id);
create index if not exists call_reports_reporter_id_idx
  on public.call_reports (reporter_id);
create index if not exists call_actions_integration_id_idx
  on public.call_actions (integration_id);

-- ── onboarding_profiles_self_read ───────────────────────────────────────────
-- The same check as 0006, with auth.uid() wrapped in a select so Postgres runs
-- it once per query instead of once per row.
alter policy "onboarding_profiles_self_read" on public.onboarding_profiles
  using ((select auth.uid()) = user_id);

-- ── set_call_assignment ─────────────────────────────────────────────────────
-- The calls trigger function (0004) had no fixed search_path. Its body uses
-- unqualified public tables, so the path is public.
alter function public.set_call_assignment() set search_path = public;
