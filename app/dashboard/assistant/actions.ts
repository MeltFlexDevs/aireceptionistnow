"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  claimFreeNumber,
  createAssistant,
  createNumber,
  deleteAssistant,
  setAssistantEnabled,
  freeAssistantNumbers,
  getAssistant,
  getAssistantNumber,
  listIntegrations,
  setNumberAssistant,
  setNumberElevenLabsId,
  updateAssistant,
} from "@/lib/dashboard/db";
import { readKnowledge } from "@/lib/knowledge/sources";
import { buyTwilioNumber, registerCnam } from "@/lib/dashboard/twilio";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { canAssignNumber } from "@/lib/dashboard/plan";
import {
  placeAgentCall,
  releaseNumberFromAgent,
  routeNumberToAgent,
} from "@/lib/call-engine/elevenlabs";
import { syncAssistantAgent, deleteAssistantAgent } from "@/lib/call-engine/agent/sync";
import { isSafeHttpsUrl } from "@/lib/net/safe-url";
import { SUPPORTED_LANGUAGES } from "@/lib/call-engine/voice/phone-language";
import { addSharedVoice } from "@/lib/call-engine/voice/catalog";

const E164 = /^\+[1-9]\d{6,15}$/;
const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));

/** Decode the display name packed into a "lib:owner:id:name" voice token. */
function libVoiceName(encoded: string | undefined, lang: string): string {
  if (encoded) {
    try {
      const name = decodeURIComponent(encoded).slice(0, 60);
      if (name) return name;
    } catch {
      // fall through to the generic name
    }
  }
  return `Voice (${lang})`;
}

/**
 * Reject the request unless the caller owns this assistant. Server Actions are
 * public POST endpoints (Next only enforces same-origin, not auth), and the DB
 * helpers filter by id, not owner - without this any visitor could mutate
 * another tenant's assistant by guessing its id. In single-tenant deploys with
 * auth disabled (authConfigured() === false) ownership isn't enforced.
 *
 * Redirects (which throw NEXT_REDIRECT) on failure - call it BEFORE any
 * try/catch so the redirect isn't swallowed.
 */
async function requireAssistantOwner(assistantId: string): Promise<void> {
  if (!authConfigured()) return;
  const ownerId = await currentUserId();
  const assistant = assistantId
    ? await getAssistant(assistantId).catch(() => null)
    : null;
  // Block only a genuine cross-tenant access: an OWNED assistant whose owner
  // isn't the current user. An unowned assistant (owner_id null - created when no
  // session resolved) is treated as single-tenant and allowed, matching the
  // "ownership isn't enforced when auth is effectively off" intent above. This
  // avoids locking the sole operator out of their own unowned assistants.
  if (!assistant || (assistant.owner_id && assistant.owner_id !== ownerId)) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent("Not authorized.")}`);
  }
}

export async function createAssistantAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim() || "My assistant";

  const ownerId = await currentUserId();
  let id: string;
  try {
    id = await createAssistant(name, ownerId ?? undefined);
  } catch (err) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent((err as Error).message)}`);
  }

  // Build the managed ElevenLabs agent from the new assistant's settings so it
  // can take a call immediately. The assistant is already saved; a sync failure
  // is surfaced but non-fatal (saving again re-syncs).
  try {
    await syncAssistantAgent(id);
  } catch (err) {
    console.error("[assistant] agent sync failed on create", err);
    redirect(
      `/dashboard/assistant/${id}?error=${encodeURIComponent(`Assistant saved, but setting up its voice agent failed: ${(err as Error).message}`)}`,
    );
  }

  // Numbers are attached from the assistant's settings (Connect number → assigns
  // the ElevenLabs inbound agent). No auto-provisioning - the number lives in
  // ElevenLabs, not on a Twilio pool we manage.
  revalidatePath("/dashboard/assistant");
  redirect(`/dashboard/assistant/${id}`);
}

