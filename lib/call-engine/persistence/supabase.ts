import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "../env";
import { mergeKnowledge } from "../../knowledge/sources";
import { accountKnowledgeNotes, type AccountSettings } from "../../dashboard/account";
import type {
  CallAction,
  IntegrationConfig,
  NumberConfig,
  TranscriptTurn,
} from "../types";
import type {
  AgentCallInput,
  CallRepository,
  CreateCallInput,
  FinalizeCallInput,
} from "./types";

// Service-role client — bypasses RLS. Server-side only; never expose this key.
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
    const { data: num, error } = await db()
      .from("phone_numbers")
      .select(
        "*, assistant:assistants(*, business:businesses(id, name), organization:organizations(knowledge))",
      )
      .eq("e164", toE164)
      .eq("enabled", true)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!num) return null;

    // All call config lives on the linked assistant; the number only carries its
    // e164 + Twilio info. Business comes from the assistant, falling back to the
    // first business when the number is unassigned.
    const cfg = (num.assistant as Record<string, unknown> | null) ?? {};
    const cfgBiz = (cfg.business as { id?: string; name?: string } | null) ?? null;
    const cfgOrg = (cfg.organization as { knowledge?: Record<string, unknown> } | null) ?? null;
    let businessId = cfgBiz?.id ? String(cfgBiz.id) : "";
    let businessName = cfgBiz?.name ?? "our business";
    if (!businessId) {
      // The assistant has no resolvable business. Only fall back to "the" business
      // when the deployment is unambiguously single-tenant (exactly one exists) —
      // never silently borrow the first of several tenants, which would serve one
      // tenant's config/integrations to another's caller. Otherwise fail closed.
      const { data: bizList } = await db()
        .from("businesses")
        .select("id, name")
        .order("created_at", { ascending: true })
        .limit(2);
      if (!bizList || bizList.length !== 1) {
        console.error(
          "[resolve] number has no linked business and tenancy is ambiguous; refusing",
          toE164,
        );
        return null;
      }
      businessId = String(bizList[0].id);
      businessName = (bizList[0].name as string) ?? businessName;
    }

    const { data: integrations } = await db()
      .from("integrations")
      .select("*")
      .eq("business_id", businessId)
      .eq("enabled", true);

    // Knowledge precedence, all merged into one block the assistant reads:
    //   assistant's own  +  its organization's shared  +  the owner's profile.
    let knowledge: Record<string, unknown> = cfgOrg?.knowledge
      ? mergeKnowledge(cfg.knowledge as Record<string, unknown>, cfgOrg.knowledge)
      : ((cfg.knowledge as Record<string, unknown>) ?? {});

    const ownerId = cfg.owner_id ? String(cfg.owner_id) : "";
    if (ownerId) {
      const { data: acct } = await db()
        .from("account_settings")
        .select("*")
        .eq("user_id", ownerId)
        .maybeSingle();
      const ownerNotes = accountKnowledgeNotes(acct as AccountSettings | null);
      if (ownerNotes) knowledge = mergeKnowledge(knowledge, { notes: ownerNotes });
    }

    return {
      numberId: String(num.id),
      businessId,
      businessName,
      label: String(cfg.name ?? businessName),
      e164: String(num.e164),
      greeting: String(cfg.greeting ?? "Hello, thanks for calling. How can I help?"),
      systemPrompt: String(cfg.system_prompt ?? ""),
      voiceId: String(cfg.voice_id ?? "21m00Tcm4TlvDq8ikWAM"),
      language: String(cfg.language ?? "en"),
      knowledge,
      routing: (cfg.routing as Record<string, unknown>) ?? {},
      integrations: (integrations ?? []).map(mapIntegration),
    };
  }

  async createCall(input: CreateCallInput): Promise<string> {
    const { data, error } = await db()
      .from("calls")
      .insert({
        business_id: input.businessId,
        phone_number_id: input.numberId,
        twilio_call_sid: input.callSid,
        from_number: input.from,
        to_number: input.to,
        direction: "inbound",
        status: "initiated",
      })
      .select("id")
      .single();
    if (error) throw error;
    return String(data.id);
  }

  async getOrCreateAgentCall(input: AgentCallInput): Promise<string> {
    const existing = await db()
      .from("calls")
      .select("id, business_id")
      .eq("elevenlabs_conversation_id", input.conversationId)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) {
      // A conversation id is bound to one business. Reject a reused/forged id that
      // arrives claiming a different tenant — otherwise a side effect (booking,
      // SMS) would run against one tenant's config while being recorded against
      // another's call row.
      if (String(existing.data.business_id) !== input.businessId) {
        throw new Error("conversation/business mismatch");
      }
      return String(existing.data.id);
    }

    // On concurrent first tool calls two inserts can race; the partial unique
    // index on elevenlabs_conversation_id makes the loser fail, so we re-read.
    const insert = await db()
      .from("calls")
      .insert({
        business_id: input.businessId,
        phone_number_id: input.numberId,
        elevenlabs_conversation_id: input.conversationId,
        from_number: input.from,
        to_number: input.to,
        direction: "inbound",
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

  async claimAgentCallCompletion(callId: string): Promise<boolean> {
    // Transition to completed only if not already completed; the returned rows
    // tell us whether THIS call won the race (or the retry). Backed by a plain
    // conditional UPDATE — no extra table needed.
    const { data, error } = await db()
      .from("calls")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", callId)
      .neq("status", "completed")
      .select("id");
    if (error) throw error;
    return (data?.length ?? 0) > 0;
  }

  async markInProgress(callId: string, streamSid: string): Promise<void> {
    const { error } = await db()
      .from("calls")
      .update({ status: "in_progress", recording_url: null })
      .eq("id", callId);
    if (error) throw error;
    void streamSid; // stream id is transient; not persisted
  }

  async appendTurn(callId: string, turn: TranscriptTurn): Promise<void> {
    const { error } = await db().from("call_turns").insert({
      call_id: callId,
      role: turn.role,
      text: turn.text,
      ts_ms: turn.tsMs,
    });
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

  async saveSummary(
    callId: string,
    summary: {
      summary: string;
      outcome: string;
      sentiment: string;
    },
  ): Promise<void> {
    const { error } = await db()
      .from("calls")
      .update({
        summary: summary.summary,
        outcome: summary.outcome,
        sentiment: summary.sentiment,
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

  async updateAction(
    actionId: string,
    patch: Partial<Pick<CallAction, "status" | "externalId" | "error">>,
  ): Promise<void> {
    const { error } = await db()
      .from("call_actions")
      .update({
        status: patch.status,
        external_id: patch.externalId,
        error: patch.error,
      })
      .eq("id", actionId);
    if (error) throw error;
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

    const config = await this.resolveInboundNumber(String(call.to_number));
    if (!config) return null;

    const { data: turns } = await db()
      .from("call_turns")
      .select("role, text, ts_ms")
      .eq("call_id", callId)
      .order("id", { ascending: true });

    const { data: actions } = await db()
      .from("call_actions")
      .select("type, status, external_id, payload, error")
      .eq("call_id", callId)
      .order("id", { ascending: true });

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
