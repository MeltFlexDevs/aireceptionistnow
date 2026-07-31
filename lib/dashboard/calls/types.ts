export type CallSource = "twilio" | "db" | "both";

export interface CallLogRow {
  key: string;
  dbId: string | null;
  sid: string;
  date: string;
  dateLabel: string;
  status: string;
  statusLabel: string;
  direction: string; // inbound | outbound
  from: string;
  to: string;
  durationSec: number;
  durationLabel: string;
  outcome: string | null;
  assistant: string | null;
  source: CallSource;
  /** The post-call accuracy audit flagged this call for a human read. */
  needsReview: boolean;
}

export interface CallFilters {
  q?: string;
  direction?: string; // all | inbound | outbound
  status?: string; // all | completed | unanswered | active
}

export interface CallLog {
  rows: CallLogRow[];
  twilioConnected: boolean;
}

export interface CallTurn {
  id: number;
  role: string; // caller | assistant
  text: string;
  tsMs: number;
  atLabel: string;
}

export interface CallActionItem {
  id: string;
  type: string; // booking | message | transfer
  status: string; // pending | done | failed
  payload: Record<string, unknown>;
  error: string | null;
}

export interface CallDetail {
  id: string;
  sid: string;
  date: string;
  dateLabel: string;
  status: string;
  statusLabel: string;
  direction: string;
  from: string;
  to: string;
  durationLabel: string;
  outcome: string | null;
  sentiment: string | null;
  summary: string | null;
  assistant: string | null;
  recordingUrl: string | null;
  isLive: boolean;
  /** True when the accuracy audit wants a person to read this call. */
  needsReview: boolean;
  /**
   * What the assistant asserted that the knowledge base does not back up.
   * Each entry is also a gap worth filling - see CallSummary.unsupportedClaims.
   */
  reviewClaims: string[];
  turns: CallTurn[];
  actions: CallActionItem[];
}
