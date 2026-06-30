import { serviceClient } from "./supabase";
import type { Assistant } from "./db";

// Organizations data access. An organization groups a user's assistants and
// owns shared knowledge they all read on calls. Server-side only — uses the
// service-role client (RLS bypassed until auth policies land), like the rest of
// the dashboard data layer.

export interface Organization {
  id: string;
  owner_id: string | null;
  name: string;
  description: string;
  knowledge: Record<string, unknown>;
  created_at: string;
}

export interface UpdateOrganizationInput {
  name: string;
  description: string;
}

export async function listOrganizations(ownerId?: string | null): Promise<Organization[]> {
  let query = serviceClient().from("organizations").select("*").is("deleted_at", null);
  if (ownerId) query = query.eq("owner_id", ownerId);
  const { data, error } = await query.order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Organization[];
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const { data, error } = await serviceClient()
    .from("organizations")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as Organization) ?? null;
}

export async function createOrganization(name: string, ownerId?: string): Promise<string> {
  const { data, error } = await serviceClient()
    .from("organizations")
    .insert({ name: name || "My organization", owner_id: ownerId ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return String(data.id);
}

export async function updateOrganization(
  id: string,
  patch: UpdateOrganizationInput,
): Promise<void> {
  const { error } = await serviceClient()
    .from("organizations")
    .update({ name: patch.name, description: patch.description })
    .eq("id", id);
  if (error) throw error;
}

/** Replace only the knowledge JSON (used by knowledge-source add/remove). */
export async function updateOrganizationKnowledge(
  id: string,
  knowledge: Record<string, unknown>,
): Promise<void> {
  const { error } = await serviceClient()
    .from("organizations")
    .update({ knowledge })
    .eq("id", id);
  if (error) throw error;
}

/** Soft-delete the organization and detach its assistants (they survive). */
export async function deleteOrganization(id: string): Promise<void> {
  const sb = serviceClient();
  const unassign = await sb
    .from("assistants")
    .update({ organization_id: null })
    .eq("organization_id", id);
  if (unassign.error) throw unassign.error;

  const { error } = await sb
    .from("organizations")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Assistants currently assigned to an organization. */
export async function listOrganizationAssistants(orgId: string): Promise<Assistant[]> {
  const { data, error } = await serviceClient()
    .from("assistants")
    .select("*")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Assistant[];
}

/** Assign (or unassign with null) an assistant to an organization. */
export async function setAssistantOrganization(
  assistantId: string,
  orgId: string | null,
): Promise<void> {
  const { error } = await serviceClient()
    .from("assistants")
    .update({ organization_id: orgId })
    .eq("id", assistantId);
  if (error) throw error;
}

/** Knowledge JSON for an organization, or null. Used at call pickup to merge
 *  the org's shared knowledge into the assistant's prompt. */
export async function getOrganizationKnowledge(
  orgId: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await serviceClient()
    .from("organizations")
    .select("knowledge")
    .eq("id", orgId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data?.knowledge as Record<string, unknown>) ?? null;
}
