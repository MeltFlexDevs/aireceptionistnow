-- 0006: multilingual-agent flag + one-active-number-per-assistant guard.

-- Track whether an assistant's ElevenLabs agent was built multilingual (i.e. the
-- language presets were accepted). /api/agent/init only applies a per-caller
-- language/voice override when this is true, so an English-only fallback agent
-- isn't handed an override it can't honor. Defaults true: every agent synced
-- before this migration was built multilingual.
alter table assistants
  add column if not exists elevenlabs_multilingual boolean not null default true;

-- Enforce at most one active number per assistant. The app-level "already has a
-- number?" check in getAgentNumberAction is a plain SELECT, so two concurrent
-- "Get number" submits could both pass it and both buy a Twilio number. This
-- partial unique index makes the loser's write fail instead, killing the race.
-- (If existing data already has an assistant with two active numbers, dedupe
-- before applying — the index create will otherwise error.)
create unique index if not exists phone_numbers_one_active_per_assistant
  on phone_numbers (assistant_id)
  where assistant_id is not null and deleted_at is null;
