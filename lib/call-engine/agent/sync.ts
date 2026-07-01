import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { elevenClient } from "./eleven-client";
import {
  getAssistantSyncContext,
  setAssistantAgent,
  type AgentKbDoc,
  type Assistant,
} from "../../dashboard/db";
import { MAX_SOURCE_CHARS, type AssistantKnowledge } from "../../knowledge/sources";
import { SUPPORTED_LANGUAGES } from "../voice/phone-language";

// Sync a dashboard assistant to a managed ElevenLabs Conversational AI agent.
// The agent IS the caller-facing runtime (voice + LLM + turn-taking); we build
// it entirely from our DB settings — greeting, system prompt, voice, language,
// and knowledge — so the dashboard is the single source of truth. Called after
// an assistant is created or edited; deleteAssistantAgent tears it down.

// Agent LLM: Gemini flash, matching the backend enrichment model — low latency,
// multilingual, good enough for reception.
const AGENT_LLM = "gemini-2.5-flash";

// TTS models. flash_v2_5 is multilingual (one voice speaks the caller's
// language); flash_v2 is the English-only model. ElevenLabs enforces that an
// agent whose only language is English uses an English v2 model — so we make the
// agent multilingual by attaching "additional languages" (language presets),
// which lifts that restriction and lets the multilingual model + per-caller
// language override work. If that's ever rejected, we fall back to an
// English-only agent so the save still succeeds.
const TTS_MODEL_MULTILINGUAL = "eleven_flash_v2_5";
const TTS_MODEL_ENGLISH = "eleven_flash_v2";
const DEFAULT_GREETING = "Hello, thanks for calling. How can I help?";
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs "Rachel"
// Cap how many knowledge docs we push per agent so a runaway source list can't
// balloon the upload; mirrors the engine's MAX_SOURCES intent.
const MAX_KB_DOCS = 25;

/** ElevenLabs needs a concrete base language; our "multi"/"auto" auto-detect
 *  mode maps to English as the baseline, and the init webhook overrides the
 *  greeting + language per caller from their phone country code. */
function baseLanguage(code: string): string {
  const c = (code || "").toLowerCase().trim();
  if (!c || c === "multi" || c === "auto") return "en";
  return c.split("-")[0];
}

/** The agent's system prompt: business persona + the assistant's own
 *  instructions + light routing guidance. Knowledge lives in the attached
 *  knowledge base (retrieved on demand), so it isn't dumped here. */
function composeSystemPrompt(assistant: Assistant, businessName: string): string {
  const parts: string[] = [
    `You are the AI receptionist for ${businessName}. You answer inbound phone calls: be warm, concise, and natural, like a great front-desk person.`,
  ];
  const own = (assistant.system_prompt ?? "").trim();
  if (own) parts.push(own);

  const routing = (assistant.routing ?? {}) as { transferTo?: unknown };
  const transferTo = typeof routing.transferTo === "string" ? routing.transferTo : "";
  if (transferTo) {
    parts.push(
      `If the caller needs a human or asks to be transferred, transfer the call to ${transferTo}.`,
    );
  }

  parts.push(
    "Use the knowledge base to answer questions about the business. If you don't know something, say so honestly and offer to take a message.",
  );
  return parts.join("\n\n");
}

/**
 * Upload the assistant's knowledge (free-text notes + ingested sources) as
 * ElevenLabs knowledge-base text documents and return both the tracking records
 * and the locators to attach to the agent. Each doc is best-effort: one failed
 * upload is logged and skipped, never aborting the whole sync.
 */
async function uploadKnowledge(
  assistant: Assistant,
  knowledge: AssistantKnowledge,
): Promise<{ docs: AgentKbDoc[]; locators: ElevenLabs.KnowledgeBaseLocator[] }> {
  const client = elevenClient();
  const docs: AgentKbDoc[] = [];
  const locators: ElevenLabs.KnowledgeBaseLocator[] = [];

  const items: { name: string; text: string }[] = [];
  const notes = (knowledge.notes ?? "").trim();
  if (notes) items.push({ name: `${assistant.name} — Notes`, text: notes });
  for (const src of knowledge.sources ?? []) {
    const text = (src.markdown ?? "").trim();
    if (!text) continue;
    items.push({ name: src.title || "Source", text: text.slice(0, MAX_SOURCE_CHARS) });
  }

  for (const item of items.slice(0, MAX_KB_DOCS)) {
    try {
      const doc = await client.conversationalAi.knowledgeBase.documents.createFromText({
        text: item.text,
        name: item.name,
      });
      docs.push({ id: doc.id, name: doc.name });
      locators.push({ type: "text", id: doc.id, name: doc.name, usageMode: "auto" });
    } catch (err) {
      console.error("[agent-sync] knowledge upload failed", item.name, err);
    }
  }

  return { docs, locators };
}

/** Delete knowledge-base docs we previously uploaded for an assistant. Best-
 *  effort: force-detaches from any agent and ignores already-gone docs. */
async function deleteKnowledge(docs: AgentKbDoc[]): Promise<void> {
  const client = elevenClient();
  for (const doc of docs) {
    try {
      await client.conversationalAi.knowledgeBase.documents.delete(doc.id, { force: true });
    } catch (err) {
      console.error("[agent-sync] knowledge delete failed", doc.id, err);
    }
  }
}

