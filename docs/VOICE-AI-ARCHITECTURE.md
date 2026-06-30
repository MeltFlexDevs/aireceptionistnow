# Voice AI architecture — how a call works

This is the deep walkthrough of the realtime voice pipeline: which vendor owns
which job, how a call flows from ring to spoken reply, how it stays secure, and
how it answers in the caller's own language using the business's knowledge.

For the file-by-file map see [CALL-ENGINE.md](CALL-ENGINE.md). This document
explains the *why* and the *flow*.

## The three engines, and who does what

The pipeline is split so each vendor does the one thing it is best at. The split
is deliberate and strict:

| Job | Engine | Where |
|---|---|---|
| **Telephony** — ring, audio transport, transfer, SMS | **Twilio** | [app/api/twilio/](../app/api/twilio/), [server/](../server/), [lib/call-engine/telephony.ts](../lib/call-engine/telephony.ts) |
| **Voice in** — caller speech → text (+ language detect) | **ElevenLabs** Scribe | [lib/call-engine/stt/elevenlabs.ts](../lib/call-engine/stt/elevenlabs.ts) |
| **Voice out** — reply text → speech | **ElevenLabs** TTS | [lib/call-engine/tts/elevenlabs.ts](../lib/call-engine/tts/elevenlabs.ts) |
| **Understanding + response** — read the words, decide, reply, call tools | **Gemini** | [lib/call-engine/llm/gemini.ts](../lib/call-engine/llm/gemini.ts) |

**All voice manipulation lives in ElevenLabs** — both transcription (Scribe) and
synthesis (TTS). Nothing else touches audio. **Gemini is the brain** — it never
sees audio, only the transcribed text; it understands what the caller wants and
writes what to say back. This keeps the audio path on one specialist vendor and
the reasoning on another.

Both the voice-in and brain layers are switchable without code changes:

| Layer | Env | Per-number override (`routing` JSON) | Default | Alternate |
|---|---|---|---|---|
| STT | `STT_PROVIDER` | `routing.sttProvider` | `elevenlabs` | `deepgram` |
| LLM | `LLM_PROVIDER` | `routing.llmProvider` | `gemini` | `claude` |

The brain talks to the rest of the system through one **provider-neutral
contract** ([lib/call-engine/llm/types.ts](../lib/call-engine/llm/types.ts)), so
Gemini and Claude are drop-in swappable — [selectLlm()](../lib/call-engine/llm/index.ts)
picks one and the session never knows which is running.

## End-to-end flow of one call

```
1. Caller dials the Twilio number.

2. Twilio POSTs /api/twilio/voice.
   ├─ Verify the X-Twilio-Signature HMAC      (pickup.ts: verifyTwilioSignature)
   ├─ resolveInboundNumber(to) → persona, voice, language, knowledge, routing
   ├─ createCall(...) → a call row in Supabase
   └─ Reply <Connect><Stream wss://…/media> with SIGNED parameters
                                              (pickup.ts: buildConnectResponse)

3. Twilio opens the media WebSocket to server/mediaStream.ts.
   ├─ Verify the stream HMAC                  (pickup.ts: verifyStreamSignature)
   │  — rejects any connection not minted by step 2
   ├─ Build CallSession (picks STT + LLM providers, TTS provider)
   └─ session.start() → speak the greeting (no LLM call — fixed line)

4. The live loop, per caller utterance:
   ├─ μ-law audio frames → session.pushCallerAudio → ElevenLabs Scribe
   ├─ First partial transcript → onSpeechStarted → barge-in if AI is talking
   ├─ Scribe reports the detected language → onLanguageDetected
   │     → switch the TTS voice for that language + pin the reply language
   ├─ Final transcript → onUtterance(text)
   │     ├─ persist the caller turn
   │     ├─ push { role:"user", text } onto history
   │     └─ runAssistantTurn():
   │          ├─ open a fresh ElevenLabs TTS socket
   │          ├─ Gemini streams the reply token-by-token
   │          │     each delta → tts.speak(delta)  (TTS starts before the
   │          │                                      full sentence exists)
   │          ├─ if Gemini calls a tool → runTool() → result fed back → loop
   │          └─ ElevenLabs returns μ-law → framed → Twilio → caller hears it
   └─ persist the assistant turn + record first-audio latency

5. Caller hangs up (Twilio "stop") → session.finalize():
   ├─ stop STT/TTS, write duration + median latency
   └─ runPostCall → AI summary (same brain) → calls.summary
```

The whole point is **streaming at every hop** so the caller hears the first words
in well under a second. ElevenLabs emits `output_format=ulaw_8000` — Twilio's
exact wire format — so audio passes through with **no resampling** on the hot
path. (Scribe is the one exception: it needs PCM16 16 kHz, so caller audio is
transcoded on the way in.)

### Tools the brain can call

Mid-conversation the model can call these (declared once, provider-neutral, in
[tools.ts](../lib/call-engine/llm/tools.ts); executed in
[session.ts](../lib/call-engine/session.ts) `runTool`):

- `check_availability` → read free/busy across the assistant's readable calendars
  (offered only when it has read/write calendar access — see below)
- `book_appointment` → calendar adapter (Google / Cal.com / Outlook / webhook)
- `take_message` → stored + optional SMS alert to the owner
- `transfer_call` → live Twilio `<Dial>` redirect to a human
- `end_call` → wrap up and hang up

### Calendar access: read vs write (per assistant)

Each assistant is granted access **per connected calendar**, set on its settings
page and stored in `routing.calendar.access[{integrationId, level}]`:

