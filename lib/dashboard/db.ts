import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Dashboard data access. Intentionally separate from the call engine's
// repository: managing phone numbers only needs Supabase, not the full set of
// telephony/LLM/voice secrets the engine's getEnv() demands. Server-side only —
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

export type NumberLabel = "Home" | "Work" | "Organization" | "Personal";

export interface PhoneNumber {
  id: string;
  e164: string;
  twilio_sid: string | null;
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
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs "Rachel"
const DEFAULT_ROUTING = { sttProvider: "elevenlabs" };

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
}

export async function listIntegrations(): Promise<Integration[]> {
  const { data, error } = await db()
    .from("integrations")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Integration[];
}

/** Connect (or re-connect) a calendar provider — one row per provider. */
export async function upsertCalendarIntegration(
  provider: string,
  config: Record<string, unknown>,
): Promise<void> {
  const businessId = await ensureBusinessId();
  const existing = await db()
    .from("integrations")
    .select("id")
    .eq("business_id", businessId)
    .eq("type", "calendar")
    .eq("provider", provider)
    .maybeSingle();

  if (existing.data?.id) {
    const { error } = await db()
      .from("integrations")
      .update({ config, enabled: true })
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
  });
  if (error) throw error;
}

export async function deleteIntegration(id: string): Promise<void> {
  const { error } = await db().from("integrations").delete().eq("id", id);
  if (error) throw error;
}

// ── Assistants ──────────────────────────────────────────────────────────────

export interface Assistant {
  id: string;
  business_id: string;
  owner_id: string | null;
  name: string;
  greeting: string;
  system_prompt: string;
  voice_id: string;
  language: string;
  knowledge: Record<string, unknown>;
  routing: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
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
