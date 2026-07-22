# Calling Flow Guide: Lower Latency + More Human Responses

Implementation guide for the voice calling flow. Covers the current architecture,
why we stay on ElevenLabs Agents + Gemini, and two workstreams:

1. **Latency** - cut the response gap, above all during calendar booking.
2. **Humanization** - make the agent sound more human and recognize callers better.

All platform facts below were verified against live ElevenLabs / Google / Cal.com /
Microsoft / Vercel docs on 2026-07-22 (sources at the end). Fields marked
*unverified* could not be confirmed in official docs and must be tested before
relying on them. SDK field names match the installed `@elevenlabs/elevenlabs-js`
v2.55.0 (camelCase; the wire format is snake_case).

---

## 1. TL;DR

| Decision | Verdict |
|---|---|
| Orchestration platform | **Stay on ElevenLabs Agents.** Migration to Vapi/Retell/Pipecat/LiveKit buys no latency, costs more (Retell surcharges ElevenLabs voices), and means a full rebuild. |
| LLM | **Keep `gemini-2.5-flash` with `thinkingBudget: 0`.** Verified 0.49s TTFT non-reasoning, still ElevenLabs' recommended default. Do not upgrade to Gemini 3.x yet (no verified low-thinking TTFT; "minimal" thinking cannot be fully off). A/B `gemini-2.5-flash-lite` (0.36s TTFT) if quality holds. |
| Biggest booking-latency wins | (1) Fix the region mismatch: ElevenLabs webhook egress is **US (Iowa)** by default while our functions are pinned to **fra1**. (2) Skip the live double-book guard when the snapshot is seconds old. (3) Warm write-calendar OAuth tokens at call start (Cal.com and Outlook currently never get warmed). |
| Biggest humanization wins | `textNormalisationType: "elevenlabs"`, voice settings (stability ~0.45, speed ~1.0), `conversation.backgroundSound` office ambience, `asr.keywords` for the business's own vocabulary, richer soft-timeout fillers. Pilot Expressive Mode (`eleven_v3_conversational`) behind a measurement. |

---

## 2. Architecture today

```
Caller -> Twilio number -> ElevenLabs Agents (native Twilio integration)
                              |  ASR: scribe_realtime (default)
                              |  LLM: gemini-2.5-flash, thinkingBudget 0
                              |  TTS: eleven_flash_v2 (en) / eleven_flash_v2_5 (multi)
                              |
        conversation-initiation webhook          webhook tools
        POST /api/agent/init                     POST /api/agent/check-availability
        (greeting/language/voice override,       POST /api/agent/book-appointment
         availability prefetch via after())      POST /api/agent/take-message
                              |
                     Vercel (fra1, Node) -> Supabase + Cal.com / Google / Outlook
```

Key files:

- `lib/call-engine/agent/sync.ts` - builds the full ElevenLabs agent config
  (prompt, LLM, TTS, turn config, language presets, KB, tools) and syncs it.
- `lib/call-engine/agent/tools.ts` - webhook tool definitions (`preToolSpeech`,
  `toolCallSound`, `responseTimeoutSecs`).
- `app/api/agent/init/route.ts` - call-start webhook: overrides greeting/language/
  voice from caller ID, prefetches calendar availability in `after()`.
- `lib/call-engine/actions.ts` - tool implementations; `bookAppointmentAction` is
  the booking hot path.
- `lib/call-engine/integrations/*` - Cal.com / Google / Outlook providers,
  snapshot store, token store.

What is already done well (do not regress):

- LLM thinking disabled, no reasoning summary (`sync.ts:326-335`).
- Flash TTS models, the fastest tier (`sync.ts:53-56`).
- `speculativeTurn: true` + `turnEagerness: "eager"` + soft-timeout LLM fillers
  (`sync.ts:29-46`).
- `preToolSpeech: "force"` on booking + typing sound, so the webhook runs while
  the agent talks (`tools.ts:97-104`).
- KB <= 15k chars injected into the prompt to skip the ~250ms/turn RAG hop
  (`sync.ts:48-59`).
- Per-language greetings and voices precomputed at sync time so `/api/agent/init`
  never blocks the greeting on an LLM call (`sync.ts:306-324`).
- Tool errors returned as HTTP 200 with spoken-style instructions, never 5xx
  (`handler.ts:47-59`). Keep this: the platform's `toolErrorHandlingMode`
  defaults to hiding webhook errors from the LLM, so our instruction strings are
  the only reliable error channel.

