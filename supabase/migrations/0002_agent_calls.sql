-- ─────────────────────────────────────────────────────────────────────────────
-- Tier-A (ElevenLabs managed agent) call linkage.
--
-- In tier A, ElevenLabs runs the voice + LLM and calls our webhooks ("server
-- tools") to take real actions. There is no Twilio media stream we own, so a
-- call is keyed by the ElevenLabs conversation id instead of twilio_call_sid.
-- The first tool call (or the post-call webhook) creates the row; later ones
-- reuse it. twilio_call_sid stays null for these calls.
-- ─────────────────────────────────────────────────────────────────────────────
alter table calls
  add column if not exists elevenlabs_conversation_id text;

-- One call row per ElevenLabs conversation. Partial so tier-B rows (null) don't
-- collide on the unique constraint.
create unique index if not exists calls_elevenlabs_conversation_idx
  on calls (elevenlabs_conversation_id)
  where elevenlabs_conversation_id is not null;
