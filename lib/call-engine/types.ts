// Shared domain types for the call engine. Kept dependency-free so both the
// Next.js webhooks and the standalone WebSocket media server can import them.

export type Direction = "inbound" | "outbound";

export type CallStatus = "initiated" | "in_progress" | "completed" | "failed";

export type CallOutcome =
  | "booked"
  | "message"
  | "transferred"
  | "resolved"
  | "abandoned";

export type Sentiment = "positive" | "neutral" | "negative";

/** A turn in the live transcript. `assistant` is the AI receptionist. */
export type TurnRole = "caller" | "assistant";

export interface TranscriptTurn {
  role: TurnRole;
  text: string;
  tsMs: number; // ms since call start
}

/** A connected third-party integration (calendar, CRM, webhook). */
export interface IntegrationConfig {
  id: string;
  type: "calendar" | "crm" | "webhook";
  provider: string; // google | calcom | calendly | outlook | webhook
  config: Record<string, unknown>;
  enabled: boolean;
}

/** Everything the engine needs to answer one phone line, resolved at pickup. */
export interface NumberConfig {
  numberId: string;
  businessId: string;
  businessName: string;
  label: string; // Home | Work | Organization | Personal ...
  e164: string;
  greeting: string;
  systemPrompt: string;
  voiceId: string;
  language: string;
  knowledge: Record<string, unknown>; // hours, services, pricing, FAQs
  routing: Record<string, unknown>; // transfer targets, business hours
  integrations: IntegrationConfig[];
}

/** Identifies a live call and carries its resolved configuration. */
export interface CallContext {
  callId: string;
  callSid: string;
  streamSid: string;
  from: string;
  to: string;
  config: NumberConfig;
}

// ── Tool / action payloads ──────────────────────────────────────────────────

export interface BookingRequest {
  title: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  attendeeName?: string;
  attendeePhone?: string;
  notes?: string;
  calendarId?: string; // which calendar to write to (overrides the adapter default)
}

export interface BookingResult {
  ok: boolean;
  externalId?: string;
  error?: string;
}

export interface MessageRequest {
  callerName?: string;
  callbackNumber?: string;
  message: string;
  urgency?: "low" | "normal" | "high";
}

export type CallActionType = "booking" | "message" | "transfer";

export interface CallAction {
  type: CallActionType;
  status: "pending" | "done" | "failed";
  externalId?: string;
  payload: Record<string, unknown>;
  error?: string;
}

// ── Post-call summary ───────────────────────────────────────────────────────

export interface CallSummary {
  summary: string;
  outcome: CallOutcome;
  sentiment: Sentiment;
  actionItems: string[];
  tags: string[];
}