---

## 3. Why we stay on ElevenLabs Agents + Gemini

The user-facing requirement is ElevenLabs voices; the question was whether the
orchestration or LLM should change.

**Orchestration - stay.** Everything that historically justified leaving is now
native platform config: pre-tool speech runs the acknowledgement and the webhook
in parallel, `executionMode: "async"` exists for fire-and-forget tools, soft
timeouts inject LLM-generated fillers, and the `language_detection` system tool
handles mid-call language switching better than any competitor. Cost and latency
comparison (vendor claims + third-party measurements, July 2026):

| Option | Voice-to-voice latency | All-in cost/min | ElevenLabs-voice penalty | Migration effort |
|---|---|---|---|---|
| ElevenLabs Agents (current) | <100ms orchestration overhead claim; ranked fastest (1.73s p50) in the only cross-platform benchmark | ~$0.10-0.12 | none | zero |
| Retell | ~600ms claim / 680ms measured median | ~$0.145 | +$0.040/min for ElevenLabs voices | full rebuild |
| Vapi | ~800ms claim / 720ms measured median | ~$0.10-0.15 | pass-through | full rebuild |
| Pipecat / LiveKit Agents | ~750-950ms achievable, self-tuned | ~$0.05-0.09 components | none | own the pipeline |
| Raw Twilio Media Streams | no advantage | - | - | strictly dominated by Pipecat/LiveKit; do not build |

Keep Pipecat/LiveKit as the documented exit path, triggered only by needing
pipeline internals ElevenLabs won't expose or by volume (~50k+ min/month) where
the platform premium funds the engineering.

**LLM - keep `gemini-2.5-flash`, `thinkingBudget: 0`.** Verified numbers
(Artificial Analysis, non-reasoning): 2.5 Flash TTFT 0.49s; 2.5 Flash-Lite 0.36s;
Claude Haiku 4.5 0.90s. Gemini 3.1 Flash-Lite is natively selectable in
ElevenLabs but its only measured TTFT is 5.86s *including thinking*, and Google
documents that its "minimal" thinking level "does not guarantee that thinking is
off". Gemini 3.5/3.6 Flash have no low-thinking measurements at all. Google's
current docs confirm `thinkingBudget: 0` remains the supported disable mechanism
for the 2.5 series (the newer `thinking_level` API applies to 3.x and the
Interactions API, not the generateContent path ElevenLabs uses).

Two LLM config additions worth making in `sync.ts`:

```ts
const promptConfig: ElevenLabs.PromptAgentApiModelOutput = {
  // ...existing fields (llm: "gemini-2.5-flash", thinkingBudget: 0, ...)
  // Explicit backup cascade: a Jan 2026 ElevenLabs incident degraded all
  // Gemini-backed agents platform-wide; a non-Google fallback keeps calls alive.
  backupLlmConfig: { preference: "override", order: ["claude-haiku-4-5"] },
};
```

- `backupLlmConfig` (SDK-verified): `default` | `disabled` | `override` with an
  ordered model list. `claude-haiku-4-5` is in the enum and is the fastest
  non-Google instruct model available (0.90s TTFT).
- `temperature` defaults to 0 platform-side and `maxTokens` to -1 (uncapped).
  Deterministic output is fine for a receptionist; leave both unset. If replies
  ever feel stiff or repetitive across calls, try `temperature: 0.3-0.5` - but
  measure against the "vary your wording" prompt rule first.

Re-evaluate the model choice when (a) ElevenLabs exposes `reasoningEffort:
"minimal"` measurements for 3.x models (the field exists in the SDK), or
(b) Artificial Analysis publishes non-reasoning TTFT for 3.1/3.5 Flash-Lite.

---

## 4. Where a booking turn spends its time

Worst-case budget for one `book_appointment` turn today (caller has just said
"yes, book it"):

| Phase | Typical | Worst case | Where |
|---|---|---|---|
| LLM decides to call tool + emits pre-tool speech | 300-600ms | 1.5s | platform |
| ElevenLabs (US, Iowa) -> Vercel fra1 transit | ~100-110ms | - | network |
| Context resolve (config + call row) | ~0ms warm / 60-200ms cold | 300ms | `context.ts:39-73` |
| Live double-book guard (`fresh: true`, snapshot bypassed) | 150-800ms | **6s** (`INTEGRATION_TIMEOUT_MS`) | `actions.ts:115-124` |
| Token refresh if cold (Cal.com/Outlook always cold, see 5.3) | 0-400ms | 1s | `google.ts:41-67`, `calcom.ts:28-84` |
| Provider `createEvent` | 400-1500ms | **13s** (`BOOKING_TIMEOUT_MS`) | `actions.ts:126-129` |
| `clearSnapshot` + `recordAction` (parallel) | 30-100ms | 1s | `actions.ts:142-159` |
| Response transit + LLM formulates confirmation + TTS TTFB | 500-900ms | 2s | platform |

