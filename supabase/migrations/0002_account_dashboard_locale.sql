-- Owner's chosen dashboard UI language, so the post-call engine can write AI
-- call summaries in the language the owner actually reads the dashboard in
-- (instead of the caller's spoken language). Written by setLocaleAction on every
-- language switch; read in resolveInboundNumber and handed to summarizeCall.
alter table account_settings
  add column if not exists dashboard_locale text not null default '';
