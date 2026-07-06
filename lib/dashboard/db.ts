import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { authConfigured } from "@/lib/supabase/config";
import { mergeKnowledge, type AssistantKnowledge } from "../knowledge/sources";
import { DEFAULT_VOICE_ID } from "../call-engine/voice/catalog";

// Dashboard data access. Intentionally separate from the call engine's
// repository: managing phone numbers only needs Supabase, not the full set of
// telephony/LLM/voice secrets the engine's getEnv() demands. Server-side only -
// uses the service-role key (RLS is added with auth later).

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

/**
 * True for PostgREST's "column not in the schema cache" error (code PGRST204),
 * i.e. writing a column the connected database doesn't have yet. Used to survive
 * schema drift - a DB that hasn't applied migration 0004/0005 (the ElevenLabs
 * agent/tool/phone-id columns) - instead of hard-failing the flow. Same spirit as
 * migration 0003's drift fix.
 */
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
  /** The id ElevenLabs gives the number once imported; used to reassign/route it. */
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

/** First business, or create a default one. Single-tenant until auth lands. */
export async function ensureBusinessId(): Promise<string> {
  const existing = await db()
    .from("businesses")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing.data?.id) return String(existing.data.id);

  const created = await db()
    .from("businesses")
    .insert({ name: "My business" })
    .select("id")
    .single();
  if (created.error) throw created.error;
  return String(created.data.id);
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
// "multi" = auto-detect the caller's language and reply in it (the engine
// matches voice + pronunciation). Users can pin a fixed language in settings.
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
  business_id: string;
  type: string;
  provider: string;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  /** The user who connected it (null on single-tenant-era rows). Scopes who may
   *  see/use/disconnect the integration - its config holds OAuth tokens.
   *  Requires migration 0008. */
  owner_id?: string | null;
}

/**
 * Integrations, scoped to an owner when one is passed (same contract as
 * listAssistants - pass currentUserId(); null/undefined skips scoping for
 * auth-off single-tenant deploys). An integration's config carries calendar
 * OAuth tokens, so an unscoped list would let one tenant see, book into, and
 * disconnect another tenant's calendar.
 */
export async function listIntegrations(ownerId?: string | null): Promise<Integration[]> {
  let query = db().from("integrations").select("*");
  // Unowned-allowed, same rule as deleteIntegration/upsertCalendarIntegration: a
  // strict .eq would hide legacy owner_id-null rows (migration 0008 does not
  // backfill), silently stripping pre-0008 calendars from assistant routing on
  // the next save.
  if (ownerId) query = query.or(`owner_id.eq.${ownerId},owner_id.is.null`);
  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Integration[];
}

/** Connect (or re-connect) a calendar provider - one row per provider PER
 *  OWNER. Pass the connecting user (currentUserId()) so one tenant reconnecting
 *  a provider can't overwrite another tenant's stored tokens; a legacy unowned
 *  row for the provider is claimed (stamped) rather than duplicated. */
export async function upsertCalendarIntegration(
  provider: string,
  config: Record<string, unknown>,
  ownerId?: string | null,
): Promise<void> {
  // Fail closed: with auth on, an owner is required. Without it the match below
  // runs unscoped and could overwrite another tenant's stored OAuth tokens (the
  // ungated OAuth callback reaches here with no session otherwise).
  if (authConfigured() && !ownerId) throw new Error("Not signed in.");
  const businessId = await ensureBusinessId();
  let match = db()
    .from("integrations")
    .select("id")
    .eq("business_id", businessId)
    .eq("type", "calendar")
    .eq("provider", provider);
  // Per-owner key: reuse the caller's own row or an unowned single-tenant-era
  // one, never another tenant's. Owned rows sort first so the claim prefers the
  // caller's existing row over a legacy unowned one.
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
    business_id: businessId,
    type: "calendar",
    provider,
    config,
    enabled: true,
    ...(ownerId ? { owner_id: ownerId } : {}),
  });
  if (error) throw error;
}

/** Delete an integration. When an ownerId is passed (auth on), only the
 *  caller's own - or a legacy unowned - row matches, so one tenant can't
 *  disconnect another's calendar (same unowned-allowed rule as
 *  requireAssistantOwner). */
export async function deleteIntegration(id: string, ownerId?: string | null): Promise<void> {
  // Fail closed: with auth on, an owner is required so no future unscoped caller
  // can delete another tenant's integration by id (defense-in-depth - the only
  // caller today, disconnectCalendarAction, is already behind the auth proxy).
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
  /** The managed ElevenLabs agent built from this assistant, or null pre-sync. */
  elevenlabs_agent_id: string | null;
  /** Whether the agent was built multilingual (language presets accepted). When
   *  false, the sync fell back to an English-only agent, so /api/agent/init must
   *  NOT send a per-caller language override the agent can't honor. Defaults true
   *  (undefined pre-migration is treated as multilingual). */
  elevenlabs_multilingual?: boolean;
  /** Knowledge-base docs we uploaded for this agent, tracked for re-sync cleanup. */
  elevenlabs_kb: AgentKbDoc[];
  /** Standalone ElevenLabs tool objects we created for this agent (webhook server
   *  tools), tracked so a re-sync can delete the previous set and a delete can
   *  tear them down. Empty until the first sync that attaches tools. */
  elevenlabs_tools: AgentTool[];
}

