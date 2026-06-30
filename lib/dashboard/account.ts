import { serviceClient } from "./supabase";

// Per-user account settings: profile, the "about" blurb optionally shared with
// the user's AI assistants, and notification preferences. Server-side only.

export interface AccountSettings {
  user_id: string;
  full_name: string;
  company: string;
  role: string;
  phone: string;
  timezone: string;
  about: string;
  share_with_assistants: boolean;
  notify_email: boolean;
  notify_email_address: string;
  notify_sms: boolean;
  notify_sms_number: string;
}

export type AccountProfileInput = Pick<
  AccountSettings,
  "full_name" | "company" | "role" | "phone" | "timezone" | "about" | "share_with_assistants"
>;

export type NotificationInput = Pick<AccountSettings, "notify_email" | "notify_sms">;

const EMPTY: Omit<AccountSettings, "user_id"> = {
  full_name: "",
  company: "",
  role: "",
  phone: "",
  timezone: "",
  about: "",
  share_with_assistants: true,
  notify_email: true,
  notify_email_address: "",
  notify_sms: false,
  notify_sms_number: "",
};

export async function getAccountSettings(userId: string): Promise<AccountSettings> {
  const { data, error } = await serviceClient()
    .from("account_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return { user_id: userId, ...EMPTY, ...(data ?? {}) } as AccountSettings;
}

async function upsert(userId: string, patch: Record<string, unknown>): Promise<void> {
  const { error } = await serviceClient()
    .from("account_settings")
    .upsert(
      { user_id: userId, ...patch, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

export async function saveAccountProfile(userId: string, input: AccountProfileInput): Promise<void> {
  await upsert(userId, input);
}

export async function saveNotificationSettings(userId: string, input: NotificationInput): Promise<void> {
  await upsert(userId, input);
}

/**
 * Turn the owner's shared profile into a plain-text knowledge block for the
 * call prompt, or "" when sharing is off / nothing useful is set. Merged into
 * every assistant the user owns so callers can be told who the owner is.
 */
export function accountKnowledgeNotes(s: AccountSettings | null | undefined): string {
  if (!s || !s.share_with_assistants) return "";
  const lines: string[] = [];
  const owner = [s.full_name, s.role].filter(Boolean).join(", ");
  if (owner) lines.push(`Account owner: ${owner}.`);
  if (s.company) lines.push(`Company: ${s.company}.`);
  if (s.about.trim()) lines.push(s.about.trim());
  if (lines.length === 0) return "";
  return `About the account owner:\n${lines.join("\n")}`;
}
