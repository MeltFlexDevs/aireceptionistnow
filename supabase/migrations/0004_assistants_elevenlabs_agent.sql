-- Per-assistant ElevenLabs agent.
--
-- Each dashboard assistant now owns a managed ElevenLabs Conversational AI agent,
-- built from its DB settings (greeting, system prompt, voice, language, knowledge).
-- We store the agent id so create/update/delete on the assistant can sync the
-- matching agent, and the number-connect flow can assign that exact agent as the
-- inbound agent on its phone number.
--
--   elevenlabs_agent_id  — the managed agent's id (null until first sync)
--   elevenlabs_kb        — knowledge-base docs we uploaded for this agent
--                          ([{ id, name }]); tracked so a re-sync can delete the
--                          previous set before uploading the new one.
alter table public.assistants
  add column if not exists elevenlabs_agent_id text,
  add column if not exists elevenlabs_kb jsonb not null default '[]'::jsonb;
