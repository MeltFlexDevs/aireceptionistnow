import type { ElevenLabs } from "@elevenlabs/elevenlabs-js";
import { elevenClient } from "./eleven-client";
import {
  getAssistantSyncContext,
  setAssistantAgent,
  type AgentKbDoc,
  type Assistant,
} from "../../dashboard/db";
import { MAX_SOURCE_CHARS, type AssistantKnowledge } from "../../knowledge/sources";

// Sync a dashboard assistant to a managed ElevenLabs Conversational AI agent.
// The agent IS the caller-facing runtime (voice + LLM + turn-taking); we build
// it entirely from our DB settings — greeting, system prompt, voice, language,
// and knowledge — so the dashboard is the single source of truth. Called after
// an assistant is created or edited; deleteAssistantAgent tears it down.

// Agent LLM: Gemini flash, matching the backend enrichment model — low latency,
// multilingual, good enough for reception. TTS: the multilingual flash model so
// one voice can speak the caller's language (the init webhook localizes greeting
// + swaps to a native voice per caller country).
const AGENT_LLM = "gemini-2.5-flash";
const TTS_MODEL = "eleven_flash_v2_5";
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
export async function syncAssistantAgent(assistantId: string): Promise<string | null> {
  const ctx = await getAssistantSyncContext(assistantId);
  if (!ctx) return null;
  const { assistant, businessName, knowledge } = ctx;
  const client = elevenClient();

  const { docs, locators } = await uploadKnowledge(assistant, knowledge);

  const conversationConfig: ElevenLabs.ConversationalConfig = {
    agent: {
      firstMessage: (assistant.greeting ?? "").trim() || DEFAULT_GREETING,
      language: baseLanguage(assistant.language),
      prompt: {
        prompt: composeSystemPrompt(assistant, businessName),
        llm: AGENT_LLM,
        knowledgeBase: locators,
      },
    },
    tts: {
      voiceId: (assistant.voice_id ?? "").trim() || DEFAULT_VOICE_ID,
      modelId: TTS_MODEL,
    },
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

  let agentId = assistant.elevenlabs_agent_id;
  try {
    if (agentId) {
      await client.conversationalAi.agents.update(agentId, {
        name: assistant.name,
        conversationConfig,
        platformSettings,
      });
    } else {
      const created = await client.conversationalAi.agents.create({
        name: assistant.name,
        conversationConfig,
        platformSettings,
        tags: ["aireceptionistnow"],
      });
      agentId = created.agentId;
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
