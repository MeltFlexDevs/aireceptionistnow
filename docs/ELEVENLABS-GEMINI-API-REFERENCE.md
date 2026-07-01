# ElevenLabs Agents + Gemini — API Reference

The core of this project. ElevenLabs **Agents** (formerly Conversational AI) is the call runtime — it orchestrates STT + LLM + TTS + turn-taking on the ElevenLabs side. **Gemini** is the LLM "brain" (selected inside the agent as the LLM, and used off-call for summaries/greeting localization).

This file is the **API knowledge base**. For how *this project* wires it, see [`ELEVENLABS-AGENT.md`](./ELEVENLABS-AGENT.md) and [`VOICE-AI-ARCHITECTURE.md`](./VOICE-AI-ARCHITECTURE.md).

> **Accuracy note.** Model IDs, pricing, and some endpoint paths change often. Anything tagged **[verify]** should be confirmed against the live docs or the agent's LLM dropdown before you hardcode it. Docs root: <https://elevenlabs.io/docs/eleven-agents/overview>. Machine-readable full dump for scraping: `https://elevenlabs.io/docs/llms-full.txt` (index: `https://elevenlabs.io/docs/llms.txt`).

---

## 1. What ElevenLabs Agents is

A hosted orchestration platform that combines four systems into a real-time voice/text agent:

| Component | Role | Default in this stack |
|---|---|---|
| **ASR / Speech-to-Text** | transcribe caller audio | `scribe_realtime`, quality `high` |
| **LLM** | the "brain" — decides replies, calls tools | **Gemini** (default `gemini-2.5-flash`) |
| **TTS / Text-to-Speech** | speak replies, 5k+ voices / 31+ languages | `eleven_flash_v2` |
| **Turn-taking model** | timing, interruption, who-speaks-when | `turn_v3` |

Plus built-in: knowledge base + RAG, tools/function calling, interruption handling, multimodality (voice **and/or** text), monitoring/analytics, A/B experiments.

**Three ways to manage agents:** the dashboard (visual builder), the **REST API**, or the **Agents CLI** (`@elevenlabs/cli`).

---

## 2. Authentication & base URLs

- **Header:** `xi-api-key: <YOUR_API_KEY>` on every REST call. Create keys in dashboard → Settings.
- **Env convention (this repo):** `ELEVENLABS_API_KEY`.

**Base URLs** (data residency):

| Region | Base |
|---|---|
| Global | `https://api.elevenlabs.io` |
| US | `https://api.us.elevenlabs.io` |
| EU | `https://api.eu.residency.elevenlabs.io` |
| India | `https://api.in.residency.elevenlabs.io` |
| Singapore | `https://api.sg.residency.elevenlabs.io` |

> EU data residency restricts which LLMs are available (older Gemini models may be unavailable). **[verify]** per region.

---

## 3. Agents REST API

All under `/v1/convai/agents`.

| Action | Method + path |
|---|---|
| Create | `POST /v1/convai/agents/create` |
| Get | `GET /v1/convai/agents/{agent_id}` |
| Update | `PATCH /v1/convai/agents/{agent_id}` |
| List | `GET /v1/convai/agents` |
| Delete | `DELETE /v1/convai/agents/{agent_id}` |

> Agents are versioned automatically; the old `enable_versioning` query param is deprecated.

### 3.1 `conversation_config` schema (create/update body)

This is the whole agent definition. Defaults shown are the API defaults.

```yaml
conversation_config:
  text_only: false                 # voice+text vs text-only
  max_duration_seconds: 600
  client_events: [ ... ]           # events streamed to clients (transcripts, audio, etc.)
  monitoring_enabled: false
  background_sound: <BackgroundSoundConfig>

  agent:
    first_message: "Hi, this is Alexis from <company>. How can I help?"
    language: "en"
    max_conversation_duration_message: "..."
    prompt:
      prompt: "<system prompt>"
      llm: gemini-2.5-flash        # <-- the brain (default)
      temperature: 0.5             # 0.0–1.0
      max_tokens: -1               # -1 = model default
      tool_ids: ["..."]            # server/client tools attached
      knowledge_base:              # RAG grounding docs
        - { type: file|url|text, name: "...", id: "<doc_id>", usage_mode: auto }

  tts:
    model_id: eleven_flash_v2
    voice_id: cjVigY5qzO86Huf0OWal
    stability: 0.5
    speed: 1
    similarity_boost: 0.8
    agent_output_audio_format: pcm_16000
    expressive_mode: true

  asr:
    quality: high
    provider: scribe_realtime
    user_input_audio_format: pcm_16000
    keywords: ["...", "..."]       # bias transcription toward domain terms

  turn:
    turn_timeout: 7                # secs of silence before agent speaks
    silence_end_call_timeout: -1   # -1 = disabled
    turn_eagerness: normal
    turn_model: turn_v3
```

