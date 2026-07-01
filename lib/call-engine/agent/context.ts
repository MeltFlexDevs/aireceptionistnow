import { z } from "zod";
import type { ActionContext } from "../actions";
import { getRepository } from "../persistence/supabase";

// Shared plumbing for the tier-A tool webhooks: authenticate, parse the fields
// every tool carries, resolve the dialed number to its assistant config, and
// ensure a call row exists (keyed by the ElevenLabs conversation id). Each tool
// route then just runs its action — the same actions tier B runs.

/** Fields every ElevenLabs server tool must send, sourced from ElevenLabs system
 *  dynamic variables: {{system__called_number}}, {{system__caller_id}},
 *  {{system__conversation_id}}. Tool-specific params are read separately. */
export const AgentCallFields = z.object({
  to_number: z.string().min(1, "to_number (the dialed business number) is required"),
  from_number: z.string().default(""),
  conversation_id: z.string().min(1, "conversation_id is required"),
});

export type AgentCallFields = z.infer<typeof AgentCallFields>;

/**
 * Resolve the assistant config for the dialed number and get/create the call
 * row for this conversation. Returns the ActionContext the shared actions need,
 * or null when the number is unknown/disabled.
 */
export async function resolveAgentContext(
  fields: AgentCallFields,
): Promise<ActionContext | null> {
  const repo = getRepository();
  const config = await repo.resolveInboundNumber(fields.to_number);
  if (!config) return null;

  const callId = await repo.getOrCreateAgentCall({
    conversationId: fields.conversation_id,
    businessId: config.businessId,
    numberId: config.numberId,
    from: fields.from_number,
    to: fields.to_number,
  });

  return { callId, config, from: fields.from_number, to: fields.to_number };
}