/**
 * Create or update the managed ElevenLabs agent for an assistant from its
 * current DB settings, and record the agent id + uploaded knowledge on the row.
 * Returns the agent id, or null when the assistant no longer exists.
 *
 * Enables per-conversation overrides (first_message / language / prompt / voice)
 * so the conversation-initiation webhook (/api/agent/init) can greet each caller
 * in their own language before overrides are ignored on a locked-down agent.
 */
/** True for ElevenLabs' "English Agents must use turbo or flash v2" family of
 *  400s — the only case we retry with an English-only config. The message can
 *  arrive on the error itself or in its response body, so check both. */
function isModelLanguageError(err: unknown): boolean {
  const e = err as { message?: unknown; body?: unknown };
  let text = typeof e.message === "string" ? e.message : "";
  try {
    text += ` ${JSON.stringify(e.body ?? "")}`;
  } catch {
    // non-serialisable body — message check still applies
  }
  return /English Agents must use|turbo or flash v2/i.test(text);
}

export async function syncAssistantAgent(assistantId: string): Promise<string | null> {
  const ctx = await getAssistantSyncContext(assistantId);
  if (!ctx) return null;
  const { assistant, businessName, knowledge } = ctx;
  const client = elevenClient();

  const { docs, locators } = await uploadKnowledge(assistant, knowledge);

  const language = baseLanguage(assistant.language);
  const firstMessage = (assistant.greeting ?? "").trim() || DEFAULT_GREETING;
  const systemPrompt = composeSystemPrompt(assistant, businessName);
  const voiceId = (assistant.voice_id ?? "").trim() || DEFAULT_VOICE_ID;

  // Additional languages: every language we can greet a caller in, except the
  // base. Their presence makes the agent multilingual — which is what lets it use
  // the multilingual model AND accept the per-caller language override.
  const extraLanguages = SUPPORTED_LANGUAGES.filter((l) => l !== language);
  const languagePresets: Record<string, ElevenLabs.LanguagePresetOutput> = {};
  for (const l of extraLanguages) languagePresets[l] = { overrides: {} };

  const multilingualConfig: ElevenLabs.ConversationalConfig = {
    agent: {
      firstMessage,
      language,
      prompt: { prompt: systemPrompt, llm: AGENT_LLM, knowledgeBase: locators },
    },
    tts: { voiceId, modelId: TTS_MODEL_MULTILINGUAL },
    languagePresets,
  };

  // Fallback if ElevenLabs rejects the multilingual config (e.g. an English-only
  // account/model policy): a plain English agent so the save still succeeds.
  const englishConfig: ElevenLabs.ConversationalConfig = {
    agent: {
      firstMessage,
      language: "en",
      prompt: { prompt: systemPrompt, llm: AGENT_LLM, knowledgeBase: locators },
    },
    tts: { voiceId, modelId: TTS_MODEL_ENGLISH },
  };

  // Whitelist the fields the init webhook is allowed to override per call, and
  // turn on webhook-sourced initiation data. Without this the agent ignores our
  // greeting/language/voice overrides and speaks its baked-in defaults.
  const platformSettings: ElevenLabs.AgentPlatformSettingsRequestModel = {
    overrides: {
      enableConversationInitiationClientDataFromWebhook: true,
      conversationConfigOverride: {
        agent: { firstMessage: true, language: true, prompt: { prompt: true } },
        tts: { voiceId: true },
      },
    },
  };

  // Create or update with the given config; returns the (existing or new) id.
  const write = async (config: ElevenLabs.ConversationalConfig): Promise<string> => {
    if (assistant.elevenlabs_agent_id) {
      await client.conversationalAi.agents.update(assistant.elevenlabs_agent_id, {
        name: assistant.name,
        conversationConfig: config,
        platformSettings,
      });
      return assistant.elevenlabs_agent_id;
    }
    const created = await client.conversationalAi.agents.create({
      name: assistant.name,
      conversationConfig: config,
      platformSettings,
      tags: ["aireceptionistnow"],
    });
    return created.agentId;
  };

  let agentId: string;
  try {
    try {
      agentId = await write(multilingualConfig);
    } catch (err) {
      // Only fall back on the known model/language validation error — anything
      // else (auth, quota, bad voice) should surface as-is.
      if (!isModelLanguageError(err)) throw err;
      console.warn("[agent-sync] multilingual config rejected, falling back to English", err);
      agentId = await write(englishConfig);
    }
  } catch (err) {
    // Roll back the just-uploaded docs so a failed create/update doesn't orphan
    // knowledge base entries, then surface the error to the caller.
    await deleteKnowledge(docs);
    throw err;
  }

  // Agent is now pointed at the fresh docs — safe to remove the previous set.
  const stale = assistant.elevenlabs_kb ?? [];
  if (stale.length) await deleteKnowledge(stale);

  await setAssistantAgent(assistantId, agentId, docs);
  return agentId;
}

/**
 * Delete the managed ElevenLabs agent and its uploaded knowledge for an
 * assistant. Best-effort — called when the assistant is deleted; a failure here
 * must not block the delete, so callers should catch.
 */
export async function deleteAssistantAgent(assistant: {
  elevenlabs_agent_id: string | null;
  elevenlabs_kb?: AgentKbDoc[];
}): Promise<void> {
  const client = elevenClient();
  if (assistant.elevenlabs_agent_id) {
    try {
      await client.conversationalAi.agents.delete(assistant.elevenlabs_agent_id);
    } catch (err) {
      console.error("[agent-sync] agent delete failed", assistant.elevenlabs_agent_id, err);
    }
  }
  if (assistant.elevenlabs_kb?.length) await deleteKnowledge(assistant.elevenlabs_kb);
}
