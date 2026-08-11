import type { ReceiptKind } from "../receipts";
import type {
  CallAction,
  CallStatus,
  CallSummary,
  DemandSignal,
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

  /**
   * The caller's receipt for this call, minting one if it does not exist yet.
   *
   * Idempotent by design, because two paths reach it for the same call: the
   * booking confirmation SMS wants the link mid-call so the caller gets one text
   * instead of two, and the post-call pipeline wants it for every other kind of
   * consequential call. Whichever arrives first creates the row; the second gets
   * the same token back rather than a duplicate the caller would be texted twice.
   *
   * Returns null only if the row could not be created or read - the caller then
   * sends its message without a link rather than failing the send.
   */
  ensureReceipt(callId: string, kind: ReceiptKind): Promise<string | null>;

  /** Records that the receipt link actually left Twilio. */
  markReceiptSent(token: string): Promise<void>;

  /**
   * What the caller asked for and did not get, harvested from the same summary
   * pass. Best-effort: a failure here must never cost the business its summary.
   */
  saveDemandSignals(
    callId: string,
    ownerId: string | null,
    signals: DemandSignal[],
  ): Promise<void>;

  getCallForSummary(callId: string): Promise<{
    config: NumberConfig;
    turns: TranscriptTurn[];
    actions: CallAction[];
    from: string;
    /**
     * Who the call belongs to, for the post-call push. Null on rows that
     * predate the assignment trigger or whose owner has been deleted - the
     * push then no-ops rather than guessing a recipient.
     */
    ownerId: string | null;
  } | null>;
}
