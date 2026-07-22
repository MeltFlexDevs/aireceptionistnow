
export type Direction = "inbound" | "outbound";

export type CallStatus = "initiated" | "in_progress" | "completed" | "failed";

export type CallOutcome =
  | "booked"
  | "message"
  | "transferred"
  | "resolved"
  | "abandoned";

export type Sentiment =
  | "positive"
  | "neutral"
  | "negative"
  | "frustrated"
  | "angry";

export type TurnRole = "caller" | "assistant";

export interface TranscriptTurn {
  role: TurnRole;
  text: string;
  tsMs: number; // ms since call start
}

export interface IntegrationConfig {
  id: string;
  type: "calendar" | "crm" | "webhook";
  provider: string; // google | calcom | calendly | outlook | webhook
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface NumberConfig {
  numberId: string;
  businessName: string;
  label: string; // Home | Work | Organization | Personal ...
  e164: string;
  greeting: string;
  systemPrompt: string;
  voiceId: string;
  language: string;
  ownerLocale: string;
  multilingual: boolean;
  knowledge: Record<string, unknown>; // hours, services, pricing, FAQs
  routing: Record<string, unknown>; // transfer targets, business hours
  integrations: IntegrationConfig[];
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
  url?: string; // web link to the created event, when the provider returns one
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
