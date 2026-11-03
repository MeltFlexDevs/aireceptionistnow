import { serviceClient } from "./supabase";
import type { KnowledgeSource } from "@/lib/knowledge/sources";
import { updateWithRetry } from "@/lib/onboarding/config-cas";

// Persistence for the /onboarding funnel. The funnel only collects config;
// nothing is provisioned until payment lands (lib/dashboard/provision.ts).
// getOnboardingProfile tolerates a missing table or unconfigured Supabase
// (guest/dev mode) by returning null - the funnel UI still renders, it just
// doesn't persist. The write/merge helpers are strict on purpose: a transient
// read failure must abort the write, never silently merge onto {} and wipe
// earlier checkpoints.

export type OnboardingStatus = "draft" | "provisioning" | "done" | "error";

// A 'provisioning' claim older than this is considered dead (runner was
// killed mid-flight) and may be re-claimed. Kept above the worst honest run
// (ElevenLabs sync + Twilio purchase) so live runs aren't stolen.
export const PROVISION_LEASE_MS = 3 * 60_000;

export interface OnboardingConfig {
  companyName?: string;
  /** The company's website, collected in step 1. Scraped into `sources`
   *  (best-effort) so the assistant knows the business from the first call. */
  companyWebsite?: string;
  assistantName?: string;
  voiceId?: string;
  /** Preferred voice gender, used to pick a matching voice for whatever
   *  language a caller phones in. */
  voiceGender?: "f" | "m";
  country?: string;
  alertsEmail?: string;
  alertPhone?: string;
  sources?: KnowledgeSource[];
  /** The user finished (or skipped) the knowledge step. */
  knowledgeDone?: boolean;
  /** The user finished (or skipped) the calendar step. */
  calendarDone?: boolean;
  /** ISO instant the user accepted the Terms of Service, written server-side by
   *  /api/checkout at the moment of subscribing. Absent means never accepted. */
  termsAcceptedAt?: string;
  /** Which revision of the Terms was accepted (lib/legal.ts TERMS_VERSION). A
   *  timestamp without this cannot prove what the user actually agreed to. */
  termsVersion?: string;
}

export interface OnboardingResult {
  orgId?: string;
  assistantId?: string;
  numberId?: string;
  e164?: string;
  /** The number is imported into ElevenLabs and answering. */
  routed?: boolean;
  error?: string;
  /** Provisioned on a store sandbox purchase (App Review, TestFlight): the
   *  assistant exists but no live phone number was bought for it. */
  sandbox?: boolean;
}

/**
 * Whether provisionOnboarding must stand down because the account already has
 * assistants that this run did not create. A web customer who owns assistants
 * can still carry an abandoned funnel draft; buying from the app's paywall
 * then re-enters provisioning, and without this guard it would create a second
 * organization, assistant, agent and Twilio number. A checkpointed assistantId
 * means the assistants are this run's own (a resumed partial run), so it
 * proceeds.
 */
export function shouldSkipProvisioning(result: OnboardingResult, assistantCount: number): boolean {
  return !result.assistantId && assistantCount > 0;
}

export interface OnboardingProfile {
  user_id: string;
  status: OnboardingStatus;
  step: number;
  config: OnboardingConfig;
  result: OnboardingResult;
  updated_at: string;
}

const COLUMNS = "user_id, status, step, config, result, updated_at";

async function readProfileStrict(userId: string): Promise<OnboardingProfile | null> {
  const { data, error } = await serviceClient()
    .from("onboarding_profiles")
    .select(COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as OnboardingProfile) ?? null;
}

export async function getOnboardingProfile(userId: string): Promise<OnboardingProfile | null> {
  try {
    return await readProfileStrict(userId);
  } catch {
    return null;
  }
}

/** True when a 'provisioning' claim is old enough to be considered dead. */
export function provisionLeaseExpired(profile: OnboardingProfile): boolean {
  const at = Date.parse(profile.updated_at);
  return !Number.isFinite(at) || Date.now() - at > PROVISION_LEASE_MS;
}

// Merge a patch into config. The row is single-writer (its own user walking
// the funnel), so read-merge-write is safe enough here.
// Writes that build on the list they read use updateOnboardingConfig.
export async function saveOnboardingConfig(
  userId: string,
  patch: Partial<OnboardingConfig>,
  step?: number,
): Promise<void> {
  const existing = await readProfileStrict(userId);
  const config = { ...(existing?.config ?? {}), ...patch };
  const { error } = await serviceClient()
    .from("onboarding_profiles")
    .upsert(
      {
        user_id: userId,
        config,
        step: Math.max(existing?.step ?? 0, step ?? 0),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

// Change config from its current value, with compare-and-swap on updated_at:
// the write only lands if the row is unchanged since the read, otherwise it
// reads again (lib/onboarding/config-cas.ts). For writes that build on what
// they read, such as adding or removing a source: two parallel adds read the
// same list, and a plain write keeps only the later one.
export async function updateOnboardingConfig(
  userId: string,
  change: (config: OnboardingConfig) => OnboardingConfig,
  step?: number,
): Promise<void> {
  let prevStep = 0;
  await updateWithRetry<OnboardingConfig>(
    async () => {
      const existing = await readProfileStrict(userId);
      prevStep = existing?.step ?? 0;
      return { value: existing?.config ?? {}, version: existing?.updated_at ?? null };
    },
    async (config, version) => {
      const row = {
        config,
        step: Math.max(prevStep, step ?? 0),
        updated_at: new Date().toISOString(),
      };
      if (version === null) {
        // No row yet. A parallel insert that won shows as a unique violation.
        const { error } = await serviceClient()
          .from("onboarding_profiles")
          .insert({ user_id: userId, ...row });
        if (error?.code === "23505") return false;
        if (error) throw error;
        return true;
      }
      const { data, error } = await serviceClient()
        .from("onboarding_profiles")
        .update(row)
        .eq("user_id", userId)
        .eq("updated_at", version)
        .select("user_id");
      if (error) throw error;
      return (data?.length ?? 0) > 0;
    },
    change,
  );
}

// Claim the profile for provisioning. Conditional update so a webhook and a
// success-page fallback can't both run the provisioner: only one caller wins.
// A stale 'provisioning' row (runner died before reaching a terminal status)
// is re-claimable after the lease expires, so a paying user can never be
// wedged on a spinner forever.
export async function claimProvisioning(userId: string): Promise<boolean> {
  const staleCutoff = new Date(Date.now() - PROVISION_LEASE_MS).toISOString();
  const { data, error } = await serviceClient()
    .from("onboarding_profiles")
    .update({ status: "provisioning", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .or(`status.in.(draft,error),and(status.eq.provisioning,updated_at.lt.${staleCutoff})`)
    .select("user_id");
  if (error) throw error;
  return (data ?? []).length > 0;
}

// Merge a patch into result - the provisioner checkpoints created ids here so
// a retry resumes instead of duplicating entities. Strict read: a failure here
// aborts the run rather than wiping earlier checkpoints.
export async function saveOnboardingResult(
  userId: string,
  patch: Partial<OnboardingResult>,
): Promise<void> {
  const existing = await readProfileStrict(userId);
  const result = { ...(existing?.result ?? {}), ...patch };
  const { error } = await serviceClient()
    .from("onboarding_profiles")
    .update({ result, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function setOnboardingStatus(
  userId: string,
  status: OnboardingStatus,
  errorMessage?: string,
): Promise<void> {
  if (errorMessage !== undefined) await saveOnboardingResult(userId, { error: errorMessage });
  const { error } = await serviceClient()
    .from("onboarding_profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw error;
}
