import { z } from "zod";
import type { ActionContext } from "../actions";
import { getRepository } from "../persistence/supabase";
import type { NumberConfig } from "../types";

// Shared plumbing for the tier-A tool webhooks: authenticate, parse the fields
// every tool carries, resolve the dialed number to its assistant config, and
// ensure a call row exists (keyed by the ElevenLabs conversation id). Each tool
// route then just runs its action - the same actions tier B runs.

/** Fields every ElevenLabs server tool must send, sourced from ElevenLabs system
 *  dynamic variables: {{system__called_number}}, {{system__caller_id}},
 *  {{system__conversation_id}}. Tool-specific params are read separately. */
export const AgentCallFields = z.object({
  to_number: z.string().min(1, "to_number (the dialed business number) is required"),
  from_number: z.string().default(""),
  conversation_id: z.string().min(1, "conversation_id is required"),
});

export type AgentCallFields = z.infer<typeof AgentCallFields>;

// Both lookups repeat identically on every tool call while the caller waits
// mid-sentence for the agent's reply: the number config is effectively static
// for the duration of a call, and the call-row id is immutable per conversation.
// Cache them per warm instance so the 2nd+ tool call in a conversation skips
// 3-6 DB round trips of dead air.
// ponytail: config edits take up to CONFIG_TTL_MS to reach an in-flight call.
const CONFIG_TTL_MS = 30_000;
const configCache = new Map<string, { at: number; p: Promise<NumberConfig | null> }>();
const callIdCache = new Map<string, string>(); // conversation_id -> call row id

function cachedConfig(to: string): Promise<NumberConfig | null> {
  const hit = configCache.get(to);
  if (hit && Date.now() - hit.at < CONFIG_TTL_MS) return hit.p;
  const repo = getRepository();
  const p = repo.resolveInboundNumber(to);
  // A failed lookup must not poison the cache - drop it so the next call retries.
  p.catch(() => configCache.delete(to));
  configCache.set(to, { at: Date.now(), p });
  if (configCache.size > 500) {
    configCache.delete(configCache.keys().next().value as string);
  }
  return p;
}

/**
 * Resolve the assistant config for the dialed number and get/create the call
 * row for this conversation. Returns the ActionContext the shared actions need,
 * or null when the number is unknown/disabled.
 */
export async function resolveAgentContext(
  fields: AgentCallFields,
): Promise<ActionContext | null> {
  const config = await cachedConfig(fields.to_number);
  if (!config) return null;

  // Key by tenant too: getOrCreateAgentCall rejects a conversation id that
  // resurfaces under a different business (a reused/forged id). A conversation-
  // only cache key would let a warm-instance hit skip that guard and splice one
  // tenant's callId onto another's config - so a cross-tenant reuse must miss
  // the cache and fall through to the guarded lookup.
  const cacheKey = `${fields.conversation_id}:${config.businessId}`;
  let callId = callIdCache.get(cacheKey);
  if (!callId) {
    callId = await getRepository().getOrCreateAgentCall({
      conversationId: fields.conversation_id,
      businessId: config.businessId,
      numberId: config.numberId,
      from: fields.from_number,
      to: fields.to_number,
    });
    callIdCache.set(cacheKey, callId);
    if (callIdCache.size > 1000) {
      callIdCache.delete(callIdCache.keys().next().value as string);
    }
  }

  return { callId, config, from: fields.from_number, to: fields.to_number };
}
