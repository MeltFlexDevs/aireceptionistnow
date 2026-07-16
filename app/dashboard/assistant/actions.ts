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
import { SUPPORTED_LANGUAGES } from "@/lib/call-engine/voice/phone-language";
import { addSharedVoice } from "@/lib/call-engine/voice/catalog";

const E164 = /^\+[1-9]\d{6,15}$/;
const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));

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

async function requireAssistantOwner(assistantId: string): Promise<void> {
  if (!authConfigured()) return;
  const ownerId = await currentUserId();
  const assistant = assistantId
    ? await getAssistant(assistantId).catch(() => null)
    : null;
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

  try {
    await syncAssistantAgent(id);
  } catch (err) {
    console.error("[assistant] agent sync failed on create", err);
    redirect(
      `/dashboard/assistant/${id}?error=${encodeURIComponent(`Assistant saved, but setting up its voice agent failed: ${(err as Error).message}`)}`,
    );
  }

  revalidatePath("/dashboard/assistant");
  redirect(`/dashboard/assistant/${id}`);
}

export async function updateAssistantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");
  await requireAssistantOwner(id);

  const transferTo = String(formData.get("transfer_to") ?? "").trim();

  const integrations = await listIntegrations((await currentUserId()) ?? undefined).catch(() => []);
  const access: Array<{ integrationId: string; level: string }> = [];
  for (const c of integrations) {
    if (c.type !== "calendar") continue;
    const raw = String(formData.get(`cal_access_${c.id}`) ?? "none");
    const level = raw === "busy" ? "read" : raw;
    if (level === "read" || level === "write") {
      access.push({ integrationId: c.id, level });
    }
  }

  const crmTargets: Array<{ integrationId: string }> = [];
  for (const c of integrations) {
    if (c.type !== "crm") continue;
    if (formData.get(`crm_target_${c.id}`) === "on") crmTargets.push({ integrationId: c.id });
  }

  const routing: Record<string, unknown> = {};
  if (transferTo) {
    routing.transferTo = transferTo;
    routing.smsAlerts = formData.get("sms_alerts") === "on";
  }
  if (access.length) routing.calendar = { access };
  if (crmTargets.length) routing.crm = { targets: crmTargets };

  // Email transcripts (optional). Stored even when sending isn't wired yet.
  const emailTo = String(formData.get("email_to") ?? "").trim();
  if (formData.get("email_enabled") === "on" && emailTo) {
    routing.emailTranscripts = { enabled: true, to: emailTo };
  }

  const speed = Number(formData.get("voice_speed"));
  const stability = Number(formData.get("voice_stability"));
  const voice: Record<string, number> = {};
  if (Number.isFinite(speed)) voice.speed = clamp(speed, 0.7, 1.2);
  if (Number.isFinite(stability)) voice.stability = clamp(stability, 0, 1);
  if (Object.keys(voice).length) routing.voice = voice;

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

  const existing = await getAssistant(id).catch(() => null);

  try {
    await deleteAssistant(id);
    await freeAssistantNumbers(id);
  } catch (err) {
    redirect(`/dashboard/assistant/${id}?error=${encodeURIComponent((err as Error).message)}`);
  }

  if (existing) {
    await deleteAssistantAgent(existing).catch((err) =>
      console.error("[assistant] agent teardown failed", err),
    );
  }

  revalidatePath("/dashboard/assistant");
  redirect("/dashboard/assistant");
}

// ── Phone number for an assistant ───────────────────────────────────────────

export async function getAgentNumberAction(formData: FormData): Promise<void> {
  const assistantId = String(formData.get("assistant_id") ?? "");
  const country = String(formData.get("country") ?? "US").trim() || "US";
  if (!assistantId) redirect("/dashboard/assistant");
  await requireAssistantOwner(assistantId);

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

    let elevenLabsPhoneNumberId: string;
    try {
      elevenLabsPhoneNumberId = await routeNumberToAgent(e164, agentId ?? undefined, numberId);
    } catch (routeErr) {
      await setNumberAssistant(numberId, null).catch((e) =>
        console.error("[assistant] release number after route failure", e),
      );
      throw routeErr;
    }
    await setNumberElevenLabsId(numberId, elevenLabsPhoneNumberId).catch((e) =>
      console.error("[assistant] persist ElevenLabs phone id failed (number is routed)", e),
    );
  } catch (err) {
    redirect(`/dashboard/assistant/${assistantId}?error=${encodeURIComponent((err as Error).message)}`);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  redirect(`/dashboard/assistant/${assistantId}?saved=1`);
}

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

  const number = await getAssistantNumber(assistantId).catch(() => null);
  if (!number || !numberId || number.id !== numberId) {
    redirect(
      `/dashboard/assistant/${assistantId}?error=${encodeURIComponent("That number isn't linked to this assistant.")}`,
    );
  }

  try {
    await setNumberAssistant(numberId, null);
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
