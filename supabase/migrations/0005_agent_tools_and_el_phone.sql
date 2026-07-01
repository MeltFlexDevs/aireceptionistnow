-- Managed ElevenLabs tools per assistant + the imported ElevenLabs phone-number id.
--
-- 1) assistants.elevenlabs_tools — the standalone ElevenLabs "tool" objects we
--    create on behalf of an assistant (the webhook server-tools: check
--    availability, book appointment, take message). ElevenLabs deprecated inline
--    prompt.tools in favour of tool_ids referencing standalone tool objects, so we
--    create those objects on sync and reference them by id. We track [{id, name}]
--    here the same way elevenlabs_kb tracks uploaded knowledge docs, so a re-sync
--    can delete the previous set before creating the new one, and deleting the
--    assistant can tear the tools down too.
--
-- 2) phone_numbers.elevenlabs_phone_number_id — the id ElevenLabs assigns when a
--    Twilio number is imported into the account. Storing it lets the connect /
--    reassign path address the number directly instead of re-scanning the whole
--    phone-number list on every change, and gives us the handle needed to
--    unassign or place outbound calls from that specific number later.
alter table public.assistants
  add column if not exists elevenlabs_tools jsonb not null default '[]'::jsonb;

alter table public.phone_numbers
  add column if not exists elevenlabs_phone_number_id text;
