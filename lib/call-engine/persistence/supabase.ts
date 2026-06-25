import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "../env";
import type {
  CallAction,
  IntegrationConfig,
  NumberConfig,
  TranscriptTurn,
} from "../types";
import type {
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
      .select("*, businesses(name), assistant:assistants(*)")
      .eq("e164", toE164)
      .eq("enabled", true)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!num) return null;

    const { data: integrations } = await db()
      .from("integrations")
      .select("*")
      .eq("business_id", num.business_id)
      .eq("enabled", true);

    const business = num.businesses as { name?: string } | null;
    // Prefer the linked assistant's config; fall back to the number's own.
    const cfg = (num.assistant as Record<string, unknown> | null) ?? num;
    return {
      numberId: String(num.id),
      businessId: String(num.business_id),
      businessName: business?.name ?? "our business",
      label: String(num.label),
      e164: String(num.e164),
      greeting: String(cfg.greeting ?? num.greeting),
      systemPrompt: String(cfg.system_prompt ?? ""),
      voiceId: String(cfg.voice_id ?? ""),
      language: String(cfg.language ?? "en"),
      knowledge: (cfg.knowledge as Record<string, unknown>) ?? {},
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

  async getCallForSummary(
    callId: string,
  ): Promise<{ config: NumberConfig; turns: TranscriptTurn[] } | null> {
    const { data: call, error } = await db()
      .from("calls")
      .select("to_number")
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

    return {
      config,
      turns: (turns ?? []).map((t) => ({
        role: t.role as TranscriptTurn["role"],
        text: String(t.text),
        tsMs: Number(t.ts_ms),
      })),
    };
  }
}

let repo: SupabaseCallRepository | null = null;

export function getRepository(): SupabaseCallRepository {
  if (!repo) repo = new SupabaseCallRepository();
  return repo;
}