Typical total: **2.5-4.5s** between "yes" and hearing the confirmation, of which
the forced pre-tool speech masks roughly the first 1.5-2s. Worst case blows
through the 25s tool budget. The work below targets the typical case down to
~1.5-2.5s (fully masked) and caps the tail.

---

## 5. Latency workstream

### 5.1 Agent config (sync.ts) - platform knobs

Current `TURN_CONFIG` is good. Deltas:

```ts
const TURN_CONFIG: ElevenLabs.TurnConfig = {
  speculativeTurn: true,
  turnEagerness: "eager",
  interruptionIgnoreTerms: [ /* keep existing list */ ],
  softTimeoutConfig: {
    timeoutSeconds: 2,
    useLlmGeneratedMessage: true,
    // Raise from 2: fillers re-fire every timeoutSeconds until the LLM streams
    // content, so 4 x 2s covers a slow booking window instead of going silent
    // after 4s.
    maxSoftTimeoutsPerGeneration: 4,
  },
};
```

Notes and caveats:

- Soft-timeout fillers are documented for LLM-generation latency. Whether the
  timer also runs while a *blocking webhook tool* executes is **not documented**;
  the observable behavior in production suggests it does (this is what
  `softTimeoutConfig` was added for in this codebase). Verify with a test call
  against an artificially slow webhook before trusting it as the only cover.
- `randomizeFillers` and `additionalSoftTimeoutMessages` only apply to *static*
  fillers (`useLlmGeneratedMessage: false`). We use LLM-generated fillers, which
  are already varied and language-matched - keep that.
- `turnTimeout` platform default is 7s (separate from `silenceEndCallTimeout`,
  default -1/disabled). 7s is fine for reception; do not lower below ~5s or
  slow-speaking callers get re-prompted mid-thought.
- `tts.optimizeStreamingLatency` exists in the SDK but is a **documented no-op
  for agents**. Do not add it.
- Keep the composed system prompt lean. ElevenLabs' prompting guide warns that
  prompts beyond ~2,000 tokens raise per-turn latency. The current composed
  prompt is ~3-3.5k chars (~800-900 tokens) before KB injection - fine. The 15k
  char KB inject threshold puts worst-case context at ~18k chars; that is a
  deliberate trade (RAG costs ~250ms/turn instead). Leave the threshold, but
  document to operators that a smaller KB means a snappier agent.

Tool-level (in `tools.ts`):

- Keep `preToolSpeech: "force"` + `toolCallSound: "typing"` on booking.
  ElevenLabs' guidance: typing sound for ~1-3s tools, elevator music for >3s.
  Once 5.3 lands, typical booking should be under 3s - typing is the right fit
  (and elevator music on a receptionist line sounds like being put on hold).
- `executionMode` (immediate | post_tool_speech | async) now exists on webhook
  tools. **Do not switch booking to `async`** - see 5.5 for why.
- After 5.3 lands and p99 is measured, lower `responseTimeoutSecs` on booking
  from 25 toward the real p99 + headroom so a hung provider fails into the
  graceful fallback sentence sooner.

### 5.2 Region placement - fix the geography

Verified: ElevenLabs webhook tool calls egress from published static IPs.
Default (non-residency) workspaces use the **US IPs `34.67.146.145` /
`34.59.11.47`, located in GCP us-central1 (Iowa)**. EU standard IPs exist
(Netherlands) but the Agents serving default is US. Our `vercel.json` pins
everything to `fra1` (Frankfurt), so **every tool call and the init webhook pay
a transatlantic round trip (~100ms+) before our code even runs** - on every
conversational turn that touches a tool.

Decision tree:

1. **Confirm first, then move.** Log `request.headers` / source IP on one
   inbound tool call and match against the published IP table. If the source is
   `34.67.146.145` or `34.59.11.47`, we are US-served.