### 3.2 Create agent — SDK examples

**Python** (`pip install elevenlabs python-dotenv`):

```python
from elevenlabs.client import ElevenLabs
import os

elevenlabs = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

response = elevenlabs.conversational_ai.agents.create(
    name="My voice agent",
    tags=["test"],
    conversation_config={
        "tts": {"voice_id": "aMSt68OGf4xUZAnLpTU8", "model_id": "eleven_flash_v2"},
        "agent": {
            "first_message": "Hi, this is Rachel from [Company] support. How can I help you today?",
            "prompt": {
                "prompt": "You are a friendly virtual assistant for [Company]...",
                "llm": "gemini-2.5-flash",
            },
        },
    },
)
print("Agent created with ID:", response.agent_id)
```

**TypeScript** (`npm install @elevenlabs/elevenlabs-js dotenv`):

```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";

const elevenlabs = new ElevenLabsClient(); // reads ELEVENLABS_API_KEY

const agent = await elevenlabs.conversationalAi.agents.create({
  name: "My voice agent",
  tags: ["test"],
  conversationConfig: {
    tts: { voiceId: "aMSt68OGf4xUZAnLpTU8", modelId: "eleven_flash_v2" },
    agent: {
      firstMessage: "Hi, this is Rachel from [Company] support. How can I help you today?",
      prompt: { prompt: "You are a friendly virtual assistant...", llm: "gemini-2.5-flash" },
    },
  },
});
console.log(`Agent created with ID: ${agent.agentId}`);
```

**CLI:**

```bash
npm install -g @elevenlabs/cli
elevenlabs auth login
elevenlabs agents init
elevenlabs agents add "My Assistant" --template assistant
elevenlabs agents push --agent "My Assistant"
elevenlabs agents widget "My Assistant"   # prints embed HTML
```

---

## 4. LLM selection (the Gemini brain)

The LLM is set at `agent.prompt.llm`. **Default: `gemini-2.5-flash`** (verified from the create-agent schema — fast TTFT, good instruction-following, reliable function calling → the recommended receptionist brain).

**Provider families available** (subset — **[verify]** the live dropdown; list changes fast):

- **Google Gemini:** `gemini-2.5-flash`, `gemini-2.5-flash-lite`, and newer Flash/Pro/Flash-Lite preview tiers.
- **OpenAI:** GPT-4o / 4o-mini, GPT-4.1 family, and newer GPT-5 tiers.
- **Anthropic:** Claude Haiku / Sonnet / Opus tiers.
- **ElevenLabs-hosted** open models (Qwen tiers).
- **Custom LLM** (your own endpoint — see §5).

### LLM parameters

| Param | Range / values | Notes |
|---|---|---|
| `temperature` | 0.0–1.0 | lower = focused/consistent; higher = creative |
| `max_tokens` | int / -1 | cap on output; -1 = model default |
| **Thinking budget** | Disabled / Low / Medium / High | Gemini reasoning-token control |
| **Reasoning effort** | None / Low / Medium / High | recommend **None** for real-time voice |
| **Backup LLM** | Default / Custom cascade / Disabled | failover if primary errors |

**Model choice for a receptionist:** favor a Flash-tier model for latency (real-time voice needs low TTFT). Reserve larger models for hard reasoning tasks. Pricing is USD per 1M tokens, input/output billed separately, cache read/write extra.

---

## 5. Custom LLM (bring-your-own / Gemini direct)

Connect the agent to any **OpenAI-compatible** server instead of a built-in model.

