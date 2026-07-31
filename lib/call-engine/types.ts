
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
  /**
   * The ElevenLabs agent and phone-number ids behind this line. Carried so an
   * urgent message can ring the business back on its OWN number - a page from a
   * stranger's caller ID at 3am gets ignored, which defeats the point.
   * Empty when the number was never fully provisioned; paging then no-ops.
   */
  agentId: string;
  agentPhoneNumberId: string;
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
  /**
   * Things the assistant told the caller that the knowledge base does not
   * actually support - a made-up price, an invented policy, an opening time
   * nobody configured.
   *
   * The point is not to stop a hallucination (that ship has sailed by the time
   * a call is summarized) but to make it VISIBLE. Without this the failure mode
   * is silent: the caller is told something wrong, hangs up happy, and the
   * business never finds out. Each entry is a gap in the knowledge base, which
   * is where the dashboard points the operator next.
   */
  unsupportedClaims: string[];
  /** True when a human should read this call. Drives the dashboard flag. */
  needsReview: boolean;
}
