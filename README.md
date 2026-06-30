# AI Receptionist Now

An AI receptionist that answers, holds, and manages phone calls on your behalf — 24/7. Point a phone number at it, describe how it should behave, give it a voice, and it picks up every call, talks to callers in real time, books appointments, captures details, and hands you a clean summary afterward.

The product is two surfaces:

1. **The agent** — a low-latency voice pipeline (telephony → speech-to-text → LLM → text-to-speech) that holds a natural phone conversation.
2. **The dashboard** — where you register phone numbers, configure the AI's voice and behavior, wire up third-party integrations (calendars, CRMs), and review analytics on every call.

> **Latency is the product.** A receptionist that pauses two seconds before every reply sounds broken. The entire architecture is organized around keeping round-trip response time (caller stops talking → AI starts talking) under a strict budget. See [Latency budget](#latency-budget).

---

## Project status

This repository currently contains the **marketing landing page** (Next.js 16, React 19, Tailwind 4). The dashboard and voice pipeline described below are the product specification and roadmap — they are **not yet implemented in this repo**.

| Area | Status |
|------|--------|
| Landing page ([app/page.tsx](app/page.tsx)) | ✅ Built |
| Dashboard | 📋 Specified — not built |
| Voice pipeline (Twilio + STT + LLM + TTS) | 📋 Specified — not built |
| Third-party integrations | 📋 Specified — not built |

Sections marked 📋 below describe the intended design so implementation work has a target. Keep this table honest as features land.

---

## How a call works

```
  Caller ──dials──► Twilio number
                      │
                      ▼
            Media Streams (WebSocket, μ-law audio)
                      │
        ┌─────────────┴──────────────┐
        ▼                            ▲
  Speech-to-text              Text-to-speech
  (streaming, partial         (ElevenLabs,
   transcripts)                streamed back)
        │                            ▲
        ▼                            │
   LLM response (Claude) — streamed token-by-token
        │
        ▼
   Side effects: book appointment, look up caller,
   write call record, fire integrations
```

1. A caller dials a number you registered with Twilio.
2. Twilio opens a **Media Streams** WebSocket and streams raw call audio to the backend.
3. Audio is transcribed in real time by a streaming **speech-to-text** provider — partial transcripts let the AI start "thinking" before the caller finishes.
4. The transcript is fed to **Claude**, which generates the reply using the behavior, knowledge, and tools you configured for that number.
5. The reply is streamed to **ElevenLabs** for **text-to-speech** and the synthesized audio is streamed straight back into the call.
6. During and after the call, side effects fire: calendar bookings, CRM writes, a stored transcript, and an end-of-call summary.

### Latency budget

Target: **< ~800 ms** from end-of-caller-speech to start-of-AI-speech. Rough allocation:

| Stage | Budget |
|-------|--------|
| Endpointing (detect caller stopped) | ~150 ms |
| STT final transcript | ~100 ms |
| LLM first token (Claude, streamed) | ~300 ms |
| TTS first audio chunk (ElevenLabs, streamed) | ~150 ms |
| Network / telephony overhead | ~100 ms |

Design rules that follow from this:
- **Stream everything.** Never wait for a full transcript, a full LLM response, or a full audio file. STT partials → LLM streaming → TTS streaming → audio out, all overlapped.
- **Co-locate services.** Keep STT, LLM, and TTS calls in the same region as the telephony media edge.
- **Barge-in support.** If the caller starts talking while the AI is speaking, stop playback immediately and re-listen.
- **Cheap, fast paths first.** Use small/fast model tiers for routing and intent, escalate to a larger model only when the turn needs it.

---

## Tech stack

**Current (this repo)**
- [Next.js 16](https://nextjs.org) (App Router) + React 19
- TypeScript
- Tailwind CSS 4

**Planned for the full product**
- **Telephony:** [Twilio](https://www.twilio.com/) Voice + Media Streams (programmable inbound/outbound numbers, real-time audio)
- **LLM:** [Anthropic Claude](https://www.anthropic.com/) for conversation, intent, tool calls, and post-call summaries
- **Voice (TTS):** [ElevenLabs](https://elevenlabs.io/) for natural, low-latency synthesized speech
- **Speech-to-text:** a streaming STT provider (e.g. Deepgram / Whisper-streaming class)
- **Realtime transport:** WebSockets for the audio media stream
- **Persistence:** a database for numbers, configs, call records, transcripts, and analytics

---

## Dashboard 📋

The dashboard is where a non-technical user runs the whole thing. It has five core areas.

### 1. Phone numbers

Register and label the numbers the AI answers:
- **Label / type:** Home, Work, Organization, Personal, etc.
- Provision a new Twilio number or connect an existing line (port / forward).
- Per-number routing rules: business hours, fallback-to-human, voicemail, transfer targets.
- Enable / disable a number without deleting its config.

### 2. AI voice & behavior

Configure the personality of the receptionist per number:
- **Voice:** pick an ElevenLabs voice, adjust speed/stability, set language.
- **Greeting:** the opening line the AI says when it picks up.
- **Behavior / system prompt:** what the AI should do — answer FAQs, qualify leads, book appointments, take messages, route calls.
- **Knowledge:** business hours, services, pricing, addresses, policies the AI can reference.
- **Guardrails:** what it must not do, when to escalate to a human, transparency about being an AI.

### 3. Integrations

Connect the tools the AI reads from and writes to:
- **Calendars / meetings:** Google Calendar, Outlook, Calendly — for live appointment booking during the call.
- **CRMs:** HubSpot, Salesforce — to look up callers and log interactions.
- **Automation:** Zapier / webhooks for everything else.
- **API access:** an open REST API for custom integrations.

### 4. Analytics & statistics

Graphs and metrics over the call history:
- **Call time:** total and average call duration; talk-time trends over day / week / month.
- **Caller talk ratio:** how much the caller spoke vs the AI (a signal for conversation quality).
- **Call summaries:** an AI-generated summary of each call — intent, outcome, action items, sentiment.
- **Volume:** calls per hour/day, peak times, missed vs answered, answer rate.
- **Outcomes:** appointments booked, leads captured, calls transferred, messages taken.
- **Per-number breakdown:** filter every metric by phone number / label.

### 5. Settings & overviews

- **Daily overview:** today's calls, bookings, and summaries at a glance.
- **Monthly overview:** usage against plan limits, trends, billing.
- **Account settings:** team members, roles, notifications (email/SMS summaries), billing & plan, API keys.

---

## Getting started (current landing page)

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Edit the landing page in [app/page.tsx](app/page.tsx); it hot-reloads on save.

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

> **Note on Next.js version:** this project uses Next.js 16, which has breaking changes vs older releases. Before writing app code, check the bundled docs in `node_modules/next/dist/docs/` rather than relying on older conventions.

---

## Environment variables 📋

When the voice pipeline lands, it will need provider credentials. Put them in `.env.local` (never commit secrets):

```bash
# Telephony
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# LLM
ANTHROPIC_API_KEY=

# Text-to-speech
ELEVENLABS_API_KEY=

# Speech-to-text
STT_API_KEY=

# App
DATABASE_URL=
APP_BASE_URL=          # public URL Twilio webhooks call back into
```

Anything prefixed `NEXT_PUBLIC_` is bundled into the client and is **public** — keep provider keys unprefixed and server-side only.

---

## Project structure

```
aireceptionistnow/
├── app/
│   ├── layout.tsx        # Root layout, fonts, metadata
│   ├── page.tsx          # Landing page (built)
│   └── globals.css
├── public/               # Static assets (testimonial avatars, etc.)
├── AGENTS.md             # Notes for AI coding agents working in this repo
├── next.config.ts
└── package.json
```

Planned additions as the product is built: `app/dashboard/` (dashboard UI), `app/api/` (Twilio webhooks, media-stream WebSocket handler, integration callbacks), and a `lib/` layer for the STT/LLM/TTS pipeline.

---

## Roadmap

- [x] Marketing landing page
- [ ] Auth + account model
- [ ] Phone number registration (Twilio provisioning)
- [ ] Real-time voice pipeline (Media Streams → STT → Claude → ElevenLabs)
- [ ] AI voice & behavior configuration UI
- [ ] Calendar / CRM integrations
- [ ] Call records, transcripts, and AI summaries
- [ ] Analytics dashboard (call time, talk ratio, outcomes)
- [ ] Daily / monthly overviews and billing
