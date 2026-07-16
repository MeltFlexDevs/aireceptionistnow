import { serviceClient } from "./supabase";
import type { Assistant } from "./db";

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
