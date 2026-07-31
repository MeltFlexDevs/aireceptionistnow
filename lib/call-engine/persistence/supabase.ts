import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "../env";
import { mergeKnowledge } from "../../knowledge/sources";
import { accountKnowledgeNotes, type AccountSettings } from "../../dashboard/account";
import type {
  CallAction,
  CallSummary,
  IntegrationConfig,
  NumberConfig,
  TranscriptTurn,
} from "../types";
import type {
  AgentCallInput,
  CallerContext,
  CallRepository,
  FinalizeCallInput,
} from "./types";

/**
 * How far back a caller is still "someone we know". Long enough to cover a
 * seasonal customer, short enough that greeting a stranger by a previous
 * occupant's name is unlikely.
 */
const CALLER_HISTORY_DAYS = 90;
/** Enough of the last call to be useful, short enough not to steer the model. */
const CALLER_SUMMARY_CHARS = 400;

// Service-role client - bypasses RLS. Server-side only; never expose this key.
let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (client) return client;
  const env = getEnv();
  client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

function mapIntegration(row: Record<string, unknown>): IntegrationConfig {
  return {
    id: String(row.id),
    type: row.type as IntegrationConfig["type"],
    provider: String(row.provider),
    config: (row.config as Record<string, unknown>) ?? {},
    enabled: Boolean(row.enabled),
  };
}

export class SupabaseCallRepository implements CallRepository {
  async resolveInboundNumber(toE164: string): Promise<NumberConfig | null> {
    // Narrow select: this runs on the greeting-blocking call-start path, so
    // don't ship columns nobody reads (elevenlabs_kb/_tools blobs, timestamps).
    const { data: num, error } = await db()
      .from("phone_numbers")
      .select(
        "id, e164, elevenlabs_phone_number_id, assistant:assistants(owner_id, name, greeting, system_prompt, voice_id, language, elevenlabs_multilingual, elevenlabs_agent_id, knowledge, routing, organization:organizations(name, knowledge))",
      )
      .eq("e164", toE164)
      .eq("enabled", true)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!num) return null;

    const cfg = (num.assistant as unknown as Record<string, unknown> | null) ?? {};
    const cfgOrg =
      (cfg.organization as { name?: string; knowledge?: Record<string, unknown> } | null) ?? null;

    const ownerId = cfg.owner_id ? String(cfg.owner_id) : "";

