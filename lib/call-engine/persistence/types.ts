import type {
  CallAction,
  CallStatus,
  CallSummary,
  NumberConfig,
  TranscriptTurn,
} from "../types";

export interface AgentCallInput {
  conversationId: string;
  numberId: string;
  from: string;
  to: string;
  direction?: "inbound" | "outbound";
}

export interface FinalizeCallInput {
  status: CallStatus;
  durationSeconds?: number;
  medianLatencyMs?: number;
}

/** What we already know about a number that has called this line before. */
export interface CallerContext {
  /** Best name we captured last time, from a booking or a message. May be "". */
  name: string;
  /** Last call's summary, clipped. May be "" if it was never summarized. */
  lastSummary: string;
  /** ISO timestamp of that call. */
  lastAt: string;
}

export interface CallRepository {
  resolveInboundNumber(toE164: string): Promise<NumberConfig | null>;

  /**
   * Have we spoken to this number on this line before, and what about?
   *
   * Runs on the greeting-blocking path, so it is one indexed read (see the
   * calls_caller_history_idx migration) and the caller waits for nothing:
   * failure and slowness both degrade to "no record".
   */
  findCallerContext(numberId: string, fromNumber: string): Promise<CallerContext | null>;

  findAgentCallId(conversationId: string): Promise<string | null>;

  createAgentCall(input: AgentCallInput): Promise<string>;

  getOrCreateAgentCall(input: AgentCallInput): Promise<string>;

  claimAgentCallCompletion(callId: string): Promise<boolean>;

  releaseAgentCallCompletion(callId: string): Promise<void>;

  appendTurns(callId: string, turns: TranscriptTurn[]): Promise<void>;
  finalizeCall(callId: string, input: FinalizeCallInput): Promise<void>;
  saveSummary(callId: string, summary: CallSummary): Promise<void>;

  recordAction(
    callId: string,
    action: CallAction,
    integrationId?: string,
  ): Promise<string>;

  getCallForSummary(callId: string): Promise<{
    config: NumberConfig;
    turns: TranscriptTurn[];
    actions: CallAction[];
    from: string;
  } | null>;
}