export async function updateAssistantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");
  await requireAssistantOwner(id);

  const transferTo = String(formData.get("transfer_to") ?? "").trim();

  const calendars = await listIntegrations((await currentUserId()) ?? undefined).catch(() => []);
  const access: Array<{ integrationId: string; level: string }> = [];
  for (const c of calendars) {
    if (c.type !== "calendar") continue;
    // Two capabilities: read (availability only) or write (also book). Legacy
    // "busy" maps to read.
    const raw = String(formData.get(`cal_access_${c.id}`) ?? "none");
    const level = raw === "busy" ? "read" : raw;
    if (level === "read" || level === "write") {
      access.push({ integrationId: c.id, level });
    }
  }

  const routing: Record<string, unknown> = {};
  if (transferTo) {
    routing.transferTo = transferTo;
    routing.smsAlerts = formData.get("sms_alerts") === "on";
  }
  if (access.length) routing.calendar = { access };

  // Email transcripts (optional). Stored even when sending isn't wired yet.
  const emailTo = String(formData.get("email_to") ?? "").trim();
  if (formData.get("email_enabled") === "on" && emailTo) {
    routing.emailTranscripts = { enabled: true, to: emailTo };
  }

  // Advanced voice options (Advanced tab). Global speed/stability and a per-
  // language voice map, both fed to the ElevenLabs agent by syncAssistantAgent.
  const speed = Number(formData.get("voice_speed"));
  const stability = Number(formData.get("voice_stability"));
  const voice: Record<string, number> = {};
  if (Number.isFinite(speed)) voice.speed = clamp(speed, 0.7, 1.2);
  if (Number.isFinite(stability)) voice.stability = clamp(stability, 0, 1);
  if (Object.keys(voice).length) routing.voice = voice;

  // Per-language voices. A "lib:<owner>:<id>:<name>" value is a shared Voice-
  // Library pick that must be added to the account before ElevenLabs can speak
  // with it; a plain value is an existing account voice id, used as-is. Imports
  // run in parallel and are deduped so one voice reused across languages is added
  // once. Any that fail to add are reported and simply left unpinned (auto voice).
  const voiceByLanguage: Record<string, string> = {};
  const voiceImportFailures: string[] = [];
  const importCache = new Map<string, Promise<string | null>>();
  const importOnce = (owner: string, voiceId: string, name: string): Promise<string | null> => {
    const cacheKey = `${owner}:${voiceId}`;
    let pending = importCache.get(cacheKey);
    if (!pending) {
      pending = addSharedVoice(owner, voiceId, name);
      importCache.set(cacheKey, pending);
    }
    return pending;
  };

  await Promise.all(
    SUPPORTED_LANGUAGES.map(async (lang) => {
      const raw = String(formData.get(`voice_lang_${lang}`) ?? "").trim();
      if (!raw) return;
      if (!raw.startsWith("lib:")) {
        voiceByLanguage[lang] = raw;
        return;
      }
      const [, owner, voiceId, encName] = raw.split(":");
      if (!owner || !voiceId) return;
      const accountId = await importOnce(owner, voiceId, libVoiceName(encName, lang));
      if (accountId) voiceByLanguage[lang] = accountId;
      else voiceImportFailures.push(lang);
    }),
  );
  if (Object.keys(voiceByLanguage).length) routing.voiceByLanguage = voiceByLanguage;

  // CRM / ERP push (optional).
  const crmUrl = String(formData.get("crm_url") ?? "").trim();
  if (formData.get("crm_enabled") === "on" && crmUrl) {
    if (!isSafeHttpsUrl(crmUrl)) {
      redirect(
        `/dashboard/assistant/${id}?error=${encodeURIComponent("CRM URL must be a public https:// address.")}`,
      );
    }
    const crmSecret = String(formData.get("crm_secret") ?? "").trim();
    routing.crm = { enabled: true, url: crmUrl, ...(crmSecret ? { secret: crmSecret } : {}) };
  }

  // Knowledge lives at the organization level now; preserve whatever this
  // assistant already has untouched (this form only edits behavior + routing).
  const existing = await getAssistant(id).catch(() => null);
  const knowledge = readKnowledge(existing?.knowledge);

  try {
    await updateAssistant(id, {
      name: String(formData.get("name") ?? "").trim() || "My assistant",
      greeting: String(formData.get("greeting") ?? "").trim(),
      system_prompt: String(formData.get("system_prompt") ?? "").trim(),
      voice_id: String(formData.get("voice_id") ?? "").trim(),
      language: String(formData.get("language") ?? "en").trim() || "en",
      knowledge: { ...knowledge },
      routing,
    });
  } catch (err) {
    redirect(`/dashboard/assistant/${id}?error=${encodeURIComponent((err as Error).message)}`);
  }

  // Push the edited settings (greeting, prompt, voice, language, knowledge) to
  // the managed ElevenLabs agent, creating it if this assistant has none yet.
  try {
    await syncAssistantAgent(id);
  } catch (err) {
    console.error("[assistant] agent sync failed on update", err);
    redirect(
      `/dashboard/assistant/${id}?error=${encodeURIComponent(`Saved, but updating the voice agent failed: ${(err as Error).message}`)}`,
    );
  }

  revalidatePath(`/dashboard/assistant/${id}`);
  revalidatePath("/dashboard/assistant");
  if (voiceImportFailures.length) {
    redirect(
      `/dashboard/assistant/${id}?notice=${encodeURIComponent(
        `Saved. Couldn't add ${voiceImportFailures.length} library voice(s) to your ElevenLabs account (${voiceImportFailures.join(", ")}); those languages use the default voice.`,
      )}`,
    );
  }
  redirect(`/dashboard/assistant/${id}?saved=1`);
}

export async function deleteAssistantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");
  await requireAssistantOwner(id);

  // Capture the managed-agent refs before the row is gone so we can tear the
  // ElevenLabs agent + its knowledge down too.
  const existing = await getAssistant(id).catch(() => null);

  try {
    // Soft-delete the assistant FIRST, then return its numbers to the shared pool.
    // If the delete fails, the numbers stay linked - never expose a still-live
    // assistant's numbers to the pool, where another assistant could claim and
    // re-route them away. Surface any failure instead of reporting a partial
    // delete as success.
    await deleteAssistant(id);
    await freeAssistantNumbers(id);
    // ponytail: freed numbers keep their (now-deleted) ElevenLabs agent assigned
    // until reclaimed, when getAgentNumberAction reassigns them. Eagerly unassign
    // here if a freed-but-unreclaimed number ringing a dead agent becomes an issue.
  } catch (err) {
    redirect(`/dashboard/assistant/${id}?error=${encodeURIComponent((err as Error).message)}`);
  }

  // Best-effort teardown of the ElevenLabs agent + uploaded knowledge. Never
  // block the delete on it - the DB row is already gone.
  if (existing) {
    await deleteAssistantAgent(existing).catch((err) =>
      console.error("[assistant] agent teardown failed", err),
    );
  }

  revalidatePath("/dashboard/assistant");
  redirect("/dashboard/assistant");
}

// ── Phone number for an assistant ───────────────────────────────────────────

/**
 * "Get number": give this assistant a working phone line end to end. Reuses a
 * spare number from the shared pool when one is free, and only buys a brand-new
 * Twilio number when the pool has none - so freed numbers get recycled instead of
 * racking up Twilio charges. Either way the number is imported into ElevenLabs and
 * this assistant's managed agent is assigned as its inbound agent, so callers
 * reach this assistant's config. One click, fully serverless (ElevenLabs runs the
 * call). Buying a new number needs valid Twilio credentials.
 */
export async function getAgentNumberAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("assistant_id") ?? "");
  const country = String(formData.get("country") ?? "US").trim() || "US";
  if (!assistantId) redirect("/dashboard/assistant");
  await requireAssistantOwner(assistantId);

  // Idempotency: if this assistant already has a number, don't attach a second
  // one - a double-click, a retry, or a concurrent submit would otherwise
  // double-consume the pool or double-buy from Twilio. Checked BEFORE the try so
  // its redirect (NEXT_REDIRECT) isn't swallowed by the catch.
  const existingNumber = await getAssistantNumber(assistantId).catch(() => null);
  if (existingNumber) {
    revalidatePath(`/dashboard/assistant/${assistantId}`);
    redirect(`/dashboard/assistant/${assistantId}?saved=1`);
  }

  const allowance = await canAssignNumber(await currentUserId());
  if (!allowance.ok) {
    redirect(`/dashboard/assistant/${assistantId}?notice=${encodeURIComponent(allowance.reason ?? "")}`);
  }

  try {
    // Make sure this assistant has its managed agent before we point a number at it.
    const assistant = await getAssistant(assistantId);
    const agentId =
      assistant?.elevenlabs_agent_id ?? (await syncAssistantAgent(assistantId));

    // 1) Reuse first: atomically claim a free pooled number if one exists. Only
    //    when the pool is empty do we buy a new one from Twilio (without our
    //    webhook - the ElevenLabs import owns routing once assigned).
    let numberId: string;
    let e164: string;
    const claimed = await claimFreeNumber(assistantId);
    if (claimed) {
      numberId = claimed.id;
      e164 = claimed.e164;
    } else {
      const bought = await buyTwilioNumber({ country }, { configureWebhook: false });
      numberId = await createNumber({ e164: bought.e164, twilioSid: bought.sid, assistantId });
      e164 = bought.e164;
    }

    // 2) Import into ElevenLabs (if needed) + assign THIS assistant's agent, then
    //    record the ElevenLabs phone-number id. If routing fails, unlink the number
    //    so it returns to the shared pool instead of being stranded attached-but-
    //    unrouted (which would falsely show as "connected" while calls fail, and
    //    drain the pool). A retry then reuses the very same number.
    let elevenLabsPhoneNumberId: string;
    try {
      elevenLabsPhoneNumberId = await routeNumberToAgent(e164, agentId ?? undefined, numberId);
    } catch (routeErr) {
      // Routing itself failed - the number isn't answering as this assistant in
      // ElevenLabs, so return it to the pool. Only here: a failure AFTER routing
      // succeeded must not unlink a number that's already live (that would leave
      // ElevenLabs ringing this assistant while the pool re-offers the number).
      await setNumberAssistant(numberId, null).catch((e) =>
        console.error("[assistant] release number after route failure", e),
      );
      throw routeErr;
    }
    // Routing committed in ElevenLabs. Persist the phone-number id best-effort - a
    // DB hiccup here must NOT unlink the number (it's already answering as this
    // assistant); the id is only a cache for faster release/re-route and can be
    // re-derived by lookup.
    await setNumberElevenLabsId(numberId, elevenLabsPhoneNumberId).catch((e) =>
      console.error("[assistant] persist ElevenLabs phone id failed (number is routed)", e),
    );
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
}

/** Enable or disable an assistant from the list (quick toggle). */
export async function toggleAssistantEnabledAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");
  await requireAssistantOwner(id);
  const enabled = String(formData.get("enabled") ?? "") === "1";
  try {
    await setAssistantEnabled(id, enabled);
  } catch (err) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath("/dashboard/assistant");
  redirect("/dashboard/assistant");
}

export async function testCallAction(formData: FormData): Promise<void> {
  // Works both from the dedicated Test-call form (assistant_id/to) and from the
  // settings form's "Test call this number" button (id/transfer_to). The
  // ElevenLabs agent places an outbound call to `to` - the whole runtime (voice
  // + brain) is ElevenLabs; no media server involved.
  const assistantId = String(formData.get("assistant_id") ?? formData.get("id") ?? "");
  const to = String(formData.get("to") ?? formData.get("transfer_to") ?? "").trim();
  if (!assistantId) redirect("/dashboard/assistant");
  await requireAssistantOwner(assistantId);
  if (!E164.test(to)) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("Enter a number in E.164 format, e.g. +14155550142")}`,
    );
  }

  try {
    // Test the ACTUAL assistant, not the demo agent: place the call as this
    // assistant's managed ElevenLabs agent, from its connected number when it has
    // one (so both the persona and caller ID match). Sync builds the agent if the
    // assistant hasn't been synced yet; the from-number falls back to the demo
    // outbound number (env) when the assistant has no number of its own.
    const assistant = await getAssistant(assistantId).catch(() => null);
    const agentId =
      assistant?.elevenlabs_agent_id ?? (await syncAssistantAgent(assistantId));
    const number = await getAssistantNumber(assistantId).catch(() => null);
    await placeAgentCall(to, {
      agentId: agentId ?? undefined,
      agentPhoneNumberId: number?.elevenlabs_phone_number_id ?? undefined,
    });
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect(`/dashboard/assistant/${assistantId}?calling=1`);
}