/** One ElevenLabs knowledge-base document we own on behalf of an assistant. */
export interface AgentKbDoc {
  id: string;
  name: string;
}

/** One standalone ElevenLabs tool object we own on behalf of an assistant. */
export interface AgentTool {
  id: string;
  name: string;
}

export interface UpdateAssistantInput {
  name: string;
  greeting: string;
  system_prompt: string;
  voice_id: string;
  language: string;
  knowledge: Record<string, unknown>;
  routing: Record<string, unknown>;
}

export async function listAssistants(ownerId?: string | null): Promise<Assistant[]> {
  let query = db().from("assistants").select("*").is("deleted_at", null);
  if (ownerId) query = query.eq("owner_id", ownerId);
  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Assistant[];
}

export async function getAssistant(id: string): Promise<Assistant | null> {
  const { data, error } = await db()
    .from("assistants")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as Assistant) ?? null;
}

export async function createAssistant(
  name: string,
  ownerId?: string,
): Promise<string> {
  const businessId = await ensureBusinessId();
  const { data, error } = await db()
    .from("assistants")
    .insert({
      business_id: businessId,
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
  const { error } = await db()
    .from("assistants")
    .update({
      name: patch.name,
      greeting: patch.greeting,
      system_prompt: patch.system_prompt,
      voice_id: patch.voice_id,
      language: patch.language,
      knowledge: patch.knowledge,
      routing: patch.routing,
    })
    .eq("id", id);
  if (error) throw error;
}

/** Flip an assistant on/off without touching its other config. */
export async function setAssistantEnabled(id: string, enabled: boolean): Promise<void> {
  const { error } = await db().from("assistants").update({ enabled }).eq("id", id);
  if (error) throw error;
}

/** Replace only the knowledge JSON (used by knowledge-source add/remove). */
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

/** Record the managed ElevenLabs agent (its uploaded KB docs + created tool
 *  objects) for an assistant after a sync. Passing null agentId clears the link. */
export async function setAssistantAgent(
  id: string,
  agentId: string | null,
  kb: AgentKbDoc[],
  tools: AgentTool[] = [],
  multilingual: boolean = true,
): Promise<void> {
  const { error } = await db()
    .from("assistants")
    .update({ elevenlabs_agent_id: agentId, elevenlabs_kb: kb, elevenlabs_tools: tools })
    .eq("id", id);
  if (error) {
    if (!isMissingColumnError(error)) throw error;
    // Schema drift: the DB is missing elevenlabs_kb/elevenlabs_tools (migration
    // 0005 not applied). Don't fail the whole "Get number"/save flow over the
    // tracking columns - persist elevenlabs_agent_id alone (that one matters most:
    // without it every sync would create a duplicate ElevenLabs agent). KB/tool
    // cleanup stays disabled until the migration is applied.
    console.warn(
      "[db] assistants is missing elevenlabs_kb/elevenlabs_tools - apply migration 0005 for full tool/KB cleanup. Persisting agent id only for now.",
    );
    const { error: agentOnly } = await db()
      .from("assistants")
      .update({ elevenlabs_agent_id: agentId })
      .eq("id", id);
    if (agentOnly && !isMissingColumnError(agentOnly)) throw agentOnly;
  }

  // Record the multilingual flag in a SEPARATE write so a missing
  // elevenlabs_multilingual column (migration 0006 not applied) can't roll back
  // the agent/kb/tools write above. Read side defaults to multilingual, so a drop
  // here just means /api/agent/init keeps applying language overrides as before.
  const { error: mlErr } = await db()
    .from("assistants")
    .update({ elevenlabs_multilingual: multilingual })
    .eq("id", id);
  if (mlErr && !isMissingColumnError(mlErr)) throw mlErr;
}

export interface AssistantSyncContext {
  assistant: Assistant;
  businessName: string;
  /** Assistant's own knowledge merged with its organization's shared knowledge. */
  knowledge: AssistantKnowledge;
}

/**
 * Everything needed to build/refresh an assistant's ElevenLabs agent: the
 * assistant row, its business name (for the agent prompt/persona), and its
 * effective knowledge (own + organization's shared), merged the same way the
 * call engine merges it at pickup. Returns null if the assistant is gone.
 */
export async function getAssistantSyncContext(
  id: string,
): Promise<AssistantSyncContext | null> {
  const { data, error } = await db()
    .from("assistants")
    .select("*, business:businesses(name), organization:organizations(knowledge)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const biz = (data.business as { name?: string } | null) ?? null;
  const org = (data.organization as { knowledge?: Record<string, unknown> } | null) ?? null;
  const knowledge = mergeKnowledge(
    data.knowledge as Record<string, unknown>,
    org?.knowledge ?? {},
  );

  // Strip the joined relations so the returned assistant matches the flat type.
  const { business: _b, organization: _o, ...assistant } = data as Record<string, unknown>;
  void _b;
  void _o;

  return {
    assistant: assistant as unknown as Assistant,
    businessName: biz?.name ?? "our business",
    knowledge,
  };
}

/** The phone number linked to an assistant, if any. */
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

/**
 * Claim the first free pooled number for an assistant. "Free" = active, enabled,
 * backed by a real Twilio number, and not yet linked to any assistant. The update
 * is guarded by `assistant_id IS NULL` so two concurrent creates can't grab the
 * same row - the loser's update matches zero rows and we try the next candidate.
 * Returns the claimed number, or null when the pool has none free.
 */
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

/** Active Twilio-backed numbers not yet imported into ElevenLabs - the setup
 *  endpoint sweeps these, imports each, and backfills the ElevenLabs id. */
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

/** Free pool numbers already imported into ElevenLabs - usable as the outbound
 *  caller ID for the public demo call (free = not linked to any assistant, so a
 *  customer's number is never used as the demo's caller ID). */
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

/** How many free numbers the pool currently holds (same "free" rule as claim). */
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

/**
 * Return all of an assistant's active numbers to the shared pool (unlink, keep
 * them on Twilio). Used on assistant delete so another assistant can reuse them.
 */
export async function freeAssistantNumbers(assistantId: string): Promise<void> {
  const { error } = await db()
    .from("phone_numbers")
    .update({ assistant_id: null })
    .eq("assistant_id", assistantId)
    .is("deleted_at", null);
  if (error) throw error;
}

/** Link (or unlink) a phone number to an assistant. */
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

/** Record the ElevenLabs phone-number id a Twilio number was imported as, so the
 *  connect/reassign path can address it directly instead of re-scanning. */
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
  // Schema drift: phone_numbers.elevenlabs_phone_number_id (migration 0005) not
  // applied. This id is only a cache to skip re-scanning ElevenLabs on the next
  // route, so skip persisting it rather than failing "Get number" - the connect
  // still succeeded; a later reassign just re-looks-up the id.
  if (isMissingColumnError(error)) {
    console.warn(
      "[db] phone_numbers.elevenlabs_phone_number_id missing - apply migration 0005; skipping (ElevenLabs id will be re-scanned when needed).",
    );
    return;
  }
  throw error;
}

/** All active numbers linked to an assistant (with their Twilio SIDs to release). */
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

export async function softDeleteNumber(id: string): Promise<void> {
  const { error } = await db()
    .from("phone_numbers")
    .update({ deleted_at: new Date().toISOString(), assistant_id: null })
    .eq("id", id);
  if (error) throw error;
}

/** Create a call record for a test call (so its transcript/summary persist). */
export async function createTestCall(input: {
  businessId: string;
  numberId: string;
  e164: string;
}): Promise<string> {
  const { data, error } = await db()
    .from("calls")
    .insert({
      business_id: input.businessId,
      phone_number_id: input.numberId,
      from_number: input.e164,
      to_number: input.e164,
      direction: "outbound",
      status: "initiated",
    })
    .select("id")
    .single();
  if (error) throw error;
  return String(data.id);
}

/** Attach the Twilio Call SID once an outbound call has been placed, so the
 *  call log can reconcile this DB row against the live Twilio call logs. */
export async function setCallTwilioSid(callId: string, sid: string): Promise<void> {
  const { error } = await db()
    .from("calls")
    .update({ twilio_call_sid: sid })
    .eq("id", callId);
  if (error) throw error;
}

export interface OwnedNumber {
  id: string;
  e164: string;
  created_at: string;
}

/** Phone numbers belonging to a user's assistants. Calls link to a user through
 *  calls.phone_number_id -> phone_numbers.assistant_id -> assistants.owner_id, so
 *  these ids scope a user's statistics and call log. */
export async function getOwnedNumbers(ownerId: string): Promise<OwnedNumber[]> {
  const { data: assistants, error: aErr } = await db()
    .from("assistants")
    .select("id")
    .eq("owner_id", ownerId);
  if (aErr) throw aErr;
  const assistantIds = (assistants ?? []).map((a) => String(a.id));
  if (assistantIds.length === 0) return [];

  const { data, error } = await db()
    .from("phone_numbers")
    .select("id,e164,created_at")
    .in("assistant_id", assistantIds);
  if (error) throw error;
  return (data ?? []).map((n) => ({
    id: String(n.id),
    e164: String(n.e164),
    created_at: String(n.created_at),
  }));
}

/** First active Twilio-backed number, used as the caller ID for landing test
 *  calls. Prefers a number linked to an assistant (so its config resolves). */
export async function getDefaultCallableNumber(): Promise<{
  id: string;
  e164: string;
  businessId: string;
} | null> {
  const sel = () =>
    db()
      .from("phone_numbers")
      .select("id,e164")
      .is("deleted_at", null)
      .eq("enabled", true)
      .not("twilio_sid", "is", null)
      .order("created_at", { ascending: true });

  const linked = await sel().not("assistant_id", "is", null).limit(1).maybeSingle();
  const row = linked.data ?? (await sel().limit(1).maybeSingle()).data;
  if (!row) return null;
  return { id: String(row.id), e164: String(row.e164), businessId: await ensureBusinessId() };
}
