# Call engine

The realtime voice pipeline that answers calls, talks to callers, books
appointments, and records everything. Built around one rule: **latency is king**
— every stage streams so the caller hears a reply in well under a second.

## Pieces

> **How the providers split:** **ElevenLabs** owns all voice — Scribe transcribes
> the caller (speech → text) and TTS synthesizes the reply (text → speech).
> **Gemini** is the brain — it reads the transcribed words (caller understanding)
> and writes the spoken reply. The provider for each layer is switchable; see
> [VOICE-AI-ARCHITECTURE.md](VOICE-AI-ARCHITECTURE.md) for the full walkthrough.

| Concern | Where | What it does |
|---|---|---|
| **Pickup** | [app/api/twilio/voice/route.ts](../app/api/twilio/voice/route.ts), [lib/call-engine/pickup.ts](../lib/call-engine/pickup.ts) | Verifies the Twilio signature, resolves the dialed number's config, creates the call record, returns `<Connect><Stream>` TwiML pointing at the media server. The stream parameters are **HMAC-signed** so the media server can reject forged connections. |
| **Transport** | [server/](../server/) | Standalone WS server bridging Twilio Media Streams ↔ the session. Verifies the stream signature before attaching. |
| **Transcript + context** | [lib/call-engine/stt/](../lib/call-engine/stt/), [lib/call-engine/llm/prompt.ts](../lib/call-engine/llm/prompt.ts) | ElevenLabs Scribe (default) streams audio in, emits partial/final transcripts, utterance-end, and detected language. The system prompt is built from the number's persona + knowledge. |
| **AI response** | [lib/call-engine/llm/](../lib/call-engine/llm/) | Gemini (default) streams a reply token-by-token, calling tools (book/message/transfer/end). Claude is the switchable alternate; both speak one provider-neutral contract. |
| **Voice** | [lib/call-engine/tts/](../lib/call-engine/tts/) | ElevenLabs streams μ-law audio back, played straight into the call. |
| **History** | [lib/call-engine/persistence/](../lib/call-engine/persistence/), [supabase/migrations/](../supabase/migrations/) | Calls, turns, and actions persisted live to Supabase. |
| **Summary + integrations** | [lib/call-engine/summary/](../lib/call-engine/summary/), [lib/call-engine/integrations/](../lib/call-engine/integrations/) | Calendar booking dispatched live; an AI summary is generated after the call. |
| **Orchestration** | [lib/call-engine/session.ts](../lib/call-engine/session.ts) | Ties it all together with barge-in and latency tracking. |

## Call flow

```
Caller ─dials─► Twilio ─webhook─► /api/twilio/voice ──► <Connect><Stream wss://…/media + signed params>
                                                              │
                                                  Twilio Media Streams (μ-law 8k)
                                                              ▼
                                              server/mediaStream.ts (verify stream HMAC)
                                                              │  CallSession
        ┌─────────────────────────────────────────────────────┼─────────────────────────┐
        ▼                                                       ▼                          ▲
 ElevenLabs Scribe ──utterance──►  Gemini (stream + tools) ──text──►  ElevenLabs TTS ──μ-law─┘
        │  (caller understanding)        │  (response)                 (voice)             
   barge-in on +                   book_appointment → calendar adapter (google|calcom|webhook)
   language detected               take_message / transfer / end_call
        │                                │
   detected lang → TTS voice + prompt    │
   (reply in caller's language)   Supabase: calls, call_turns, call_actions
                                         │
                          on stop → finalize + AI summary → calls.summary
```

## Why streaming everywhere

- **STT partials** flag end-of-utterance fast and drive barge-in.
- **The LLM streams** so the first words reach TTS before the full reply exists.
- **ElevenLabs streams** μ-law (`output_format=ulaw_8000`) — Twilio's exact
  format, so audio passes through with **no resampling**.
- **Barge-in**: if the caller talks while the AI is speaking, the session aborts
  the LLM turn, stops TTS, and sends Twilio a `clear` to drop buffered audio.

## Swapping providers

Each layer is selected by env and overridable per number via the number's
`routing` JSON:

| Layer | Env | Per-number override | Default |
|---|---|---|---|
| STT | `STT_PROVIDER` | `routing.sttProvider` | `elevenlabs` |
| LLM | `LLM_PROVIDER` | `routing.llmProvider` | `gemini` |

`GEMINI_MODEL` defaults to `gemini-2.5-flash` (thinking disabled in code for
time-to-first-token). With `LLM_PROVIDER=claude`, `CLAUDE_MODEL` defaults to
`claude-opus-4-8` (`claude-haiku-4-5` for the lowest per-turn latency).

See [VOICE-AI-ARCHITECTURE.md](VOICE-AI-ARCHITECTURE.md) for the end-to-end
walkthrough, the security model, and the language flow.

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

- Auth/RLS policies for dashboard reads (server uses the service role today).
