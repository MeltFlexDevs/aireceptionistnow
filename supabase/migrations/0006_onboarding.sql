-- B2C onboarding funnel: one row per user collecting the /onboarding config
-- before payment; after Stripe checkout the provisioner reads it, creates the
-- org/assistant/number in the background, and tracks progress in status/result.

create table if not exists public.onboarding_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- draft -> provisioning -> done | error (error rows can be re-claimed)
  status text not null default 'draft',
  -- last funnel step the user completed (1 basics, 2 knowledge, 3 calendar)
  step int not null default 0,
  -- {companyName, assistantName, voiceId, country, alertsEmail, alertPhone,
  --  sources: KnowledgeSource[], knowledgeDone, calendarDone}
  config jsonb not null default '{}'::jsonb,
  -- provisioner scratchpad + outcome: {orgId, assistantId, numberId, e164, error}
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.onboarding_profiles enable row level security;

-- Same pattern as user_billing: the owner may read their own row (lets the
-- provisioning screen poll), all writes go through the service role.
drop policy if exists "onboarding_profiles_self_read" on public.onboarding_profiles;
create policy "onboarding_profiles_self_read"
  on public.onboarding_profiles for select
  to authenticated
  using (auth.uid() = user_id);