- **Read** — availability only. The assistant can call `check_availability` to
  see if a time is free, but it **never reveals what is on the calendar** (who,
  what, or why). When a time is taken it says only that it's unavailable and
  offers the nearest free times: *"That time isn't available — I could do 2pm or
  4pm."* Read works across **all** the calendars granted read, so conflicts from
  every calendar are respected.
- **Write** — everything read does, plus `book_appointment` to create events on
  that calendar.
- **None** — the calendar is ignored.

The privacy guarantee is enforced in two places: the availability layer
([integrations/availability.ts](../lib/call-engine/integrations/availability.ts))
returns **only free times**, never busy details — and the system prompt
([llm/prompt.ts](../lib/call-engine/llm/prompt.ts) `calendarSection`) instructs
the model to never say what's scheduled or why. Free/busy is read via each
adapter's optional `getBusy` (Google free/busy + the generic webhook today;
adapters without it degrade to taking a message rather than guessing).

## Security model

A voice call has **two** inbound network entry points, and both are
authenticated:

1. **The Twilio webhook** (`/api/twilio/voice`, `/api/twilio/status`) is verified
   with `twilio.validateRequest` over the full URL + POST body, using
   `TWILIO_AUTH_TOKEN`. An unsigned or tampered request gets `403`.
   ([pickup.ts](../lib/call-engine/pickup.ts) `verifyTwilioSignature`)

2. **The media WebSocket** (`wss://…/media`) is a *separate, public* connection.
   Twilio carries only the parameters we put in the TwiML — so we **HMAC-sign**
   those parameters when minting the TwiML and **verify** them when the stream
   attaches:
   - `buildConnectResponse` adds `ts` + `sig = HMAC_SHA256(secret, "callId.to.ts")`.
   - `verifyStreamSignature` checks the HMAC with `timingSafeEqual` and rejects
     stale/replayed timestamps (5-minute TTL).
   - The secret is `MEDIA_STREAM_SECRET`, falling back to `TWILIO_AUTH_TOKEN`.

   Without this, anyone who learned the media URL could open a stream against a
   `callId` and burn STT/LLM/TTS budget — or attach to a real call. Now an
   unsigned stream is dropped before any provider is touched.
   ([mediaStream.ts](../server/mediaStream.ts) start handler)

Other controls already in place:

- **Secrets** are all server-side env (no `NEXT_PUBLIC_`), validated at startup
  by a Zod schema that fails fast with a clear message
  ([env.ts](../lib/call-engine/env.ts)). Provider keys are required only for the
  engines you actually run.
- **Knowledge ingestion** blocks SSRF — website fetches reject loopback,
  private, and link-local hosts ([lib/knowledge/website.ts](../lib/knowledge/website.ts)).
- **Calendar privacy tiers** — a `busy`-only calendar can be used for conflict
  checks but the model is instructed never to reveal who/what is scheduled
  ([prompt.ts](../lib/call-engine/llm/prompt.ts) `calendarSection`).

## Answering in the caller's language

The assistant replies in whatever language the caller speaks, end to end:

1. **Mode** — a number set to `auto` / `multi` / empty language is in
   auto-detect mode (`isAutoLanguage`); a fixed-language number pins everything.
2. **Detect** — Scribe (or Deepgram) reports the spoken language on each
   utterance → `onLanguageDetected` ([session.ts](../lib/call-engine/session.ts)).
3. **Voice** — the detected base language (`es-419` → `es`) selects the best TTS
   voice via [voice/catalog.ts](../lib/call-engine/voice/catalog.ts). With no
   per-language override, the configured voice is kept — the multilingual TTS
   model still pronounces the language correctly via the `language_code` hint
   sent in the TTS init message.
4. **Words** — Gemini already replies in the caller's language because it reads
   their transcribed words, and the system prompt instructs it to match them.
   On top of that, once a language is detected the session appends a per-turn
   instruction pinning the ISO code (`systemForTurn`), so the spoken reply lands
   in the right language reliably even on short or ambiguous turns.

If the caller switches languages mid-call, detection fires again and the voice +
reply language follow.

## Knowledge: how the AI knows the business

Each assistant has a `knowledge` record — free-text notes plus ingested sources
(websites and PDFs already processed to Markdown):

1. **Ingest** — PDFs ([pdf.ts](../lib/knowledge/pdf.ts)) and websites
   ([website.ts](../lib/knowledge/website.ts)) are converted to Markdown, capped
   at `MAX_SOURCE_CHARS` per source and `MAX_SOURCES` total.
2. **Merge at pickup** — an organization's shared knowledge, the assistant's own,
   and the owner's notes are merged (`mergeKnowledge`), de-duplicated by id.
3. **Render into the prompt** — `renderKnowledgeMarkdown` turns it into a clean
   Markdown block the model reads far better than raw JSON.
4. **Read on every turn** — it lives in the system prompt, so the brain answers
   from it directly; the prompt instructs the model to **never invent details**
   and to take a message or offer a callback when the answer isn't in scope.

So "knowledge reading + reply in the recognized language" is the combination of
steps 3–4 here with the language flow above: the model reads the business
knowledge and answers from it, in the caller's language.

## What you need to run it

Minimal default stack (ElevenLabs voice + Gemini brain) needs only:

- **Twilio** — `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- **ElevenLabs** — `ELEVENLABS_API_KEY`
- **Gemini** — `GEMINI_API_KEY`
- **Supabase** — `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **Deployment** — `APP_BASE_URL`, `MEDIA_WS_URL`
- **Recommended** — `MEDIA_STREAM_SECRET` (else it reuses the Twilio auth token)

Switch to Deepgram STT (`STT_PROVIDER=deepgram` + `DEEPGRAM_API_KEY`) or the
Claude brain (`LLM_PROVIDER=claude` + `ANTHROPIC_API_KEY`) per deploy or per
number. See [.env.example](../.env.example) for the full list.