2. **Default path (recommended): move the hot routes to a US region and
   colocate the DB.**
   - Check the Supabase project region (dashboard). If it is EU, moving compute
     without the DB just relocates the latency. The full win requires both in
     the US (Supabase supports project migration via backup/restore; or accept
     the one-time effort now, before scale).
   - `vercel.json`: `"regions": ["iad1"]` (closest Vercel region to the Iowa
     egress and to Cal.com/Google/Microsoft US API frontends). Vercel warns Node
     functions honor only the project/`vercel.json` region config, not
     per-route `preferredRegion`.
3. **If we sign ElevenLabs Enterprise EU data residency** (isolated workspace,
   `api.eu.residency.elevenlabs.io`, egress from Belgium): keep `fra1`, and add
   Twilio regional routing (`ie1`) per ElevenLabs' residency docs. That
   combination is ~8-12ms from fra1 and beats any US layout for EU callers.
   Until then, assume US.
4. Twilio leg: most of our numbers' callers and Twilio's default `us1` media
   region are US-centric today; if the customer base is EU-heavy, residency
   (option 3) is the correct long-term answer, not fra1-with-US-egress.

Expected saving: ~200ms per tool turn (two transits), plus the same on the
init webhook before the greeting.

### 5.3 Booking webhook fast path

Ordered by impact, all in `lib/call-engine/`:

**(a) Trust a fresh snapshot for the double-book guard.**
`bookAppointmentAction` always does a *live* `getBusy` (`fresh: true`, up to 6s)
before `createEvent` - even when `check_availability` wrote a snapshot for the
same window two seconds earlier (the standard flow: the prompt requires a check
before booking). Change the guard in `actions.ts:115-124` to:

```ts
// Guard against double-booking: a snapshot written in the last ~45s by
// check_availability is fresher than the race window we are guarding against;
// only fall back to a live read when no such snapshot covers the slot.
const check = await checkAvailability(readable, req.startTime, req.endTime, {
  maxSnapshotAgeMs: 45_000,   // new option: use snapshot iff fetchedAt is this fresh
});
```

Implementation in `availability.ts`: add `maxSnapshotAgeMs` to the options; when
set, accept a covering snapshot younger than the limit instead of forcing
`fresh`. Keep the existing behavior (live read) when no fresh snapshot covers
the window. The provider's own conflict rejection (Cal.com rejects a taken slot
at booking time; see (e)) remains the final backstop, exactly as today's
fail-open guard already assumes.
Saving: 150ms-6s on nearly every booking, since the check-then-book flow makes
a fresh snapshot the common case.

**(b) Warm the write-calendar token at call start.**
`prefetchAvailability` (fired from `/api/agent/init` via `after()`) warms OAuth
tokens only through `getBusy`. Two providers never benefit:

- **Cal.com**: `getBusy` hits the *unauthenticated* `/v2/slots` endpoint
  (verified: the route has no auth guard and ignores the Authorization header),
  so the OAuth token is cold when `createEvent` runs and the booking pays the
  401 -> refresh -> retry chain (2 extra round trips). Cal.com tokens expire
  after 1800s, so they are effectively always cold.
- **Outlook**: has no `getBusy` at all, same consequence.

Fix: extend the prefetch to also ping one cheap *authenticated* endpoint per
write-granted integration (Cal.com: `GET /v2/me`; Outlook: `GET /me` with
`$select=id`), or refresh proactively when the stored token is near expiry.
Saving: 400-1000ms off the booking critical path for Cal.com/Outlook.

**(c) Pre-create the call row in init.**
The first tool call of every conversation pays a serial `createAgentCall` INSERT
(`context.ts:57-64`). `/api/agent/init` already has the conversation context;
create the row there inside the existing `after()` so `findAgentCallId` hits on
the first tool call from any instance. Saving: 30-100ms on the first tool call.

**(d) Add an in-memory layer over the snapshot store.**
`readSnapshots` is a Supabase round trip even on a hit (30-80ms per
`check_availability`). A per-instance `Map` with a ~30s TTL in front of
`snapshot-store.ts` makes hot checks near-zero network; the DB row stays the
cross-instance source of truth. Invalidate the memory entry in `clearSnapshot`.

**(e) Provider-level speedups + idempotency (also enables safe retries).**

