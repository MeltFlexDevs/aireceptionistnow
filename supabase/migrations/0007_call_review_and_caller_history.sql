-- ─────────────────────────────────────────────────────────────────────────────
-- Accuracy review + returning-caller recognition.
--
-- needs_review / review_claims
--   The post-call summarizer now also audits what the assistant told the caller
--   against the business's knowledge base (see summarizeCall). Anything it
--   stated that the knowledge base does not support lands in review_claims, and
--   needs_review flags the call for a human read.
--
--   This is the only mechanism that makes a hallucination visible at all: the
--   caller is told something wrong, hangs up satisfied, and without this the
--   business never finds out. Each claim is also a gap in the knowledge base,
--   which is what the dashboard asks the operator to fill.
--
--   Nullable rather than defaulted, so "audited and clean" (false) stays
--   distinguishable from "predates the audit" (null) - a backfilled `false`
--   would claim every historical call was checked.
-- ─────────────────────────────────────────────────────────────────────────────
alter table calls
  add column if not exists needs_review  boolean,
  add column if not exists review_claims jsonb;

-- Drives the "needs review" filter on the calls list. Partial: only flagged
-- rows are ever looked up this way, and they are a small minority.
create index if not exists calls_needs_review_idx
  on calls (owner_id, started_at desc)
  where needs_review;

-- ─────────────────────────────────────────────────────────────────────────────
-- Returning-caller lookup: "have we spoken to this number on this line before?"
--
-- Runs on the call-start path, which blocks the greeting, so it must be a single
-- indexed read. Without this index it is a scan of every call ever taken on the
-- line.
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists calls_caller_history_idx
  on calls (phone_number_id, from_number, started_at desc)
  where from_number is not null;
