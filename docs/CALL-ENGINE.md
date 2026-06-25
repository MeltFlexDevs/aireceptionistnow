# Call engine

The realtime voice pipeline that answers calls, talks to callers, books
appointments, and records everything. Built around one rule: **latency is king**
— every stage streams so the caller hears a reply in well under a second.

## Pieces

| Concern | Where | What it does |
|---|---|---|
| **Pickup** | [app/api/twilio/voice/route.ts](../app/api/twilio/voice/route.ts), [lib/call-engine/pickup.ts](../lib/call-engine/pickup.ts) | Verifies the Twilio signature, resolves the dialed number's config, creates the call record, returns `<Connect><Stream>` TwiML pointing at the media server. |
| **Transport** | [server/](../server/) | Standalone WS server bridging Twilio Media Streams ↔ the session. |
| **Transcript + context** | [lib/call-engine/stt/](../lib/call-engine/stt/), [lib/call-engine/llm/prompt.ts](../lib/call-engine/llm/prompt.ts) | Deepgram streams μ-law in, emits partial/final transcripts and utterance-end. The system prompt is built from the number's persona + knowledge. |
| **AI response** | [lib/call-engine/llm/claude.ts](../lib/call-engine/llm/claude.ts) | Claude streams a reply token-by-token, calling tools (book/message/transfer/end). |
| **Voice** | [lib/call-engine/tts/](../lib/call-engine/tts/) | ElevenLabs streams μ-law audio back, played straight into the call. |
| **History** | [lib/call-engine/persistence/](../lib/call-engine/persistence/), [supabase/migrations/](../supabase/migrations/) | Calls, turns, and actions persisted live to Supabase. |
| **Summary + integrations** | [lib/call-engine/summary/](../lib/call-engine/summary/), [lib/call-engine/integrations/](../lib/call-engine/integrations/) | Calendar booking dispatched live; an AI summary is generated after the call. |
| **Orchestration** | [lib/call-engine/session.ts](../lib/call-engine/session.ts) | Ties it all together with barge-in and latency tracking. |

## Call flow

```
Caller ─dials─► Twilio ─webhook─► /api/twilio/voice ──► <Connect><Stream wss://…/media>
                                                              │
                                                  Twilio Media Streams (μ-law 8k)
                                                              ▼
                                                     server/mediaStream.ts
                                                              │  CallSession
        ┌─────────────────────────────────────────────────────┼─────────────────────────┐
        ▼                                                       ▼                          ▲
  Deepgram STT  ──utterance──►  Claude (stream + tools)  ──text──►  ElevenLabs TTS ──μ-law─┘
        │                              │                                                   
   barge-in on                   book_appointment → calendar adapter (google|calcom|webhook)
   speech start                  take_message / transfer / end_call
                                       │
                              Supabase: calls, call_turns, call_actions
                                       │
                          on stop → finalize + AI summary → calls.summary
```

## Why streaming everywhere

- **STT partials** let Deepgram flag end-of-utterance fast and drive barge-in.
- **Claude streams** so the first words reach TTS before the full reply exists.
- **ElevenLabs streams** μ-law (`output_format=ulaw_8000`) — Twilio's exact
  format, so audio passes through with **no resampling**.
- **Barge-in**: if the caller talks while the AI is speaking, the session aborts
  the Claude turn, stops TTS, and sends Twilio a `clear` to drop buffered audio.

`CLAUDE_MODEL` defaults to `claude-opus-4-8`; set `claude-haiku-4-5` for the
lowest per-turn latency and cost.

## Setup

1. **Database** — apply [supabase/migrations/0001_init.sql](../supabase/migrations/0001_init.sql)
   (`supabase db push` or the SQL editor). Seed a `businesses` row, a
   `phone_numbers` row (label, e164, greeting, voice_id, knowledge), and
   optionally an `integrations` row (`type='calendar'`, `provider='google'|'calcom'|'webhook'`).
2. **Env** — copy [.env.example](../.env.example) and fill in keys.
3. **Run** — `npm run dev` (webhooks) + `npm run server:dev` (media), expose both
   over HTTPS/WSS, and point the Twilio number's Voice webhook at
   `${APP_BASE_URL}/api/twilio/voice` (and optionally the status callback at
   `/api/twilio/status`).

## Connecting a calendar

Bring your own — add an `integrations` row with `type='calendar'`:

- `provider='google'`: `config` = `{ access_token, refresh_token, client_id, client_secret, calendar_id }`
- `provider='calcom'`: `config` = `{ api_key, event_type_id, time_zone }`
- `provider='webhook'` (anything else — Zapier/Make/custom): `config` = `{ url, secret }`

Unknown providers fall back to the webhook adapter, so any system reachable by
URL works. With no calendar connected, bookings are saved as pending requests.

## Not yet wired

- **Live human transfer** records the action and ends the AI leg; a real warm
  transfer needs a Twilio REST `<Dial>` redirect (marked TODO in the session).
- Auth/RLS policies for dashboard reads (server uses the service role today).