| Provider | Speedup | Idempotency |
|---|---|---|
| Cal.com | Pin `cal-api-version: 2026-02-25` on bookings (`calcom.ts:122` still sends `2024-08-13`, which silently selects an old behavior set). | No client idempotency key exists on v2 create-booking. Cal.com derives one server-side (uuidv5 of `start.end.userId`), so an exact-duplicate retry errors rather than double-books, but it does not return the original booking - treat a duplicate 400 as "probe, don't re-fire". Also dedupe ourselves: unique constraint on `(call_id, type)` for booking actions. |
| Google | Current `events.list` with `fields` is fine; if multi-calendar support ever lands, one `freebusy.query` covers up to 50 calendars in a single round trip. | Supply a client-generated event `id` (base32hex of e.g. the conversation id) on `events.insert`; a retry then 409s instead of duplicating. |
| Outlook | Implement `getBusy` via `getSchedule` (lighter than `findMeetingTimes`). This is a triple win: enables `check_availability` for Outlook-only businesses (today `providerSupportsBusy` excludes them and bookings run **with no double-book guard at all**), enables the snapshot prefetch, and warms the token. | Set `transactionId` on event creation - documented by Microsoft exactly for the client-retry case. |

**(f) Keep, but document, the deadline semantics.**
`withDeadline` races and never aborts the underlying request; a timed-out create
may still land (hence the "pending" status and the cancellation sweep). This is
correct - aborting the fetch would not un-send a request the provider already
accepted. With idempotency keys from (e), the sweep can now also *retry*
pending bookings safely.

### 5.4 Availability fast path

- **Close the prefetch coverage gap.** Prefetch covers now..+7d but a check
  needs `start..start+3d` covered, so any availability question more than ~4
  days out is a guaranteed live read. Raise `PREFETCH_DAYS` to 14 in
  `availability.ts:15` (busy-window payloads are small), and/or write a snapshot
  covering the queried window after a live miss (already done) *plus* trigger a
  background re-prefetch of the wider window via `after()` on a miss.
- `check_availability` keeps `preToolSpeech: "auto"` - the platform decides
  based on recent tool latency, which is exactly right once most checks are
  snapshot-fast.

### 5.5 What NOT to do: async optimistic booking (for now)

`executionMode: "async"` looks tempting: confirm verbally, book in the
background, zero perceived latency. Verified platform reality argues against it:

- There is **no documented mechanism to inject an async tool's result or
  failure back into the live conversation** on ElevenLabs. Vapi has a spoken
  `request-failed` message; ElevenLabs does not.
- Webhook errors are hidden from the LLM by default (`toolErrorHandlingMode:
  "auto"` resolves to hide for custom webhooks), so a failed background booking
  is silent.
- The existing product stance (enforced throughout `actions.ts`) is "never
  claim booked when it isn't". Async-optimistic breaks that: the caller hears
  "you're all set", hangs up, and the create fails with no recovery channel
  except an SMS apology.

With 5.2 + 5.3 the synchronous path lands at ~1-2.5s, fully masked by forced
pre-tool speech + typing sound + soft-timeout fillers. That is the right
risk/latency trade for bookings.

