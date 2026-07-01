# Tier A — ElevenLabs managed agent (serverless)

Two ways to run the receptionist, one shared business core:

| | Tier A (free / managed) | Tier B (paid / custom) |
|---|---|---|
| Voice + LLM + turn-taking | **ElevenLabs hosts it** | Our media server (`server/`) |
| Where actions run | Our serverless webhooks (`/api/agent/*`) | In-process (`CallSession`) |
| Always-on server? | **No** — Next routes only | Yes (WebSocket media server) |
| Actions (book/check/message) | `lib/call-engine/actions.ts` | `lib/call-engine/actions.ts` |

**The actions are the same module in both tiers** (`lib/call-engine/actions.ts`). The tiers differ only in *who runs the voice loop*, never in what the receptionist can do. Post-call summary, email/CRM delivery, dashboard rows — all shared.

So: tier A needs **no Railway / no always-on server**. It is the Next app's serverless routes plus an ElevenLabs agent.

---

## What ElevenLabs handles vs. what we handle

ElevenLabs (managed): STT, the LLM brain, TTS, phone number (native Twilio/SIP), turn-taking, barge-in.

We handle (serverless webhooks): the real actions that touch *our* data — availability, booking, messages — plus the post-call recap. ElevenLabs calls these as **server tools**.

---

## Setup

### 1. Env

```bash
AGENT_WEBHOOK_SECRET=<long random string>        # shared secret for tool calls
ELEVENLABS_WEBHOOK_SECRET=<from EL dashboard>     # signs post-call + init webhooks
```

Unset ⇒ the `/api/agent/*` routes reject everything (fail closed). Tier B is unaffected.

### 2. Create the ElevenLabs agent

- Set the system prompt + greeting (or leave the greeting to the init webhook, below).
- Attach the business phone number (native Twilio integration).

### 3. Add server tools

Add one **server tool (webhook)** per action. For each, set method `POST`, the URL below, and a secret header `x-agent-secret: <AGENT_WEBHOOK_SECRET>` (or `Authorization: Bearer <AGENT_WEBHOOK_SECRET>`).

| Tool name | URL | Body params (besides the shared 3) |
|---|---|---|
| `check_availability` | `${APP_BASE_URL}/api/agent/check-availability` | `start_time`, `end_time` (ISO 8601) |
| `book_appointment` | `${APP_BASE_URL}/api/agent/book-appointment` | `title`, `start_time`, `end_time`, `attendee_name?`, `attendee_phone?`, `notes?` |
| `take_message` | `${APP_BASE_URL}/api/agent/take-message` | `caller_name?`, `callback_number?`, `message`, `urgency?` |

**Shared 3 fields every tool must send** — wire these to ElevenLabs system dynamic variables:

```
to_number       = {{system__called_number}}     # the dialed business number
from_number     = {{system__caller_id}}          # the caller
conversation_id = {{system__conversation_id}}
```

`to_number` resolves which business/assistant config to use (multi-tenant). `conversation_id` links every tool call + the post-call transcript to one call row.

Transfers: use ElevenLabs' **native transfer-to-number** tool — no webhook needed.

The parameter field names (`start_time`, `message`, …) match `lib/call-engine/llm/tools.ts` exactly, so the tool descriptions there are the canonical copy for what to tell the agent.

### 4. Post-call webhook

In the agent's webhook settings, set the **post-call transcription** webhook to:

```
${APP_BASE_URL}/api/agent/post-call
```

It persists the transcript, finalizes the call, and runs the same summary + email/CRM delivery as tier B. Copy the signing secret into `ELEVENLABS_WEBHOOK_SECRET`.

### 5. Caller-language greeting (conversation-init webhook)

Set the **conversation-initiation client-data** webhook to:

```
${APP_BASE_URL}/api/agent/init
```

On each call it guesses the caller's language from their number's country code, localizes the greeting into it, and returns `first_message` + `language` + `voice_id` overrides — so the caller is greeted in their own language before saying a word.

Requirements:
- Enable **overrides** for `first_message`, `language`, and voice in the agent's *Security* settings.
- Add the languages you serve to the agent's *Additional languages*.
- Same `ELEVENLABS_WEBHOOK_SECRET` signs this webhook.

---

## Caller-language behavior (both tiers)

Guess from phone country code → greet in that language → the LLM keeps replying in it. Live STT detection then refines the guess once the caller actually speaks (speech wins over the dialing code).

- Mapping: `lib/call-engine/voice/phone-language.ts` (e.g. `+421 → sk`, `+49 → de`, `+33 → fr`).
- Greeting translation: `lib/call-engine/llm/greeting.ts` (best-effort; falls back to the configured greeting).
- **Applies only when the assistant's language is `auto`/`multi`** (a business that pins a fixed language keeps it).
- Tier B pre-seeds this in `CallSession`; tier A does it via `/api/agent/init`.
- Per-language voices: `VOICE_BY_LANGUAGE` in `voice/catalog.ts` or the `ELEVENLABS_VOICE_OVERRIDES` env map.

---

## Migration

`supabase/migrations/0002_agent_calls.sql` adds `calls.elevenlabs_conversation_id` (+ partial unique index) so tier-A calls are keyed by conversation id instead of a Twilio call SID. Apply it before enabling tier A.
