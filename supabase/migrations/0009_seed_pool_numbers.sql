-- Seed the shared number pool with Twilio numbers the account already owns.
-- Free to use: assistant_id stays NULL (claimFreeNumber's definition of free)
-- and enabled = true. elevenlabs_phone_number_id is left NULL on purpose —
-- POST /api/agent/setup imports each number into ElevenLabs and backfills it.
-- Idempotent: an existing row (any state) is refreshed to a usable pool entry
-- without touching its assistant link.

insert into public.phone_numbers (e164, twilio_sid) values
  ('+19567383556',  'PN65f20f9b2afd75e9eb04eb5596a19206'),
  ('+18146867438',  'PNc466c0d5d3769596305d80d5cb981995'),
  ('+420910928330', 'PNa313efc0d7ae243a160dd70417ab9eca'),
  ('+420910927949', 'PNf957d3abb1e60299189ad1004b950fa4'),
  ('+13187103903',  'PNcf5784ef7128e19a55fbc36d6dbf54aa'),
  ('+16592667639',  'PN23bc06bd31b0ee63e572644dbc115283'),
  ('+17753209907',  'PN0a12ba49ca1db276c281b4e14cc936b0')
on conflict (e164) do update set
  twilio_sid = excluded.twilio_sid,
  enabled    = true,
  deleted_at = null;