**Two accepted formats:**
1. Chat Completions — `POST /v1/chat/completions`
2. Responses API — `POST /v1/responses` (newer)

**Streaming requirement:** respond as SSE, `Content-Type: text/event-stream`, chunks `data: {json}\n\n`, terminated by `data: [DONE]\n\n`.

**Dashboard config:** LLM dropdown → **Custom LLM** → set **Server URL** + **Model ID** → store the key as a secret (e.g. `OPENAI_API_KEY`) → publish.

**Request shape ElevenLabs sends:**

```json
{
  "messages": [{ "role": "system", "content": "..." }],
  "model": "your-model",
  "temperature": 0.7,
  "max_tokens": 5000,
  "stream": true,
  "elevenlabs_extra_body": { "custom_param": "value" }
}
```

**Minimal SSE server (Chat Completions):**

```python
async def event_stream():
    async for chunk in completion_stream:
        yield f"data: {json.dumps(chunk.model_dump())}\n\n"
    yield "data: [DONE]\n\n"
```

### 5.1 Gemini as a custom LLM (OpenAI-compat passthrough)

Gemini exposes an **OpenAI-compatible** endpoint, so you can point the custom-LLM Server URL at it directly:

- **Server URL:** `https://generativelanguage.googleapis.com/v1beta/openai/`
- **Model ID:** `gemini-2.5-flash` (or newer **[verify]**)
- **API key secret:** your `GEMINI_API_KEY`

> Prefer the built-in Gemini option (§4) for normal use — it's fully managed. Use custom-LLM only when you need your own key/quota, a Gemini tier not in the dropdown, or a wrapper that adds retrieval/guardrails.

---

## 6. Tools (function calling)

Tools let the agent act mid-conversation. Attach via `tool_ids` on the prompt. Four types:

1. **System tools** — built-in call-control (below).
2. **Server / Webhook tools** — call your HTTP API.
3. **Client tools** — run in the client app (browser/mobile).
4. **MCP servers** — Model Context Protocol tool providers.

### 6.1 System tools — critical for a receptionist

| Tool | Purpose | Key params |
|---|---|---|
| `end_call` | hang up when task done / caller asks | `reason` (req), `message` (optional farewell) |
| `language_detection` | switch agent language mid-call | `reason` (req), `language` (ISO code, req) |
| `transfer_to_agent` | hand off to another AI agent (billing/tech/…) | `reason`, `agent_number` (0-indexed, req) |
| `transfer_to_number` | **escalate to a human** via phone/SIP | `reason`, `transfer_number` (req), `client_message`, `agent_message` |
| `skip_turn` | stay silent, let caller think | `reason` |
| `play_keypad_touch_tone` | send DTMF (navigate IVRs, PINs) | `reason`, `dtmf_tones` (`0-9 * # w W`) |
| `voicemail_detection` | detect voicemail, act accordingly | `reason` (req) |

```python
from elevenlabs import ElevenLabs
from elevenlabs import PromptAgentInputToolsItem_System

client = ElevenLabs(api_key="YOUR_API_KEY")

tools = [
    PromptAgentInputToolsItem_System(name="end_call"),
    PromptAgentInputToolsItem_System(name="language_detection"),
    PromptAgentInputToolsItem_System(name="transfer_to_number"),
    PromptAgentInputToolsItem_System(name="voicemail_detection"),
]

agent = client.conversational_ai.agents.create(
    conversation_config={"agent": {"prompt": {"tools": tools}}}
)
```

### 6.2 Server / Webhook tools

A webhook tool = name + description + HTTP request template. The LLM decides when to call it and fills the parameters. Config carries: `url`, `method`, `headers` (secrets supported), and path/query/body param schemas. Dynamic variables (§8) can be injected into params/headers.

This project's pattern (see `ELEVENLABS-AGENT.md`): `POST` to `${APP_BASE_URL}/api/agent/*` with `x-agent-secret` header, and every tool forwards the shared 3 (`to_number`, `from_number`, `conversation_id`) via system dynamic variables.

> The `/tools/server-tools` and `/tools/system-tools` doc pages moved/404'd at capture time — **[verify]** exact current paths and the full JSON param schema against `llms-full.txt`.

---

## 7. Knowledge base + RAG

Ground the agent in your content.

