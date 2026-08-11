
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
  /**
   * The same call, written for the person who rang - in THEIR language, in the
   * second person, saying what was understood and what was committed to.
   *
   * Separate from `summary` because the audiences want opposite things. The
   * dashboard summary is third-person operational copy in the owner's language
   * ("caller asked about a leaking radiator, booked Thursday"). The caller needs
   * to be able to check it: "you asked us to look at a leaking radiator, and
   * we've booked you in for Thursday at 9am." One is a log line, the other is
   * the thing they will notice is wrong.
   */
  callerRecap: string;
  /**
   * What the caller asked for and did not get. Two kinds, one schema, because
   * they come out of the same reading of the transcript and lead to opposite
   * actions: an `unanswered` gap is fixed by the owner writing one line, a
   * `not_offered` request is a fact about the market that no amount of
   * configuration will change.
   */
  demandSignals: DemandSignal[];
}

/**
 * Something a caller wanted that the line could not give them.
 *
 * `quote` is mandatory and verbatim on purpose. Asked for a bare list, the model
 * cheerfully reports demand nobody expressed - "callers seem interested in
 * evening appointments" off a single ambiguous sentence. Requiring the words
 * back makes every signal checkable against the transcript, and makes a
 * fabricated one obvious rather than plausible.
 */
export interface DemandSignal {
  /**
   * `unanswered` - the knowledge base did not cover it, so the assistant could
   * not answer. Fixable: the owner types the answer once and it is never a gap
   * again.
   *
   * `not_offered` - the business genuinely does not do it, is not open then,
   * does not go there, does not speak it. Not a defect, and not fixable by
   * editing a knowledge base. It is demand the phone line is the only system in
   * the business that can see.
   */
  kind: "unanswered" | "not_offered";
  /** What they wanted, in a few words. */
  topic: string;
  /** Their own words, quoted from the transcript. */
  quote: string;
}
