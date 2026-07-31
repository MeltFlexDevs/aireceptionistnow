# AI Receptionist Now

An AI receptionist that answers, holds, and manages phone calls on your behalf — 24/7. Point a phone number at it, describe how it should behave, give it a voice, and it picks up every call, talks to callers in real time, books appointments, captures details, and hands you a clean summary afterward.

The product is two surfaces:

1. **The agent** — a low-latency voice pipeline (telephony → speech-to-text → LLM → text-to-speech) that holds a natural phone conversation.
2. **The dashboard** — where you register phone numbers, configure the AI's voice and behavior, wire up third-party integrations (calendars, CRMs), and review analytics on every call.

> **Latency is the product.** A receptionist that pauses two seconds before every reply sounds broken. The entire architecture is organized around keeping round-trip response time (caller stops talking → AI starts talking) under a strict budget. See [Latency budget](#latency-budget).

---

## Project status

The landing page, the dashboard and the live call engine are all built and in
production. What is **not** in this repo is a bespoke media pipeline: the
realtime audio loop runs on the **ElevenLabs Agents Platform**, and this app
configures it, feeds it live context, and serves the tools it calls.

| Area | Status |
|------|--------|
| Marketing site | ✅ Built |
| Dashboard (assistant, numbers, calls, knowledge, analytics, billing) | ✅ Built |
| Call engine (agent sync, call-start webhook, tool routes, post-call) | ✅ Built |
| Integrations (Google, Outlook, Cal.com, CRM webhooks) | ✅ Built |

---

## How a call works

```
  Caller ──dials──► Twilio number (imported into ElevenLabs)
                             │
                             ▼
              ElevenLabs Agents Platform
        (ASR → LLM → TTS, turn-taking, barge-in)
                             │
    ┌────────────────────────┼─────────────────────────┐
    ▼                        ▼                         ▼
 /api/agent/init      tool webhooks             /api/agent/post-call
 (call start:         check_availability        (transcript, summary,
  greeting, voice,    book_appointment           accuracy audit, email,
  language, who is    take_message               CRM push)
  reachable, who
  is calling)
```

1. A caller dials a Twilio number that has been imported into ElevenLabs and
   pointed at that assistant's agent.
2. ElevenLabs runs the realtime loop — transcription, the LLM turn, speech
   synthesis, endpointing and barge-in. We do not touch the audio.
3. Before the greeting, ElevenLabs calls **`/api/agent/init`**
   ([route](app/api/agent/init/route.ts)), which resolves the number to its
   assistant and returns per-call overrides: the greeting and voice in the
   caller's likely language, which escalation destinations are reachable right
   now, and what we know about this caller from previous calls.
4. Mid-call, the agent calls our **tool webhooks** under
   [`app/api/agent/`](app/api/agent) to check availability, book, take a message,
   or hit one of the business's own custom actions.
5. After the call, **`/api/agent/post-call`** stores the transcript, writes an
   AI summary, audits what the agent said against the knowledge base, emails the
   recap and pushes to any connected CRM.

The agent itself — prompt, voice, languages, knowledge base, tools, transfer
destinations — is composed and pushed by
[`lib/call-engine/agent/sync.ts`](lib/call-engine/agent/sync.ts) whenever the
assistant is saved.

### Latency budget

Target: **< ~800 ms** from end-of-caller-speech to start-of-AI-speech. Per-call
median reply latency is measured from the ElevenLabs turn metrics and charted in
the dashboard, which warns when the p95 drifts past 1.5× target.

What actually holds the budget today:

- **Speculative turns + eager endpointing**, so the LLM starts before turn
  confidence is final (`TURN_CONFIG` in `agent/sync.ts`).
- **Flash TTS models** by default; the warmer `eleven_v3_conversational` is an
  explicit opt-in per assistant, because it costs time to first audio.
- **Knowledge injected into the prompt** under ~15k characters, which skips the
  per-turn retrieval hop entirely. Bigger knowledge bases fall back to RAG.
- **Calendar prefetch** fired from the call-start webhook, so the first
  availability check answers from one indexed read.
- **Deferred booking** — the caller is acknowledged immediately and the calendar
  write finishes in the background.
- **Soft-timeout fillers** so a slow turn is never dead air, and a
  `claude-haiku-4-5` backup LLM so a Gemini outage does not drop live calls.
- **Precomputed per-language greetings and voices** at save time, so no
  translation or voice lookup ever runs while the phone is ringing.

---

## Tech stack

- **App:** [Next.js 16](https://nextjs.org) (App Router) + React 19, TypeScript, Tailwind CSS 4
- **Voice:** [ElevenLabs Agents Platform](https://elevenlabs.io/) — ASR, the
  conversational LLM turn, TTS, turn-taking and transfers
- **Telephony:** [Twilio](https://www.twilio.com/) numbers, imported into
  ElevenLabs. Twilio is also used directly for SMS alerts and CNAM.
- **Agent LLM:** `gemini-2.5-flash`, with `claude-haiku-4-5` as an explicit
  backup so a single provider outage does not take calls down
- **Summaries & translation:** Gemini, in the background after the call
- **Persistence:** Supabase (Postgres + RLS) for numbers, assistants, calls,
  transcripts, actions and analytics
- **Billing:** Stripe

---

## Dashboard

The dashboard is where a non-technical user runs the whole thing.

### 1. Phone numbers

Register and label the numbers the AI answers:
- **Label / type:** Home, Work, Organization, Personal, etc.
- Provision a new Twilio number or connect an existing line (port / forward).
- Per-number routing rules: business hours, fallback-to-human, voicemail, transfer targets.
- Enable / disable a number without deleting its config.

### 2. AI voice & behavior

Configure the receptionist per assistant:
- **Voice:** pick an ElevenLabs voice, adjust speed/expressiveness, pin a
  different voice per language, and choose speed vs warmth (`routing.voiceTier`).
- **Greeting:** the opening line, auto-translated per caller language at save time.
- **Behavior / system prompt:** the role it plays, on top of the composed base prompt.
- **Knowledge:** notes, uploaded documents, scraped pages, plus *verified
  answers* it must repeat rather than paraphrase.
- **Reaching a person:** up to five named destinations, each with its own
  condition and schedule; the situations that trigger an offer of a human
  without being asked; a callback SLA; and an optional phone page for urgent
  messages. See [`lib/call-engine/escalation.ts`](lib/call-engine/escalation.ts).
- **Truthfulness:** subjects it must never answer, subjects that always go
  straight to a person, and what it says when a caller asks whether it is an AI
  (honest when asked, by default). See [`lib/call-engine/policy.ts`](lib/call-engine/policy.ts).
- **Your own systems:** custom actions pointed at the business's own API, so it
  can look up an order or check stock instead of guessing. See
  [`lib/call-engine/agent/custom-tools.ts`](lib/call-engine/agent/custom-tools.ts).

### 3. Integrations

Connect the tools the AI reads from and writes to:
- **Calendars:** Google Calendar, Outlook and Cal.com, with per-calendar access
  levels (none / read availability / write and book). Note that an Outlook grant
  can book but cannot read busy windows, so it never produces a
  `check_availability` tool.
- **CRMs:** outbound webhooks carrying the call summary and transcript.
- **Custom actions:** the business's own HTTP endpoints, exposed to the agent as
  tools (see above).

### 4. Analytics & call review

- **Call summaries:** intent, outcome, action items and sentiment per call.
- **Accuracy audit:** the same post-call pass compares what the assistant
  asserted against the knowledge base and flags anything unsupported, so a
  hallucination is visible instead of silent. Flagged calls are badged in the
  call list and the claims are listed on the call, with a link to fill the gap
  in the knowledge base.
- **Latency:** median and p95 reply latency against an 800 ms target, with a
  warning when the slow tail drifts.
- **Volume, outcomes and talk ratio**, with a per-assistant breakdown.

### 5. Settings & overviews

- **Daily overview:** today's calls, bookings, and summaries at a glance.
- **Monthly overview:** usage against plan limits, trends, billing.
- **Account settings:** team members, roles, notifications (email/SMS summaries), billing & plan, API keys.

---

## Getting started

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

## Environment variables

Put them in `.env.local` (never commit secrets):

```bash
# App
APP_BASE_URL=                       # public URL ElevenLabs calls our tool webhooks on
NEXT_PUBLIC_SITE_URL=

# Voice
ELEVENLABS_API_KEY=
ELEVENLABS_AGENT_ID=                # the marketing demo agent
ELEVENLABS_AGENT_PHONE_NUMBER_ID=   # caller ID for demo and test calls
ELEVENLABS_WEBHOOK_SECRET=          # verifies the post-call webhook signature
ELEVENLABS_POST_CALL_WEBHOOK_ID=
ELEVENLABS_HOURLY_CALL_CAP=         # outbound spend guards
ELEVENLABS_DAILY_CALL_CAP=
AGENT_WEBHOOK_SECRET=               # shared secret on our own tool routes

# LLM (summaries, translation, greeting localization)
GEMINI_API_KEY=

# Telephony (numbers, SMS alerts, CNAM)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SMS_FROM=

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=          # bypasses RLS - server only, never exposed

# Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_SOLO_MONTHLY=
NEXT_PUBLIC_STRIPE_PRICE_SOLO_ANNUAL=
NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY=
NEXT_PUBLIC_STRIPE_PRICE_TEAM_ANNUAL=

# Calendar OAuth
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
MICROSOFT_OAUTH_CLIENT_ID=
MICROSOFT_OAUTH_CLIENT_SECRET=
CALCOM_OAUTH_CLIENT_ID=
CALCOM_OAUTH_CLIENT_SECRET=

# Post-call summary emails (Resend). Without both, summaries are logged and skipped.
RESEND_API_KEY=
EMAIL_FROM=                         # verified sender
```

Anything prefixed `NEXT_PUBLIC_` is bundled into the client and is **public** — keep provider keys unprefixed and server-side only.

---

## Project structure

```
aireceptionistnow/
├── app/
│   ├── (main)/
│   │   ├── dashboard/        # The product UI
│   │   ├── blog/ answers/    # Marketing + SEO content
│   │   └── page.tsx          # Landing page
│   └── api/
│       ├── agent/            # Call-start webhook, tool routes, post-call
│       ├── integrations/     # Calendar OAuth connect + callback
│       └── stripe/ cron/ …
├── lib/
│   ├── call-engine/          # Everything the live call touches
│   │   ├── agent/            # Agent sync, tools, custom tools, context
│   │   ├── escalation.ts     # Named destinations and when they are reachable
│   │   ├── policy.ts         # Disclosure and truthfulness guardrails
│   │   ├── caller-context.ts # Returning-caller recognition
│   │   ├── paging.ts         # Ringing the business for an urgent message
│   │   ├── integrations/     # Calendars, CRM, availability snapshots
│   │   └── summary/          # Post-call summary, accuracy audit, email
│   ├── dashboard/            # Server-side data access for the UI
│   ├── knowledge/            # Sources, verified answers, PDF/website ingest
│   └── i18n/                 # 8 locale dictionaries
├── supabase/migrations/
└── AGENTS.md                 # Notes for AI coding agents working in this repo
```

Pure, decision-making modules (`escalation.ts`, `policy.ts`, `transfer-hours.ts`,
`custom-tools.ts`, `assistant-patch.ts`) are kept free of I/O and have sibling
`*.test.ts` files. Run them with `npm test`.

---

## Roadmap

Shipped:

- [x] Marketing site, auth, billing
- [x] Number provisioning and routing to a per-assistant ElevenLabs agent
- [x] Live calls: greeting, multilingual answering, booking, messages, transfer
- [x] Calendar (Google, Outlook, Cal.com) and CRM webhooks
- [x] Call records, transcripts, AI summaries and analytics
- [x] Named escalation destinations, proactive escalation, urgent paging
- [x] Post-call accuracy audit and operator guardrails
- [x] Custom actions against the business's own API
- [x] Returning-caller recognition

Known gaps, stated plainly:

- **Warm transfer is opt-in and unverified against every carrier.** Per
  destination we can send `conference` or `blind`; unset leaves the ElevenLabs
  default alone. Worth measuring on a real carrier before promoting it.
- **Escalation hours are prompt steering, not a platform block.** Built-in tools
  cannot be overridden per conversation, so the schedule is enforced by what the
  prompt says on each call. Strong, but not a compliance control.
- **Custom action URLs are validated at save time, not at call time.**
  ElevenLabs makes the request, not us, so a host that resolves publicly now and
  privately later is not covered. See the note at the top of `custom-tools.ts`.
- **Urgent paging is rate-limited per serverless instance**, so a cold start can
  allow a second page inside the cooldown window.
- **No live listen-in or mid-call takeover.** The dashboard shows an in-call
  indicator only.
