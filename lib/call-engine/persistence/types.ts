import type {
  CallAction,
  CallStatus,
  CallSummary,
  NumberConfig,
  TranscriptTurn,
} from "../types";

export interface CreateCallInput {
  businessId: string;
  numberId: string;
  callSid: string;
  from: string;
  to: string;
}

/** A tier-A (ElevenLabs managed agent) call, keyed by conversation id instead
 *  of a Twilio call SID. */
export interface AgentCallInput {
  conversationId: string;
  businessId: string;
  numberId: string;
  from: string;
  to: string;
  /** Real call direction from the post-call payload (metadata.phone_call.direction).
   *  Optional - tool webhooks don't know it - defaulting to "inbound", so outbound
   *  test/demo calls only get labeled once the post-call webhook lands. */
  direction?: "inbound" | "outbound";
}

export interface FinalizeCallInput {
  status: CallStatus;
  durationSeconds?: number;
  medianLatencyMs?: number;
}

/**
 * Storage boundary for the call engine. Backed by Supabase in production
 * (see `supabase.ts`); the interface keeps the rest of the engine free of any
 * direct database coupling and makes it trivial to fake in tests.
 */
export interface CallRepository {
  /** Resolve the configuration for the dialed number, or null if unknown/disabled. */
  resolveInboundNumber(toE164: string): Promise<NumberConfig | null>;

  createCall(input: CreateCallInput): Promise<string>;

  /** Find the call row for an ElevenLabs conversation, creating it on first use.
   *  Idempotent: repeated tool calls in one conversation return the same id. */
  getOrCreateAgentCall(input: AgentCallInput): Promise<string>;

  /** Atomically mark a call completed. Returns true only for the FIRST caller;
   *  a retried post-call webhook gets false and must skip re-processing (so
   *  transcript turns and summary/email/CRM delivery don't duplicate). */
  claimAgentCallCompletion(callId: string): Promise<boolean>;

  /** Inverse of claimAgentCallCompletion: reopen the call after a post-claim
   *  failure so the webhook retry can claim it again and reprocess. Release
   *  ONLY on failure - releasing after success would break the dedup. */
  releaseAgentCallCompletion(callId: string): Promise<void>;

  markInProgress(callId: string, streamSid: string): Promise<void>;

  /** Persist the full transcript in one batch, replacing any turns already
   *  stored for the call - so a retried post-call webhook can't duplicate them. */
  appendTurns(callId: string, turns: TranscriptTurn[]): Promise<void>;
  finalizeCall(callId: string, input: FinalizeCallInput): Promise<void>;
  saveSummary(callId: string, summary: CallSummary): Promise<void>;

  /** Record an action the AI took; returns the action id for later updates. */
  recordAction(
    callId: string,
    action: CallAction,
    integrationId?: string,
  ): Promise<string>;
  updateAction(
    actionId: string,
    patch: Partial<Pick<CallAction, "status" | "externalId" | "error">>,
  ): Promise<void>;

  /** Load a finished call's transcript, actions, and config for post-call
   *  summarization. Actions (bookings/messages/transfers) let the recap state
   *  what the assistant actually did, not just what was said. */
  getCallForSummary(callId: string): Promise<{
    config: NumberConfig;
    turns: TranscriptTurn[];
    actions: CallAction[];
    from: string;
  } | null>;
}