- **Input types:** files (PDF, TXT, DOCX, HTML, EPUB — ≤21MB each), URLs, raw text.
- **Limits:** standard accounts ~20MB / ~300k chars; enterprise higher. No recursive link crawling or auto-refresh.
- **SDK:** `create_from_text()`, `create_from_url()`, `create_from_file()` → returns a doc id.
- **Attach** by adding to `agent.prompt.knowledge_base`:

```json
{ "type": "file", "name": "handbook", "id": "<document-id>", "usage_mode": "auto" }
```

---

## 8. Dynamic variables

Personalize prompt / first message / tool params per conversation. Syntax: `{{variable_name}}`.

**System variables** (auto-provided):

| Variable | Meaning |
|---|---|
| `system__caller_id` | caller phone number (voice) |
| `system__called_number` | dialed number (voice) |
| `system__time_utc` | current UTC time (ISO) |
| `system__time` | current local time, human-readable |
| `system__conversation_id` | unique conversation id |
| `system__call_duration_secs` | elapsed call time |
| `system__agent_turns` | agent turn count |
| `system__is_text_only` | text-only mode flag |
| `system__conversation_history` | JSON of history so far |

**Pass custom vars at session start:**

```python
# Python
config = ConversationInitiationData(dynamic_variables={"user_name": "Angelo"})
conversation = Conversation(elevenlabs, agent_id, config=config,
                            audio_interface=DefaultAudioInterface())
```

```javascript
// JS
this.conversation = await Conversation.startSession({
  agentId: "agent_...",
  dynamicVariables: { user_name: "Angelo" },
});
```

```html
<!-- Widget -->
<elevenlabs-convai agent-id="agent_..."
  dynamic-variables='{"user_name":"John","account_type":"premium"}'>
</elevenlabs-convai>
```

Reference them anywhere in the prompt/first message as `{{user_name}}`.

---

## 9. Overrides & personalization