export async function unlinkNumberAction(formData: FormData): Promise<void> {
  const numberId = String(formData.get("number_id") ?? "");
  const assistantId = String(formData.get("assistant_id") ?? "");
  if (!assistantId) redirect("/dashboard/assistant");
  await requireAssistantOwner(assistantId);

  // The number must actually belong to this assistant - otherwise a caller could
  // unlink an arbitrary number by id.
  const number = await getAssistantNumber(assistantId).catch(() => null);
  if (!number || !numberId || number.id !== numberId) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("That number isn't linked to this assistant.")}`,
    );
  }

  try {
    await setNumberAssistant(numberId, null);
    // Detach the agent in ElevenLabs too, or the number keeps answering as this
    // assistant despite the dashboard showing it unlinked. Best-effort: the DB
    // unlink already succeeded, so a provider hiccup must not fail the action.
    await releaseNumberFromAgent(number.e164, number.elevenlabs_phone_number_id).catch((e) =>
      console.error("[assistant] ElevenLabs release on unlink failed", e),
    );
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
}

export async function registerCnamAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("id") ?? formData.get("assistant_id") ?? "");
  if (!assistantId) redirect("/dashboard/assistant");
  await requireAssistantOwner(assistantId);

  const assistant = await getAssistant(assistantId).catch(() => null);
  if (!assistant) redirect("/dashboard/assistant");

  const number = await getAssistantNumber(assistantId).catch(() => null);
  const phoneSid = number?.twilio_sid ?? "";
  if (!phoneSid) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("Add a Twilio number to this assistant before registering CNAM.")}`,
    );
  }

  let displayName = "";
  try {
    const res = await registerCnam({ displayName: assistant.name, phoneSid });
    displayName = res.displayName;
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  redirect(`/dashboard/assistant/${assistantId}?cnam=${encodeURIComponent(displayName)}`);
}