    // Fail closed on a missing owner: only global (owner-less) integrations
    // apply. Skipping the filter entirely would attach every tenant's
    // integrations to this number.
    const integrationsQuery = db()
      .from("integrations")
      .select("*")
      .eq("enabled", true)
      .or(ownerId ? `owner_id.eq.${ownerId},owner_id.is.null` : "owner_id.is.null");
    // Both queries depend only on the first lookup - run them together.
    const [{ data: integrations }, acctRes] = await Promise.all([
      integrationsQuery,
      ownerId
        ? db()
            .from("account_settings")
            .select("share_with_assistants, full_name, role, company, about, dashboard_locale")
            .eq("user_id", ownerId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    let knowledge: Record<string, unknown> = cfgOrg?.knowledge
      ? mergeKnowledge(cfg.knowledge as Record<string, unknown>, cfgOrg.knowledge)
      : ((cfg.knowledge as Record<string, unknown>) ?? {});

    let ownerLocale = "";
    let ownerCompany = "";
    if (ownerId) {
      const acct = acctRes.data;
      const ownerNotes = accountKnowledgeNotes(acct as AccountSettings | null);
      if (ownerNotes) knowledge = mergeKnowledge(knowledge, { notes: ownerNotes });
      ownerLocale = String((acct as Record<string, unknown> | null)?.dashboard_locale ?? "");
      ownerCompany = String((acct as Record<string, unknown> | null)?.company ?? "").trim();
    }

    // Business identity: the assistant's organization, else the owner's company.
    const businessName = (cfgOrg?.name ?? "").trim() || ownerCompany || "our business";

    return {
      numberId: String(num.id),
      businessName,
      label: String(cfg.name ?? businessName),
      e164: String(num.e164),
      greeting: String(cfg.greeting ?? "Hello, thanks for calling. How can I help?"),
      systemPrompt: String(cfg.system_prompt ?? ""),
      voiceId: String(cfg.voice_id ?? "21m00Tcm4TlvDq8ikWAM"),
      language: String(cfg.language ?? "en"),
      multilingual: cfg.elevenlabs_multilingual !== false,
      ownerLocale,
      knowledge,
      routing: (cfg.routing as Record<string, unknown>) ?? {},
      integrations: (integrations ?? []).map(mapIntegration),
      agentId: String(cfg.elevenlabs_agent_id ?? ""),
      agentPhoneNumberId: String(num.elevenlabs_phone_number_id ?? ""),
    };
  }

  async findCallerContext(
    numberId: string,
    fromNumber: string,
  ): Promise<CallerContext | null> {
    if (!numberId || !fromNumber) return null;
    const since = new Date(Date.now() - CALLER_HISTORY_DAYS * 86_400_000).toISOString();

    // One round trip: the last inbound call plus its actions, embedded. The
    // caller is on the line, so a second query for the name is not affordable.
    const { data, error } = await db()
      .from("calls")
      .select("started_at,summary,call_actions(type,payload)")
      .eq("phone_number_id", numberId)
      .eq("from_number", fromNumber)
      .eq("direction", "inbound")
      .gte("started_at", since)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const row = data as unknown as Record<string, unknown>;
    const actions = Array.isArray(row.call_actions)
      ? (row.call_actions as { type?: string; payload?: Record<string, unknown> }[])
      : [];

    // A booking names the attendee; a message names the caller. Either is the
    // same person on the other end of this number.
    let name = "";
    for (const a of actions) {
      const p = a.payload ?? {};
      const candidate = a.type === "booking" ? p.attendee_name : p.caller_name;
      if (typeof candidate === "string" && candidate.trim()) {
        name = candidate.trim().slice(0, 80);
        break;
      }
    }

    return {
      name,
      lastSummary: String(row.summary ?? "").slice(0, CALLER_SUMMARY_CHARS),
      lastAt: String(row.started_at ?? ""),
    };
  }

  // Lookup half of getOrCreateAgentCall - lets the tool path run it in
  // parallel with the config resolve instead of serializing the two.
  async findAgentCallId(conversationId: string): Promise<string | null> {
    const { data, error } = await db()
      .from("calls")
      .select("id")
      .eq("elevenlabs_conversation_id", conversationId)
      .maybeSingle();
    if (error) throw error;
    return data ? String(data.id) : null;
  }

  // Insert half: the partial unique index on elevenlabs_conversation_id makes
  // the insert race-safe; a conflict falls back to selecting the winner's row.
  async createAgentCall(input: AgentCallInput): Promise<string> {
    const insert = await db()
      .from("calls")
      .insert({
        phone_number_id: input.numberId,
        elevenlabs_conversation_id: input.conversationId,
        from_number: input.from,
        to_number: input.to,
        direction: input.direction ?? "inbound",
        status: "in_progress",
      })
      .select("id")
      .single();
    if (!insert.error) return String(insert.data.id);

    const retry = await db()
      .from("calls")
      .select("id")
      .eq("elevenlabs_conversation_id", input.conversationId)
      .maybeSingle();
    if (retry.data) return String(retry.data.id);
    throw insert.error;
  }

  async getOrCreateAgentCall(input: AgentCallInput): Promise<string> {
    const existing = await db()
      .from("calls")
      .select("id, direction")
      .eq("elevenlabs_conversation_id", input.conversationId)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) {
      const id = String(existing.data.id);
      if (input.direction && existing.data.direction !== input.direction) {
        const { error } = await db()
          .from("calls")
          .update({ direction: input.direction })
          .eq("id", id);
        if (error) throw error;
      }
      return id;
    }
    return this.createAgentCall(input);
  }

  async claimAgentCallCompletion(callId: string): Promise<boolean> {
    const { data, error } = await db()
      .from("calls")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", callId)
      .neq("status", "completed")
      .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  async releaseAgentCallCompletion(callId: string): Promise<void> {
    const { error } = await db()
      .from("calls")
      .update({ status: "in_progress" })
      .eq("id", callId);
    if (error) throw error;
  }

  async appendTurns(callId: string, turns: TranscriptTurn[]): Promise<void> {
    const del = await db().from("call_turns").delete().eq("call_id", callId);
    if (del.error) throw del.error;
    if (turns.length === 0) return;
    const { error } = await db()
      .from("call_turns")
      .insert(
        turns.map((t) => ({
          call_id: callId,
          role: t.role,
          text: t.text,
          ts_ms: t.tsMs,
        })),
      );
    if (error) throw error;
  }

  async finalizeCall(callId: string, input: FinalizeCallInput): Promise<void> {
    const { error } = await db()
      .from("calls")
      .update({
        status: input.status,
        ended_at: new Date().toISOString(),
        duration_seconds: input.durationSeconds ?? null,
        median_latency_ms: input.medianLatencyMs ?? null,
      })
      .eq("id", callId);
    if (error) throw error;
  }

  async saveSummary(callId: string, summary: CallSummary): Promise<void> {
    const { error } = await db()
      .from("calls")
      .update({
        summary: summary.summary,
        outcome: summary.outcome,
        sentiment: summary.sentiment,
        // Always written, including `false` and `[]`: that is what marks the
        // call as audited and clean, as opposed to predating the audit (null).
        needs_review: summary.needsReview,
        review_claims: summary.unsupportedClaims,
      })
      .eq("id", callId);
    if (error) throw error;
  }

  async recordAction(
    callId: string,
    action: CallAction,
    integrationId?: string,
  ): Promise<string> {
    const { data, error } = await db()
      .from("call_actions")
      .insert({
        call_id: callId,
        integration_id: integrationId ?? null,
        type: action.type,
        status: action.status,
        external_id: action.externalId ?? null,
        payload: action.payload,
        error: action.error ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return String(data.id);
  }

  async getCallForSummary(callId: string): Promise<{
    config: NumberConfig;
    turns: TranscriptTurn[];
    actions: CallAction[];
    from: string;
  } | null> {
    const { data: call, error } = await db()
      .from("calls")
      .select("to_number, from_number")
      .eq("id", callId)
      .maybeSingle();
    if (error) throw error;
    if (!call) return null;

    // Independent reads - run together. Errors must abort: an empty turns
    // list from a transient failure would be summarized as an abandoned call.
    const [config, turnsRes, actionsRes] = await Promise.all([
      this.resolveInboundNumber(String(call.to_number)),
      db()
        .from("call_turns")
        .select("role, text, ts_ms")
        .eq("call_id", callId)
        .order("id", { ascending: true }),
      db()
        .from("call_actions")
        .select("type, status, external_id, payload, error")
        .eq("call_id", callId)
        .order("id", { ascending: true }),
    ]);
    if (!config) return null;
    if (turnsRes.error) throw turnsRes.error;
    if (actionsRes.error) throw actionsRes.error;
    const { data: turns } = turnsRes;
    const { data: actions } = actionsRes;

    return {
      config,
      from: String(call.from_number ?? ""),
      turns: (turns ?? []).map((t) => ({
        role: t.role as TranscriptTurn["role"],
        text: String(t.text),
        tsMs: Number(t.ts_ms),
      })),
      actions: (actions ?? []).map((a) => ({
        type: a.type as CallAction["type"],
        status: a.status as CallAction["status"],
        externalId: a.external_id ? String(a.external_id) : undefined,
        payload: (a.payload as Record<string, unknown>) ?? {},
        error: a.error ? String(a.error) : undefined,
      })),
    };
  }
}

let repo: SupabaseCallRepository | null = null;

export function getRepository(): SupabaseCallRepository {
  if (!repo) repo = new SupabaseCallRepository();
  return repo;
}