Revisit only if a provider stays slow after 5.3. The safe variant then is
**reserve-then-book for Cal.com**: `POST /v2/slots/reservations` (verified: our
third-party OAuth token works; auth is optional on the endpoint; custom
`reservationDuration` allowed since the token owner owns the event type) at the
moment the caller picks a slot, then complete the booking synchronously. Two
verified caveats: a reservation only hides the slot from `/v2/slots` reads - it
does **not** block a direct booking POST (open Cal.com issue #23974), so keep
the guard; and whether an expired token on the reservation POST returns a 401
(needed to drive our refresh path) is untested.

`take_message` is the one tool where `executionMode: "async"` *would* be safe
in principle (side effect + fixed response), but the current implementation
must await the INSERT before claiming "message saved", and it already responds
in ~1 DB round trip. Not worth changing.

### 5.6 Measurement (do this first and last)

- Instrument the three tool routes with phase timings (context resolve, guard,
  create, persist) in a structured log line; the post-call route already stores
  per-call latency medians from ElevenLabs - correlate.
- Log the webhook source IP once to confirm the egress region (5.2).
- ElevenLabs' tool-executions API (`GET .../tools/{id}/executions`) exposes
  per-execution errors and is the ground truth for tool p50/p99.
- Baseline a week before shipping 5.2/5.3, compare after. Target: booking tool
  server time p50 < 1.2s, p99 < 4s; end-to-end "yes" -> confirmation < 2.5s.

---

## 6. Humanization workstream

The system prompt (`composeSystemPrompt`, `sync.ts:89-172`) is already strong:
first-person business persona, contractions, 1-2 sentence replies, one question
per turn, varied acknowledgements, no list-reading, natural time phrasing,
pre-tool announcements, warm closing. The remaining wins are mostly platform
config, not prompt rewrites.

### 6.1 Voice settings (sync.ts `baseTts`)

Agent TTS exposes `stability`, `similarityBoost`, `speed` (not style/speaker
boost - those are TTS-API-only). Platform defaults: 0.5 / 0.8 / 1.0. Official
voice-design guidance: stability 0.30-0.50 reads as emotional and dynamic,
0.60-0.85 as consistent but monotone; natural conversation sits at 0.9-1.1x
speed.

```ts
const baseTts: ElevenLabs.TtsConversationalConfigOutput = {
  voiceId,
  modelId: ttsModelForBase(language),
  stability: 0.45,        // default when the operator hasn't set one
  similarityBoost: 0.75,
  // keep existing user overrides from routing.voice (speed, stability) winning
};
```

Keep the dashboard's per-assistant speed/stability controls; these are just
better defaults. A/B against the same test script when tuning - perceived
quality is voice-dependent.

### 6.2 Text normalization - `textNormalisationType: "elevenlabs"`

Today the platform default (`system_prompt`) merely instructs the LLM to spell
things out. Flash v2.5 is the weakest model at raw digits (official example:
"$1,000,000" read as "one thousand thousand dollars"). Set:

```ts
tts: { ...baseTts, textNormalisationType: "elevenlabs" }
```

This normalizes numbers, prices, phone numbers, and emails *after* generation
(transcripts stay clean, speech is always correct) at a documented "slight"
latency cost. For a receptionist that reads back times, prices, and callback
numbers, this is the single highest-leverage humanization switch. Keep the
prompt's "say times naturally" rules - they shape phrasing, normalization
guarantees pronunciation.

### 6.3 Background ambience - `conversation.backgroundSound`

A perfectly silent line is a strong AI tell. Verified native support (June 2026):

```ts
const multilingualConfig: ElevenLabs.ConversationalConfig = {
  // ...existing agent/turn/tts/languagePresets
  conversation: {
    backgroundSound: {
      sourceType: "preset",
      sourceId: "office1",   // or office2; also restaurant, city, typing, elevator1-4
      volume: 0.15,          // platform default 0.6 is far too loud for telephony
      crossfadeLoop: true,   // avoids audible pops at the loop boundary
    },
  },
};
```

Make it an operator toggle (some businesses will want silence); default on at
low volume. Test on a real phone call - G711 8kHz compresses ambience
differently than the dashboard preview.

### 6.4 Recognition - `asr.keywords` (this is the "better recognizable" fix)

The agent currently runs ASR entirely on defaults (`scribe_realtime`, no
keyword biasing), so it mishears business names, staff names, and service
vocabulary - which then poisons bookings and messages. Verified: the agents
schema has `asr.keywords: string[]` ("boost prediction probability"), and
per-call keyword overrides exist behind an override permission flag.

1. In `sync.ts`, build a keyword list per assistant: business name, staff
   names, service names, street/area names from the knowledge profile. Keep it
   tight - realtime keyterm limits are ~50 terms of <=20 chars (limit verified
   for the underlying Scribe API, unconfirmed for the agents field
   specifically); prioritize terms transcripts actually get wrong.

```ts
const multilingualConfig: ElevenLabs.ConversationalConfig = {
  // ...
  asr: { keywords: buildAsrKeywords(assistant, businessName, knowledge) },
};
```

2. Optionally, enable the ASR override in `platformSettings.overrides` and have
   `/api/agent/init` add caller-specific terms (e.g. a known caller's name from
   CRM) via `conversation_initiation_client_data` - the override flag defaults
   to false and must be switched on first.

No agents-side surcharge for keywords is documented (the $0.05/hr keyterm fee
is standalone STT API pricing).

### 6.5 Pronunciation dictionaries (targeted fix-ups)

For names the TTS itself mangles (not the ASR): attach a `.pls` dictionary via
`tts.pronunciationDictionaryLocators`. Constraint: phoneme (IPA/CMU) entries
only work on `eleven_flash_v2` and v3-family models - on `eleven_flash_v2_5`
(our multilingual model) only **alias** entries (respellings) apply. Build this
as an escape hatch when a specific business name is mispronounced, not as a
default feature.

### 6.6 Expressive Mode pilot - `eleven_v3_conversational`

Verified: v3-style audio tags ([laughs], [sighs], [slow], [excited]) are
available inside Agents via the `eleven_v3_conversational` model with
`expressiveMode` (default true) and `suggestedAudioTags` (up to 20). 70+
languages (vs 32 for flash v2.5), same $0.08/min agents pricing. This is the
biggest potential humanness jump available.

Hold it behind a pilot because three things are unverified: **latency** (no
published number, only "ultra-low-latency"; flash v2.5's ~75ms baseline has no
v3c counterpart), telephony behavior over 8kHz G711 (structurally implied,
never stated), and phoneme-dictionary support. Also verified caveat: it does
not preserve Professional Voice Clone characteristics - if any operator voice
is a PVC, it will not sound like itself.

Pilot plan: switch the **demo agent** (`provisionDemoAgent`) to
`eleven_v3_conversational`, add 3-5 suggested tags, run scripted calls, and
compare ElevenLabs' per-conversation turn metrics against the flash baseline.
Ship to customer agents only if turn latency is within ~100ms of flash v2.5.

### 6.7 Prompt deltas (small, additive)

- **Inject the business timezone.** The prompt says "interpret times in the
  business's local timezone when it is known from your instructions", but
  nothing injects it. Add to `composeSystemPrompt`: the business timezone (from
  calendar integration config or account settings) next to the
  `{{system__time_utc}}` line. This kills a whole class of wrong-day bookings
  and stilted time confirmations.
- **Spoken-output guard.** One line: "Your replies are spoken aloud: never use
  markdown, bullet points, or symbols; say everything as you would speak it."
  (With 6.2 on, digit normalization is guaranteed anyway; this covers
  formatting.)
- Do **not** add scripted disfluencies ("um", "uh") to the prompt - official
  guidance favors brief affirmations, and hesitation noises are already covered
  naturally by soft-timeout fillers and (in the pilot) Expressive Mode prosody.
- Keep tool-result strings as stage directions (current pattern is exactly
  right and doubles as the error-recovery channel).

### 6.8 Language switching

Already strong (language presets, `language_detection` system tool, per-language
voices/greetings precomputed at sync). One verified nuance: docs recommend
voices "specifically trained in your target languages" for natural accents -
the auto-picker in `voice/catalog.ts` already scores for this; when operators
pin `voiceByLanguage`, surface that recommendation in the dashboard UI copy.

---

## 7. Rollout plan

**Phase 0 - instrument (0.5 day).** 5.6 logging + source-IP check + baseline
week of tool timings. No behavior change.

**Phase 1 - config-only wins (1 day, low risk).**
- `sync.ts`: soft timeout `maxSoftTimeoutsPerGeneration: 4`; `backupLlmConfig`
  cascade; `textNormalisationType: "elevenlabs"`; voice-setting defaults
  (stability 0.45, similarityBoost 0.75); `asr.keywords`.
- Prompt: timezone injection + spoken-output guard.
- Verify: sync one test assistant, place scripted calls (English + one
  non-English), confirm config landed via `GET /v1/convai/agents/{id}`.

**Phase 2 - booking fast path (2-3 days).**
- 5.3(a) snapshot-trusting guard, (b) token warm-up, (c) call-row pre-create,
  (d) in-memory snapshot layer, 5.4 prefetch window.
- 5.3(e): Cal.com API version pin, Google event id, Outlook `getSchedule` +
  `transactionId`.
- Verify: scripted booking calls per provider; assert one-network-hop
  availability checks in logs; run the double-book scenario (book the same slot
  from two calls) and confirm the guard still catches it.

**Phase 3 - region move (coordination required).**
- Confirm egress region from logs; check Supabase project region; move
  functions (`vercel.json` regions) and DB together, or defer until the EU
  residency decision is made. Measure before/after tool-turn latency from
  ElevenLabs' conversation metrics.

**Phase 4 - ambience + Expressive Mode pilot (1-2 days).**
- `backgroundSound` behind an operator toggle.
- Demo-agent pilot of `eleven_v3_conversational` per 6.6; promote only on
  latency parity.

---

## 8. Open questions / explicitly unverified

- Whether soft-timeout fillers re-arm during a blocking webhook tool (docs
  describe LLM-generation latency only) - test with an artificially slow tool.
- Whether `tool_call_sound` loops for the full duration of a 10-20s execution -
  undocumented; the "fillers auto-extend for slow tools" claim exists only in
  an ElevenLabs blog post, not in docs or the API schema.
- Whether ElevenLabs aborts the outbound HTTP request when
  `responseTimeoutSecs` expires, or just stops waiting - undocumented (our
  "pending" handling covers either way).
- `eleven_v3_conversational`: latency, 8kHz telephony behavior, phoneme
  dictionary support - all unpublished (hence the pilot).
- Cal.com `OptionalApiAuthGuard` behavior on an expired token (401 vs silent
  anonymous downgrade) - test before wiring reservations into the refresh path.
- Whether `reasoningEffort: "minimal"` is actually enabled for
  `gemini-3.1-flash-lite` in ElevenLabs (`available_reasoning_efforts` comes
  from an authenticated endpoint).
- Supabase project region (readable in the dashboard) - determines Phase 3
  shape.
- Whether a default-workspace phone call can ever be served from ElevenLabs'
  EU/Asia backends rather than US - undocumented; the source-IP log settles it
  for us.

---

## 9. Sources

ElevenLabs (all fetched 2026-07-22):
- LLM options and guidance: https://elevenlabs.io/docs/eleven-agents/customization/llm
- Conversation flow (turn config, soft timeouts): https://elevenlabs.io/docs/eleven-agents/customization/conversation-flow
- Create-agent API reference / OpenAPI: https://elevenlabs.io/docs/api-reference/agents/create , https://api.elevenlabs.io/openapi.json
- Tool config (execution mode, pre-tool speech, sounds): https://elevenlabs.io/docs/eleven-agents/customization/tools/tool-configuration/tool-call-sounds , changelogs 2025-10-27, 2026-02-09, 2026-04-27, 2026-06-08, 2026-06-22
- Expressive Mode: https://elevenlabs.io/docs/eleven-agents/customization/voice/expressive-mode
- Voice design best practices: https://elevenlabs.io/docs/eleven-agents/customization/voice/best-practices/conversational-voice-design
- Pronunciation dictionaries: https://elevenlabs.io/docs/eleven-agents/customization/voice/pronunciation-dictionary
- RAG latency: https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/rag
- Models (TTS latency): https://elevenlabs.io/docs/overview/models
- IP allowlisting / egress regions: https://elevenlabs.io/docs/eleven-api/resources/ip-allowlisting
- Data residency: https://elevenlabs.io/docs/overview/administration/data-residency
- Keyterm prompting (STT): https://elevenlabs.io/docs/eleven-api/guides/how-to/speech-to-text/batch/keyterm-prompting
- Agents pricing: https://elevenlabs.io/pricing/agents
- Orchestration engine blog: https://elevenlabs.io/blog/unpacking-elevenagents-orchestration-engine

Google:
- Gemini thinking control: https://ai.google.dev/gemini-api/docs/generate-content/thinking
- Implicit caching: https://ai.google.dev/gemini-api/docs/caching
- Calendar events.insert (client ids): https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- freebusy.query: https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query
- Calendar performance guide: https://developers.google.com/workspace/calendar/api/guides/performance

Cal.com:
- Reserve a slot: https://cal.com/docs/api-reference/v2/slots/reserve-a-slot
- Create booking: https://cal.com/docs/api-reference/v2/bookings/create-a-booking
- OAuth: https://cal.com/docs/api-reference/v2/oauth
- Reservation-vs-booking gap: https://github.com/calcom/cal.com/issues/23974

Microsoft:
- getSchedule: https://learn.microsoft.com/en-us/graph/api/calendar-getschedule
- event.transactionId: https://learn.microsoft.com/en-us/graph/api/resources/event
- JSON batching: https://learn.microsoft.com/en-us/graph/json-batching

Vercel / Supabase:
- Fluid compute: https://vercel.com/docs/fluid-compute
- Function regions: https://vercel.com/docs/functions/configuring-functions/region
- @vercel/functions (waitUntil, attachDatabasePool, Runtime Cache): https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package
- Supabase connections/pooling: https://supabase.com/docs/guides/database/connecting-to-postgres

Benchmarks (third party):
- Model TTFT: https://artificialanalysis.ai/models/gemini-2-5-flash , /gemini-2-5-flash-lite , /gemini-3-1-flash-lite-preview
- Voice platform latency: https://telnyx.com/resources/voice-ai-agents-compared-latency (Cekura data; methodology caveats apply)