Per-conversation **overrides** (must be enabled on the agent first): `first_message`, `language`, `voice_id`, `prompt`. Combined with the **conversation-initiation webhook**, this lets you greet each caller in their own language before they speak (this project's `/api/agent/init` flow).

---

## 10. Real-time conversation — WebSocket & signed URL

For a custom client (not the widget/telephony):

- **Public agent:** `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=<id>` **[verify]**
- **Private agent:** first mint a short-lived signed URL, then connect to it:
  `GET /v1/convai/conversation/get-signed-url?agent_id=<id>` → `{ "signed_url": "wss://..." }` **[verify]**

The socket streams events (user transcript, agent response, audio chunks, tool calls, interruptions) per the `client_events` config. Prefer the official SDKs, which wrap this protocol.

---

## 11. Telephony (receptionist path)

- **Native Twilio** integration and **SIP trunking** are both supported; assign an agent as a number's **inbound agent** (dashboard "Connect number", or API).
- **Outbound / batch calls:** trigger calls via API (e.g. Twilio outbound-call endpoint) — **[verify]** exact path against the phone-numbers API section.
- Combine with `transfer_to_number` (human handoff), `voicemail_detection`, and `play_keypad_touch_tone` for full call control.

> The `/phone-numbers/twilio` page 404'd at capture time. See this repo's [`TWILIO-NUMBERS.md`](./TWILIO-NUMBERS.md) and [`A2P-10DLC.md`](./A2P-10DLC.md) for the project's number provisioning + compliance flow.

---

## 12. Webhooks

Two workspace/agent webhooks used here:

1. **Conversation-initiation (client-data)** — fires at call start; you return `first_message` / `language` / `voice_id` / `prompt` overrides. Used for per-caller language greeting.
2. **Post-call transcription** — fires at call end with transcript + analysis + metadata; store it, run summaries.

**Signature verification:** ElevenLabs signs webhook requests with an HMAC. Verify using the workspace **signing secret** (`ELEVENLABS_WEBHOOK_SECRET` in this repo). The signature header carries a timestamp + hash (`t=...,v0=...` style) — recompute HMAC-SHA256 over `timestamp.body` and constant-time compare. **[verify]** exact header name/format against the current post-call-webhooks page (it 404'd at capture time).

---

## 13. Clients & SDKs

| Surface | Package / snippet |
|---|---|
| Python | `pip install elevenlabs` |
| Node/TS | `npm install @elevenlabs/elevenlabs-js` |
| React | React SDK + shadcn UI components |
| React Native | cross-platform SDK |
| iOS | Swift SDK |
| Android | Kotlin SDK |
| Web widget | `<elevenlabs-convai agent-id="...">` + `unpkg` embed script |
| CLI | `npm i -g @elevenlabs/cli` |

**Widget embed:**

```html
<elevenlabs-convai agent-id="agent-id"></elevenlabs-convai>
<script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
```

---

## 14. Gemini API (standalone reference)

Used off the call path here (post-call summary, greeting localization) and available as the on-call brain. Get a key at <https://aistudio.google.com/apikey>. Env: `GEMINI_API_KEY`.

### 14.1 OpenAI-compatible endpoint (most portable)

```python
from openai import OpenAI

client = OpenAI(
    api_key="GEMINI_API_KEY",
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

resp = client.chat.completions.create(
    model="gemini-2.5-flash",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain how AI works"},
    ],
)
print(resp.choices[0].message)
```

Streaming: add `stream=True` and iterate `chunk.choices[0].delta`. **Only 3 things differ from OpenAI:** api_key, base_url, model.

### 14.2 Native Google GenAI SDK

```python
from google import genai

client = genai.Client()  # reads GEMINI_API_KEY
resp = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain how AI works in a few words",
)
print(resp.text)
```

- **Auth header (REST):** `x-goog-api-key: $GEMINI_API_KEY`.
- **Native REST:** `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` (and `:streamGenerateContent` for streaming). **[verify]** — Google is promoting a newer **Interactions API** (`/v1beta/interactions`, `client.interactions.create(...)`) for new projects; confirm which your SDK version targets.
- **Capabilities:** function calling, system instructions, streaming, structured output, plus built-in tools (Google Search, code execution, URL context).

### 14.3 Models (Gemini)

| Model | Use |
|---|---|
| `gemini-2.5-flash` | fast, low-cost — **receptionist default** |
| `gemini-2.5-flash-lite` | cheapest, high-volume |
| Flash/Pro preview tiers | newer, higher capability **[verify]** |

Pricing is per 1M tokens, input/output separate, caching billed separately.

---

## 15. Receptionist blueprint (how it composes)

```
Inbound call
  → ElevenLabs number → conversation-init webhook (/api/agent/init)
      returns first_message + language + voice override (Gemini-localized greeting)
  → Agent runs: scribe_realtime ASR → gemini-2.5-flash brain → eleven_flash_v2 TTS, turn_v3
      brain calls server tools mid-call:
        check_availability / book_appointment / take_message  (→ /api/agent/*)
      system tools handle control:
        transfer_to_number (human), voicemail_detection, end_call, language_detection
  → Call ends → post-call webhook (/api/agent/post-call)
      store transcript → Gemini summary → deliver
```

Design rules:
- **Latency first** on-call: Flash-tier LLM, reasoning effort **None**, concise prompt.
- **Ground** answers in the knowledge base; keep replies to a couple of sentences.
- **Escalate** to a human with `transfer_to_number` when the task exceeds the agent.
- **Personalize** with dynamic variables (`system__caller_id`, `system__called_number`).
- **Secure** every webhook: HMAC-verify ElevenLabs signatures; secret-header the tool endpoints.

---

## Sources

- [ElevenAgents overview](https://elevenlabs.io/docs/eleven-agents/overview)
- [Quickstart](https://elevenlabs.io/docs/agents-platform/quickstart)
- [LLM models](https://elevenlabs.io/docs/eleven-agents/customization/llm) · [Custom LLM](https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm)
- [Create Agent API](https://elevenlabs.io/docs/api-reference/agents/create)
- [System tools](https://elevenlabs.io/docs/eleven-agents/customization/tools) · [Dynamic variables](https://elevenlabs.io/docs/eleven-agents/customization/personalization/dynamic-variables)
- [Gemini API docs](https://ai.google.dev/gemini-api/docs) · [Gemini OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai)
- Full machine-readable dump: `https://elevenlabs.io/docs/llms-full.txt`
