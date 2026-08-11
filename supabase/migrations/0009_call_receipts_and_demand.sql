-- ─────────────────────────────────────────────────────────────────────────────
-- Call receipts — the artifact the CALLER gets.
--
-- Everything the product has built so far points at the business: the dashboard,
-- the summary email, the push. The person on the other end of the call gets
-- nothing, which is exactly where the failure mode lives — the assistant
-- mishears an address or invents a time, the caller hangs up satisfied, and
-- nobody finds out until the appointment is missed.
--
-- A receipt is one row per consequential call, addressed by an unguessable
-- token, that renders what the assistant understood and what it committed to,
-- with one button that says it got something wrong. That correction is the only
-- signal in the entire system that comes from the one person who actually knows.
--
-- The token, not the id, is the address. It is HMAC-derived (see
-- lib/call-engine/receipts.ts) so a leaked receipt link exposes exactly one
-- call, and expires_at closes even that.
-- ─────────────────────────────────────────────────────────────────────────────
-- The caller-facing recap, written in the CALLER's language by the same summary
-- pass that writes `summary`. Kept on `calls` rather than on `call_receipts`
-- because it is a property of the conversation, not of the delivery: a call can
-- be recapped and never texted (receipts off, no mobile number, SMS failed) and
-- the recap is still the right thing to show anyone who later opens that call.
alter table calls
  add column if not exists caller_recap text;

create table if not exists public.call_receipts (
  id           uuid primary key default gen_random_uuid(),
  call_id      uuid not null references public.calls (id) on delete cascade,
  -- The public address. Unique because the page is looked up by it on every
  -- view and a duplicate would make the lookup ambiguous.
  token        text not null unique,
  -- 'demo' receipts come from the public demo number and carry no tenant data;
  -- 'live' receipts belong to a paying account. Kept apart because the demo
  -- number is a public abuse target and its rows expire far sooner.
  kind         text not null default 'live',      -- live | demo
  -- Set when the SMS actually left Twilio. Null means the receipt exists but
  -- was never delivered — the distinction matters, because "caller never saw
  -- it" and "caller saw it and said nothing" are different facts.
  sent_at      timestamptz,
  viewed_at    timestamptz,
  -- The caller pressed "looks right". Deliberately NOT rolled up into a public
  -- accuracy percentage: the tap rate is a fraction of receipts and the people
  -- the assistant failed are the least likely to respond, so any published
  -- number would flatter itself. It is a per-call fact, nothing more.
  confirmed_at timestamptz,
  -- The caller's own correction, verbatim. Free text on purpose: a category
  -- picker would make them choose our words for our mistake.
  correction   text,
  corrected_at timestamptz,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);

-- One receipt per call. A second send would text the caller twice about the
-- same conversation, which is the fastest way to become the message a carrier
-- filters and a customer blocks.
create unique index if not exists call_receipts_call_idx
  on public.call_receipts (call_id);

-- The expiry sweep's only query shape.
create index if not exists call_receipts_expiry_idx
  on public.call_receipts (expires_at);

alter table public.call_receipts enable row level security;

-- No policies, matching `calls` / `push_devices`: the receipt page is public but
-- unauthenticated, so it cannot present a user JWT and RLS could not scope it
-- anyway. Every read goes through the service-role client behind a verified
-- token — see app/r/[token]/page.tsx and lib/call-engine/receipts.ts.

-- ─────────────────────────────────────────────────────────────────────────────
-- Demand signals — what callers asked for and did not get.
--
-- The other half of the same loop, and the cheapest feature in the product: the
-- post-call summarizer already makes one Gemini round trip with the full
-- transcript in front of it. Two more fields on that same schema cost nothing
-- and record the two things nobody else in a small business can see.
--
--   'unanswered' — the caller asked something the knowledge base did not cover.
--                  The owner types one line and it becomes a verified answer,
--                  so the same gap is never hit twice. This is the intake path
--                  the accuracy audit cannot provide: the audit catches what the
--                  assistant got WRONG, this catches what it never knew.
--
--   'not_offered' — the caller wanted a service, an hour, a location or a
--                   language the business does not have. Not a defect. It is
--                   the market research the phone line has been throwing away:
--                   a CRM records what was sold, analytics records who visited,
--                   and neither hears "do you do X?" followed by no.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.demand_signals (
  id          bigint generated always as identity primary key,
  call_id     uuid not null references public.calls (id) on delete cascade,
  owner_id    uuid references auth.users (id) on delete cascade,
  kind        text not null,                      -- unanswered | not_offered
  -- What the caller wanted, as the summarizer phrased it.
  topic       text not null,
  -- The caller's own words. Required by the summarizer's schema so a signal is
  -- always traceable to a real sentence in a real transcript — without it the
  -- model happily reports demand nobody expressed.
  quote       text not null,
  -- Only ever set on 'unanswered' rows: the owner's one-line answer, once it
  -- has been promoted into the assistant's verified answers.
  answer      text,
  answered_at timestamptz,
  dismissed_at timestamptz,
  created_at  timestamptz not null default now()
);

-- The weekly digest and the dashboard both read "open signals for this owner,
-- newest first". Partial: a signal that has been answered or dismissed is
-- history and is never listed again.
create index if not exists demand_signals_open_idx
  on public.demand_signals (owner_id, created_at desc)
  where answered_at is null and dismissed_at is null;

create index if not exists demand_signals_call_idx
  on public.demand_signals (call_id);

alter table public.demand_signals enable row level security;

-- No policies, same reasoning as `calls`: written by the post-call pipeline on
-- the service-role client, read by dashboard server code that has already
-- checked ownership.
