import { cache } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { authConfigured } from "@/lib/supabase/config";
import { mergeKnowledge, type AssistantKnowledge } from "../knowledge/sources";
import { DEFAULT_VOICE_ID } from "../call-engine/voice/catalog";

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to manage phone numbers.",
    );
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

function isMissingColumnError(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  if (!e) return false;
  return e.code === "PGRST204" || /could not find the .*column/i.test(e.message ?? "");
}

export type NumberLabel = "Home" | "Work" | "Organization" | "Personal";

export interface PhoneNumber {
  id: string;
  e164: string;
  twilio_sid: string | null;
  elevenlabs_phone_number_id: string | null;
  enabled: boolean;
  assistant_id: string | null;
  created_at: string;
}

export interface CreateNumberInput {
  e164: string;
  twilioSid?: string;
  assistantId?: string;
}

export interface UpdateNumberInput {
  enabled: boolean;
}

export async function listNumbers(): Promise<PhoneNumber[]> {
  const { data, error } = await db()
    .from("phone_numbers")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PhoneNumber[];
}

export async function getNumber(id: string): Promise<PhoneNumber | null> {
  const { data, error } = await db()
    .from("phone_numbers")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as PhoneNumber) ?? null;
}

// Defaults applied to a freshly created assistant so it can take a call right away.
const DEFAULT_ROUTING = { sttProvider: "elevenlabs" };
const DEFAULT_LANGUAGE = "multi";

