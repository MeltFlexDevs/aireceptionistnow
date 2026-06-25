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
  business_id: string;
  label: string;
  e164: string;
  twilio_sid: string | null;
  greeting: string;
  system_prompt: string;
  voice_id: string;
  language: string;
  knowledge: Record<string, unknown>;
  routing: Record<string, unknown>;
  enabled: boolean;
  assistant_id: string | null;
  created_at: string;
}

export interface CreateNumberInput {
  label: string;
  e164: string;
  twilioSid?: string;
  assistantId?: string;
}

export interface UpdateNumberInput {
  label: string;
  e164: string;
  twilio_sid: string;
  language: string;
  voice_id: string;
  greeting: string;
  system_prompt: string;
  knowledge: Record<string, unknown>;
  routing: Record<string, unknown>;
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
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PhoneNumber[];
}

export async function getNumber(id: string): Promise<PhoneNumber | null> {
  const { data, error } = await db()
    .from("phone_numbers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as PhoneNumber) ?? null;
}

// Defaults applied to a freshly created number so it can take a call right away.
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // ElevenLabs "Rachel"
const DEFAULT_ROUTING = { sttProvider: "elevenlabs" };

export async function createNumber(input: CreateNumberInput): Promise<string> {
  const businessId = await ensureBusinessId();
  const { data, error } = await db()
    .from("phone_numbers")
    .insert({
      business_id: businessId,
      label: input.label,
      e164: input.e164,
      twilio_sid: input.twilioSid ?? null,
      assistant_id: input.assistantId ?? null,
      voice_id: DEFAULT_VOICE_ID,
      routing: DEFAULT_ROUTING,
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
    .update({
      label: patch.label,
      e164: patch.e164,
      twilio_sid: patch.twilio_sid || null,
      language: patch.language,
      voice_id: patch.voice_id,
      greeting: patch.greeting,
      system_prompt: patch.system_prompt,
      knowledge: patch.knowledge,
      routing: patch.routing,
      enabled: patch.enabled,
    })
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

export async function listAssistants(): Promise<Assistant[]> {
  const { data, error } = await db()
    .from("assistants")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Assistant[];
}

export async function getAssistant(id: string): Promise<Assistant | null> {
  const { data, error } = await db()
    .from("assistants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Assistant) ?? null;
}

export async function createAssistant(name: string): Promise<string> {
  const businessId = await ensureBusinessId();
  const { data, error } = await db()
    .from("assistants")
    .insert({
      business_id: businessId,
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

export async function deleteAssistant(id: string): Promise<void> {
  const { error } = await db().from("assistants").delete().eq("id", id);
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
