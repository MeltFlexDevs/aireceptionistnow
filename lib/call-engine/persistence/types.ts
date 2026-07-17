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

export interface CallRepository {
  resolveInboundNumber(toE164: string): Promise<NumberConfig | null>;

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