export async function createNumber(input: CreateNumberInput): Promise<string> {
  const { data, error } = await db()
    .from("phone_numbers")
    .insert({
      e164: input.e164,
      twilio_sid: input.twilioSid ?? null,
      assistant_id: input.assistantId ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return String(data.id);
}

export async function updateNumber(
  id: string,
  patch: UpdateNumberInput,
): Promise<void> {
  const { error } = await db()
    .from("phone_numbers")
    .update({ enabled: patch.enabled })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteNumber(id: string): Promise<void> {
  const { error } = await db().from("phone_numbers").delete().eq("id", id);
  if (error) throw error;
}

// ── Integrations (calendars, etc.) ──────────────────────────────────────────

export interface Integration {
  id: string;
  type: string;
  provider: string;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  owner_id?: string | null;
}

export async function listIntegrations(ownerId?: string | null): Promise<Integration[]> {
  let query = db().from("integrations").select("*");
  if (ownerId) query = query.or(`owner_id.eq.${ownerId},owner_id.is.null`);
  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Integration[];
}

export async function upsertCalendarIntegration(
  provider: string,
  config: Record<string, unknown>,
  ownerId?: string | null,
): Promise<void> {
  if (authConfigured() && !ownerId) throw new Error("Not signed in.");
  let match = db()
    .from("integrations")
    .select("id")
    .eq("type", "calendar")
    .eq("provider", provider);
  if (ownerId) match = match.or(`owner_id.eq.${ownerId},owner_id.is.null`);
  const existing = await match
    .order("owner_id", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (existing.data?.id) {
    const { error } = await db()
      .from("integrations")
      .update({ config, enabled: true, ...(ownerId ? { owner_id: ownerId } : {}) })
      .eq("id", existing.data.id);
    if (error) throw error;
    return;
  }

  const { error } = await db().from("integrations").insert({
    type: "calendar",
    provider,
    config,
    enabled: true,
    ...(ownerId ? { owner_id: ownerId } : {}),
  });
  if (error) throw error;
}

export async function createCrmIntegration(
  config: Record<string, unknown>,
  ownerId?: string | null,
): Promise<void> {
  if (authConfigured() && !ownerId) throw new Error("Not signed in.");
  const { error } = await db().from("integrations").insert({
    type: "crm",
    provider: "webhook",
    config,
    enabled: true,
    ...(ownerId ? { owner_id: ownerId } : {}),
  });
  if (error) throw error;
}

// Marks one connected calendar as the primary (config.primary flag); clears
// the flag on every other calendar the owner can see.
export async function setPrimaryCalendar(id: string, ownerId?: string | null): Promise<void> {
  if (authConfigured() && !ownerId) throw new Error("Not signed in.");
  let query = db().from("integrations").select("id, config").eq("type", "calendar");
  if (ownerId) query = query.or(`owner_id.eq.${ownerId},owner_id.is.null`);
  const { data, error } = await query;
  if (error) throw error;
  if (!(data ?? []).some((row) => String(row.id) === id)) throw new Error("Calendar not found.");
  await Promise.all(
    (data ?? []).map(async (row) => {
      const cfg = (row.config as Record<string, unknown>) ?? {};
      const isTarget = String(row.id) === id;
      if (Boolean(cfg.primary) === isTarget) return;
      const config = { ...cfg };
      if (isTarget) config.primary = true;
      else delete config.primary;
      const { error: upErr } = await db().from("integrations").update({ config }).eq("id", row.id);
      if (upErr) throw upErr;
    }),
  );
}

export async function deleteIntegration(id: string, ownerId?: string | null): Promise<void> {
  if (authConfigured() && !ownerId) throw new Error("Not signed in.");
  let query = db().from("integrations").delete().eq("id", id);
  if (ownerId) query = query.or(`owner_id.eq.${ownerId},owner_id.is.null`);
  const { error } = await query;
  if (error) throw error;
}

// ── Assistants ──────────────────────────────────────────────────────────────

export interface Assistant {
  id: string;
  business_id: string;
  owner_id: string | null;
  organization_id: string | null;
  name: string;
  greeting: string;
  system_prompt: string;
  voice_id: string;
  language: string;
  knowledge: Record<string, unknown>;
  routing: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  elevenlabs_agent_id: string | null;
  elevenlabs_multilingual?: boolean;
  elevenlabs_kb: AgentKbDoc[];
  elevenlabs_tools: AgentTool[];
}

export interface AgentKbDoc {
  id: string;
  name: string;
}

export interface AgentTool {
  id: string;
  name: string;
}

/**
 * Every field is optional: saves are patches, so a form that did not carry a
 * field must leave that column alone rather than overwrite it. An omitted key
 * is never written - see lib/dashboard/assistant-patch.ts.
 */
export interface UpdateAssistantInput {
  name?: string;
  greeting?: string;
  system_prompt?: string;
  voice_id?: string;
  language?: string;
  knowledge?: Record<string, unknown>;
  routing?: Record<string, unknown>;
}

const ASSISTANT_UPDATE_KEYS = [
  "name",
  "greeting",
  "system_prompt",
  "voice_id",
  "language",
  "knowledge",
  "routing",
] as const;

export const listAssistants = cache(async (ownerId?: string | null): Promise<Assistant[]> => {
  let query = db().from("assistants").select("*").is("deleted_at", null);
  if (ownerId) query = query.eq("owner_id", ownerId);
  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Assistant[];
});

// Request-memoized: the owner guard and the page/action body both read the same
// assistant, so one query serves the whole request. Writers that need a fresh
// row post-update (getAssistantSyncContext) run their own query.
export const getAssistant = cache(async (id: string): Promise<Assistant | null> => {
  const { data, error } = await db()
    .from("assistants")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as Assistant) ?? null;
});

export async function createAssistant(
  name: string,
  ownerId?: string,
): Promise<string> {
  const { data, error } = await db()
    .from("assistants")
    .insert({
      owner_id: ownerId ?? null,
      name: name || "My assistant",
      voice_id: DEFAULT_VOICE_ID,
      language: DEFAULT_LANGUAGE,
      routing: DEFAULT_ROUTING,
    })
    .select("id")
    .single();
  if (error) throw error;
  return String(data.id);
}

export async function updateAssistant(
  id: string,
  patch: UpdateAssistantInput,
): Promise<void> {
  const update: Record<string, unknown> = {};
  for (const key of ASSISTANT_UPDATE_KEYS) {
    if (patch[key] !== undefined) update[key] = patch[key];
  }
  if (Object.keys(update).length === 0) return;

  const { error } = await db().from("assistants").update(update).eq("id", id);
  if (error) throw error;
}

export async function setAssistantEnabled(id: string, enabled: boolean): Promise<void> {
  const { error } = await db().from("assistants").update({ enabled }).eq("id", id);
  if (error) throw error;
}

export async function updateAssistantKnowledge(
  id: string,
  knowledge: Record<string, unknown>,
): Promise<void> {
  const { error } = await db()
    .from("assistants")
    .update({ knowledge })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAssistant(id: string): Promise<void> {
  const { error } = await db()
    .from("assistants")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function setAssistantAgent(
  id: string,
  agentId: string | null,
  kb: AgentKbDoc[],
  tools: AgentTool[] = [],
  multilingual: boolean = true,
): Promise<void> {
  // One write for everything; degrade column by column only when the schema
  // is behind (pre-0005 installs), instead of always paying two round trips.
  const { error } = await db()
    .from("assistants")
    .update({
      elevenlabs_agent_id: agentId,
      elevenlabs_kb: kb,
      elevenlabs_tools: tools,
      elevenlabs_multilingual: multilingual,
    })
    .eq("id", id);
  if (!error) return;
  if (!isMissingColumnError(error)) throw error;
  console.warn(
    "[db] assistants is missing elevenlabs_kb/elevenlabs_tools/elevenlabs_multilingual - apply the latest migrations for full tool/KB cleanup. Persisting agent id only for now.",
  );
  const { error: agentOnly } = await db()
    .from("assistants")
    .update({ elevenlabs_agent_id: agentId })
    .eq("id", id);
  if (agentOnly && !isMissingColumnError(agentOnly)) throw agentOnly;
}

export interface AssistantSyncContext {
  assistant: Assistant;
  businessName: string;
  knowledge: AssistantKnowledge;
}

// Merge computed keys into assistants.routing (fresh read to avoid clobbering
// concurrent edits to other routing keys).
export async function updateAssistantRouting(
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const { data, error } = await db()
    .from("assistants")
    .select("routing")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    // Callers treat this as persisted - if it silently no-ops, call starts
    // fall back to live greeting translation with nobody the wiser. Say why.
    console.error("[db] updateAssistantRouting read failed - patch dropped", id, error ?? "row missing");
    return;
  }
  const routing = { ...((data.routing as Record<string, unknown>) ?? {}), ...patch };
  const { error: upErr } = await db().from("assistants").update({ routing }).eq("id", id);
  if (upErr) throw upErr;
}

// Providers of the (enabled) calendar integrations behind the given ids -
// used at sync time to only promise the agent capabilities that can work.
export async function getCalendarProviders(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await db()
    .from("integrations")
    .select("id, provider")
    .in("id", ids)
    .eq("type", "calendar")
    .eq("enabled", true);
  if (error) throw error;
  return new Map((data ?? []).map((r) => [String(r.id), String(r.provider)]));
}

export async function getAssistantSyncContext(
  id: string,
): Promise<AssistantSyncContext | null> {
  const { data, error } = await db()
    .from("assistants")
    .select("*, organization:organizations(name, knowledge)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const org =
    (data.organization as { name?: string; knowledge?: Record<string, unknown> } | null) ?? null;
  const knowledge = mergeKnowledge(
    data.knowledge as Record<string, unknown>,
    org?.knowledge ?? {},
  );

  // Business identity: the assistant's organization, else the owner's company.
  let businessName = (org?.name ?? "").trim();
  if (!businessName && data.owner_id) {
    const { data: acct } = await db()
      .from("account_settings")
      .select("company")
      .eq("user_id", data.owner_id)
      .maybeSingle();
    businessName = String(acct?.company ?? "").trim();
  }

  // Strip the joined relation so the returned assistant matches the flat type.
  const { organization: _o, ...assistant } = data as Record<string, unknown>;
  void _o;

  return {
    assistant: assistant as unknown as Assistant,
    businessName: businessName || "our business",
    knowledge,
  };
}

// Lifetime call total for one assistant - a head-only count, no rows fetched.
// Used by the company page's stat tiles and assistant list.
export async function countAssistantCalls(assistantId: string): Promise<number> {
  const { count, error } = await db()
    .from("calls")
    .select("id", { count: "exact", head: true })
    .eq("assistant_id", assistantId);
  if (error) throw error;
  return count ?? 0;
}

export async function getAssistantNumber(
  assistantId: string,
): Promise<PhoneNumber | null> {
  const { data, error } = await db()
    .from("phone_numbers")
    .select("*")
    .eq("assistant_id", assistantId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as PhoneNumber) ?? null;
}

export async function claimFreeNumber(
  assistantId: string,
): Promise<PhoneNumber | null> {
  const { data: candidates, error } = await db()
    .from("phone_numbers")
    .select("id")
    .is("deleted_at", null)
    .is("assistant_id", null)
    .eq("enabled", true)
    .not("twilio_sid", "is", null)
    .order("created_at", { ascending: true })
    .limit(20);
  if (error) throw error;

  for (const c of candidates ?? []) {
    const { data: claimed, error: claimErr } = await db()
      .from("phone_numbers")
      .update({ assistant_id: assistantId })
      .eq("id", c.id)
      .is("assistant_id", null)
      .select("*")
      .maybeSingle();
    if (claimErr) throw claimErr;
    if (claimed) return claimed as PhoneNumber;
  }
  return null;
}

export async function listNumbersMissingElevenLabsId(): Promise<
  { id: string; e164: string }[]
> {
  const { data, error } = await db()
    .from("phone_numbers")
    .select("id, e164")
    .is("deleted_at", null)
    .not("twilio_sid", "is", null)
    .is("elevenlabs_phone_number_id", null);
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: String(r.id), e164: String(r.e164) }));
}

export async function listImportedFreeNumbers(): Promise<PhoneNumber[]> {
  const { data, error } = await db()
    .from("phone_numbers")
    .select("*")
    .is("deleted_at", null)
    .is("assistant_id", null)
    .eq("enabled", true)
    .not("elevenlabs_phone_number_id", "is", null);
  if (error) throw error;
  return (data ?? []) as PhoneNumber[];
}

export async function assignedElevenLabsNumberIds(): Promise<Set<string>> {
  const { data, error } = await db()
    .from("phone_numbers")
    .select("elevenlabs_phone_number_id")
    .is("deleted_at", null)
    .not("assistant_id", "is", null)
    .not("elevenlabs_phone_number_id", "is", null);
  if (error) throw error;
  return new Set((data ?? []).map((r) => String(r.elevenlabs_phone_number_id)));
}

export async function countFreeNumbers(): Promise<number> {
  const { count, error } = await db()
    .from("phone_numbers")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null)
    .is("assistant_id", null)
    .eq("enabled", true)
    .not("twilio_sid", "is", null);
  if (error) throw error;
  return count ?? 0;
}

export async function freeAssistantNumbers(assistantId: string): Promise<void> {
  const { error } = await db()
    .from("phone_numbers")
    .update({ assistant_id: null })
    .eq("assistant_id", assistantId)
    .is("deleted_at", null);
  if (error) throw error;
}

export async function setNumberAssistant(
  numberId: string,
  assistantId: string | null,
): Promise<void> {
  const { error } = await db()
    .from("phone_numbers")
    .update({ assistant_id: assistantId })
    .eq("id", numberId);
  if (error) throw error;
}

export async function setNumberElevenLabsId(
  numberId: string,
  elevenLabsPhoneNumberId: string,
): Promise<void> {
  if (!elevenLabsPhoneNumberId) return;
  const { error } = await db()
    .from("phone_numbers")
    .update({ elevenlabs_phone_number_id: elevenLabsPhoneNumberId })
    .eq("id", numberId);
  if (!error) return;
  if (isMissingColumnError(error)) {
    console.warn(
      "[db] phone_numbers.elevenlabs_phone_number_id missing - apply migration 0005; skipping (ElevenLabs id will be re-scanned when needed).",
    );
    return;
  }
  throw error;
}

export async function getAssistantNumbers(
  assistantId: string,
): Promise<{ id: string; twilio_sid: string | null }[]> {
  const { data, error } = await db()
    .from("phone_numbers")
    .select("id, twilio_sid")
    .eq("assistant_id", assistantId)
    .is("deleted_at", null);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: String(r.id),
    twilio_sid: r.twilio_sid ? String(r.twilio_sid) : null,
  }));
}

export interface OwnedNumber {
  id: string;
  e164: string;
  created_at: string;
}

export const getOwnedNumbers = cache(async (ownerId: string): Promise<OwnedNumber[]> => {
  const { data, error } = await db()
    .from("phone_numbers")
    .select("id,e164,created_at,assistant:assistants!assistant_id!inner(owner_id)")
    .eq("assistant.owner_id", ownerId);
  if (error) throw error;
  return (data ?? []).map((n) => ({
    id: String(n.id),
    e164: String(n.e164),
    created_at: String(n.created_at),
  }));
});

