import { z } from "zod";
import type { ActionContext } from "../actions";
import { getRepository } from "../persistence/supabase";
import type { NumberConfig } from "../types";

export const AgentCallFields = z.object({
  to_number: z.string().min(1, "to_number (the dialed business number) is required"),
  from_number: z.string().default(""),
  conversation_id: z.string().min(1, "conversation_id is required"),
});

export type AgentCallFields = z.infer<typeof AgentCallFields>;

// Long enough that a typical call never re-resolves mid-conversation; short
// enough that dashboard edits (new calendar, greeting) reach live calls fast.
const CONFIG_TTL_MS = 2 * 60_000;
const configCache = new Map<string, { at: number; p: Promise<NumberConfig | null> }>();
const callIdCache = new Map<string, string>(); // conversation_id -> call row id

// maxAgeMs lets callers demand fresher data than the default TTL - the
// call-start webhook uses a short window so a just-saved greeting is spoken.
export function cachedConfig(to: string, maxAgeMs: number = CONFIG_TTL_MS): Promise<NumberConfig | null> {
  const hit = configCache.get(to);
  if (hit && Date.now() - hit.at < Math.min(maxAgeMs, CONFIG_TTL_MS)) return hit.p;
  const repo = getRepository();
  const p = repo.resolveInboundNumber(to);
  // A failed lookup must not poison the cache - drop it so the next call
  // retries. Only evict our own entry: a newer refresh may already sit there.
  p.catch(() => {
    if (configCache.get(to)?.p === p) configCache.delete(to);
  });
  configCache.set(to, { at: Date.now(), p });
  if (configCache.size > 500) {
    configCache.delete(configCache.keys().next().value as string);
  }
  return p;
}

export async function resolveAgentContext(
  fields: AgentCallFields,
): Promise<ActionContext | null> {
  const cacheKey = fields.conversation_id;
  const cachedId = callIdCache.get(cacheKey);
  // The call-row lookup needs nothing from the config - run the two together.
  // The caller is on the line, so every serial round trip here is audible.
  const [config, foundId] = await Promise.all([
    cachedConfig(fields.to_number),
    cachedId
      ? Promise.resolve(cachedId)
      : getRepository()
          .findAgentCallId(fields.conversation_id)
          .catch(() => null),
  ]);
  if (!config) return null;

  let callId = foundId;
  if (!callId) {
    callId = await getRepository().createAgentCall({
      conversationId: fields.conversation_id,
      numberId: config.numberId,
      from: fields.from_number,
      to: fields.to_number,
    });
  }
  if (!cachedId) {
    callIdCache.set(cacheKey, callId);
    if (callIdCache.size > 1000) {
      callIdCache.delete(callIdCache.keys().next().value as string);
    }
  }

  return { callId, config, from: fields.from_number, to: fields.to_number };
}
