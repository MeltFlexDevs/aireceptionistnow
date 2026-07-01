# Architecture — ElevenLabs-only

The entire call runtime — **voice + LLM brain + media + turn-taking** — runs inside ElevenLabs Conversational AI. There is **no media server**, no self-hosted realtime pipeline, nothing to run on Railway/Fly. This backend (the Next app) only:

1. **Serves the agent's tool webhooks** (`/api/agent/*`) — availability, booking, messages.
2. **Receives the agent's transcript** after each call (post-call webhook) and stores it.
3. **Enriches** with Gemini — post-call summary + caller-language greeting localization.
4. **Configures numbers** — assigns the ElevenLabs inbound agent to a number (dashboard "Connect number").

The only backend LLM is **Gemini** (summary + greeting). It is not on the call path.

```
Caller ──dials──▶ ElevenLabs number ──▶ ElevenLabs agent (STT+LLM+TTS)
                                          │  calls server tools mid-call
                                          ▼
                              Next app  /api/agent/check-availability
                                        /api/agent/book-appointment
                                        /api/agent/take-message
                                          │  (shared core: lib/call-engine/actions.ts)
                                          ▼
                              Supabase + calendar/CRM integrations
   call ends ──▶ /api/agent/post-call ──▶ transcript + Gemini summary ──▶ dashboard
   call starts ─▶ /api/agent/init ──────▶ caller-language greeting override
```

---

## Setup

### 1. Env

Required: `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_BASE_URL`.
For the webhooks: `AGENT_WEBHOOK_SECRET` (tool auth), `ELEVENLABS_WEBHOOK_SECRET` (init/post-call signature).
Optional: `TWILIO_*` (only for SMS message-alerts). See `.env.example`.

Both webhook secrets fail closed — unset ⇒ the corresponding `/api/agent/*` routes reject everything.

### 1b. Wire the workspace webhooks (once)

Run once after deploy — it points the workspace's **conversation-initiation** webhook at `/api/agent/init` (per-caller greeting/language/voice) via the ElevenLabs API:

```bash
curl -X POST "$APP_BASE_URL/api/agent/setup" -H "x-agent-secret: $AGENT_WEBHOOK_SECRET"
```

Then copy the workspace webhook **signing secret** (ElevenLabs dashboard → Conversational AI → Settings → Webhooks) into `ELEVENLABS_WEBHOOK_SECRET` so our routes accept the signed calls. For post-call transcripts, create a post-call webhook object in the dashboard and set its id as `ELEVENLABS_POST_CALL_WEBHOOK_ID` before running setup (optional).

### 2. Managed agents (automatic)

Each dashboard **assistant** owns a managed ElevenLabs agent, built from its DB settings — greeting → `first_message`, system prompt + business → prompt, `voice_id`, `language`, and its knowledge (notes + ingested sources uploaded as knowledge-base docs). Creating, editing, or deleting an assistant syncs (or tears down) its agent automatically; the assistant's `elevenlabs_agent_id` is stored on the row. Per-conversation **overrides** (first_message/language/voice/prompt) are enabled on every agent, so `/api/agent/init` can greet each caller in their own language.

Legacy `ELEVENLABS_AGENT_ID` is now only used for the outbound "Talk to our AI" demo button.

### 2b. Connect the number

- In our dashboard, open the assistant → **Get number** (buys + imports + assigns in one click) or connect an existing number to the assistant. This assigns **that assistant's** managed agent as the number's inbound agent and records it. Inbound calls now answer via ElevenLabs with the assistant's config.

### 3. Server tools

Add one **server tool (webhook)** per action on the agent. Method `POST`, the URL below, and a secret header `x-agent-secret: <AGENT_WEBHOOK_SECRET>` (or `Authorization: Bearer <AGENT_WEBHOOK_SECRET>`).

| Tool name | URL | Params (besides the shared 3) |
|---|---|---|
| `check_availability` | `${APP_BASE_URL}/api/agent/check-availability` | `start_time`, `end_time` (ISO 8601) |
| `book_appointment` | `${APP_BASE_URL}/api/agent/book-appointment` | `title`, `start_time`, `end_time`, `attendee_name?`, `attendee_phone?`, `notes?` |
| `take_message` | `${APP_BASE_URL}/api/agent/take-message` | `caller_name?`, `callback_number?`, `message`, `urgency?` |

**Shared 3 fields every tool must send** — wire to ElevenLabs system dynamic variables:

```
to_number       = {{system__called_number}}     # resolves which business/assistant config
from_number     = {{system__caller_id}}
conversation_id = {{system__conversation_id}}    # links tool calls + transcript to one call row
```

Transfers: use ElevenLabs' native transfer-to-number tool — no webhook needed.

### 4. Post-call webhook

Set the agent's **post-call transcription** webhook to `${APP_BASE_URL}/api/agent/post-call`. It stores the transcript, finalizes the call, and runs the Gemini summary + email/CRM delivery. Copy its signing secret into `ELEVENLABS_WEBHOOK_SECRET`.

### 5. Caller-language greeting (conversation-init webhook)

Set the **conversation-initiation client-data** webhook to `${APP_BASE_URL}/api/agent/init`. It guesses the caller's language from their number's country code, localizes the greeting into it (Gemini), and returns `first_message` + `language` + `voice_id` overrides — the caller is greeted in their language before saying a word.

Overrides for `first_message` / `language` / voice / prompt are enabled automatically on every managed agent by the sync (see §2), and the webhook URL is set by `/api/agent/setup` (see §1b) — no manual *Security*-tab toggling. Uses the same `ELEVENLABS_WEBHOOK_SECRET`.

---

## Caller-language behavior

Guess from phone country code → greet in that language → the ElevenLabs agent keeps replying in it (language override).

- Mapping: `lib/call-engine/voice/phone-language.ts` (`+421 → sk`, `+49 → de`, `+33 → fr`, …).
- Greeting translation: `lib/call-engine/llm/greeting.ts` (Gemini; falls back to the configured greeting on error).
- Per-language voices: `VOICE_BY_LANGUAGE` in `voice/catalog.ts` or the `ELEVENLABS_VOICE_OVERRIDES` env map.

---

## Data model

`supabase/migrations/0002_agent_calls.sql` — `calls.elevenlabs_conversation_id` (+ partial unique index); calls are keyed by ElevenLabs conversation id. First tool call or the post-call webhook creates the row (`getOrCreateAgentCall`).

`supabase/migrations/0003_phone_numbers_business_id_nullable.sql` — relaxes a legacy `phone_numbers.business_id NOT NULL` drift so number creation works.
