import { serviceClient } from "./supabase";
import {
  createAssistant,
  createNumber,
  claimFreeNumber,
  getAssistantNumber,
  listIntegrations,
  setNumberElevenLabsId,
} from "./db";
import { createOrganization, setAssistantOrganization, updateOrganizationKnowledge } from "./organizations";
import { canAssignNumber } from "./plan";
import {
  getOnboardingProfile,
  claimProvisioning,
  provisionLeaseExpired,
  saveOnboardingResult,
  setOnboardingStatus,
  type OnboardingProfile,
} from "./onboarding-profile";
import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { resolvePickedVoiceId } from "@/lib/call-engine/voice/catalog";
import { routeNumberToAgent } from "@/lib/call-engine/elevenlabs";
import { buyTwilioNumber } from "./twilio";
import { DEFAULT_COUNTRY } from "@/lib/number-pricing";

const PHONE_RE = /^\+[1-9]\d{6,15}$/;

export interface ProvisionOutcome {
  status: "done" | "provisioning" | "error" | "nothing";
  e164?: string;
  error?: string;
}

// Turns a paid onboarding profile into a working receptionist: organization,
// assistant (voice, routing, alerts), knowledge, ElevenLabs agent, and a phone
// number for the chosen country. Idempotent: created ids are checkpointed into
// profile.result, so a retry after a partial failure resumes where it stopped.
// Callable from the Stripe webhook (via after()) and from the onboarding
// provisioning screen as a fallback - claimProvisioning ensures a single
// runner, and a dead runner's claim expires after the lease.
export async function provisionOnboarding(userId: string): Promise<ProvisionOutcome> {
  const profile = await getOnboardingProfile(userId);
  if (!profile) return { status: "nothing" };
  if (profile.status === "done") return { status: "done", e164: profile.result.e164 };
  if (profile.status === "provisioning" && !provisionLeaseExpired(profile)) {
    return { status: "provisioning" };
  }

  const claimed = await claimProvisioning(userId).catch(() => false);
  if (!claimed) {
    const fresh = await getOnboardingProfile(userId);
    if (fresh?.status === "done") return { status: "done", e164: fresh.result.e164 };
    if (fresh?.status === "error") return { status: "error", error: fresh.result.error };
    return { status: "provisioning" };
  }

  try {
    // Re-read after the claim so a resumed run sees the latest checkpoints.
    const claimedProfile = (await getOnboardingProfile(userId)) ?? profile;
    const e164 = await runProvisioning(userId, claimedProfile);
    await setOnboardingStatus(userId, "done");
    return { status: "done", e164 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Provisioning failed.";
    console.error(`[provision] user ${userId} failed: ${message}`);
    await setOnboardingStatus(userId, "error", message).catch(() => {});
    return { status: "error", error: message };
  }
}

// Strict shallow merge into assistants.routing: any failure throws so the run
// lands in 'error' and retries, instead of finishing 'done' without the alert
// and calendar wiring the user configured. Preserves precomputed keys
// (greetingByLanguage etc.) the same way updateAssistantRouting does.
async function mergeAssistantRouting(
  assistantId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  const { data, error } = await serviceClient()
    .from("assistants")
    .select("routing")
    .eq("id", assistantId)
    .single();
  if (error) throw error;
  const routing = { ...((data?.routing as Record<string, unknown>) ?? {}), ...patch };
  const { error: writeError } = await serviceClient()
    .from("assistants")
    .update({ routing })
    .eq("id", assistantId);
  if (writeError) throw writeError;
}

async function runProvisioning(userId: string, profile: OnboardingProfile): Promise<string> {
  const cfg = profile.config;
  const result = { ...profile.result };
  const companyName = (cfg.companyName ?? "").trim() || "My company";
  const assistantName = (cfg.assistantName ?? "").trim() || "Receptionist";
  const country = (cfg.country ?? DEFAULT_COUNTRY).toUpperCase();

  // 1. Organization (hidden from the user - it holds the shared knowledge).
  if (!result.orgId) {
    result.orgId = await createOrganization(companyName, userId);
    await saveOnboardingResult(userId, { orgId: result.orgId });
  }
  const sources = cfg.sources ?? [];
  if (sources.length > 0) {
    await updateOrganizationKnowledge(result.orgId, { notes: "", sources });
  }

  // 2. Assistant, linked to the org, with the funnel's voice + alert routing.
  if (!result.assistantId) {
    result.assistantId = await createAssistant(assistantName, userId);
    await saveOnboardingResult(userId, { assistantId: result.assistantId });
  }
  await setAssistantOrganization(result.assistantId, result.orgId);

  if (cfg.voiceId) {
    // Library picks ("lib:...") are imported into the account here; a plain id
    // passes through. On import failure keep the assistant's default voice.
    const voiceId = await resolvePickedVoiceId(cfg.voiceId).catch(() => null);
    if (voiceId) {
      const { error } = await serviceClient()
        .from("assistants")
        .update({ voice_id: voiceId })
        .eq("id", result.assistantId);
      if (error) throw error;
    }
  }

  // Step 1 persists even invalid drafts so the form never loses input; only a
  // valid E.164 number may drive transfers/SMS.
  const rawPhone = (cfg.alertPhone ?? "").trim();
  const alertPhone = PHONE_RE.test(rawPhone) ? rawPhone : "";
  const alertsEmail = (cfg.alertsEmail ?? "").trim();
  const calendars = (await listIntegrations(userId).catch(() => [])).filter(
    (i) => i.type === "calendar" && i.enabled,
  );
  await mergeAssistantRouting(result.assistantId, {
    ...(alertPhone ? { transferTo: alertPhone, smsAlerts: true } : {}),
    ...(alertsEmail ? { emailTranscripts: { enabled: true, to: alertsEmail } } : {}),
    ...(calendars.length > 0
      ? { calendar: { access: calendars.map((c) => ({ integrationId: c.id, level: "write" })) } }
      : {}),
  });

  // 3. Account settings: businessName fallback + alert contact defaults.
  // Best-effort - a failure here shouldn't fail the whole deployment.
  const { error: accountError } = await serviceClient()
    .from("account_settings")
    .upsert(
      {
        user_id: userId,
        company: companyName,
        ...(alertPhone ? { phone: alertPhone, notify_sms: true, notify_sms_number: alertPhone } : {}),
        ...(alertsEmail ? { notify_email: true, notify_email_address: alertsEmail } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (accountError) console.error(`[provision] account_settings upsert failed: ${accountError.message}`);

  // 4. The ElevenLabs agent (KB upload, tools, greeting precompute). Must run
  // after the integrations grant and before number routing.
  const agentId = await syncAssistantAgent(result.assistantId);
  if (!agentId) throw new Error("Could not create the voice agent.");

  // 5. Phone number for the chosen country. Checkpoint the number BEFORE
  // routing so a routing failure retries with the same number instead of
  // buying another one (and a foreign number never drops into the US pool).
  if (!result.e164) {
    // A prior partial run may have assigned a number before checkpointing.
    const existing = await getAssistantNumber(result.assistantId).catch(() => null);
    let e164 = existing?.e164 ?? null;
    let numberId = existing?.id ?? null;

    if (!e164) {
      const gate = await canAssignNumber(userId);
      if (!gate.ok) throw new Error(gate.reason ?? "No active subscription.");

      // The free pool is seeded with US numbers and ignores country - only use
      // it when the user actually picked the default country.
      if (country === DEFAULT_COUNTRY) {
        const claimed = await claimFreeNumber(result.assistantId).catch(() => null);
        if (claimed) {
          e164 = claimed.e164;
          numberId = claimed.id;
        }
      }
      if (!e164) {
        const bought = await buyTwilioNumber({ country }, { configureWebhook: false });
        e164 = bought.e164;
        try {
          numberId = await createNumber({
            e164: bought.e164,
            twilioSid: bought.sid,
            assistantId: result.assistantId,
          });
        } catch (err) {
          // The Twilio purchase went through but we lost track of it - make
          // that loudly visible instead of silently re-buying next run.
          console.error(
            `[provision] bought Twilio number ${bought.e164} (sid ${bought.sid}) but createNumber failed - reconcile manually.`,
          );
          throw err;
        }
      }
    }

    result.e164 = e164;
    result.numberId = numberId ?? undefined;
    await saveOnboardingResult(userId, { e164, numberId: numberId ?? undefined });
  }

  if (!result.routed) {
    const elId = await routeNumberToAgent(result.e164, agentId, `${companyName} - ${assistantName}`);
    // Tolerates the missing migration-0005 column; non-fatal either way.
    if (result.numberId && elId) await setNumberElevenLabsId(result.numberId, elId).catch(() => {});
    await saveOnboardingResult(userId, { routed: true, error: undefined });
  }

  return result.e164;
}
