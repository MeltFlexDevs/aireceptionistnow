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
import { buildAssistantPatch } from "@/lib/dashboard/assistant-patch";
import { getDictionary } from "@/lib/i18n/server";
import { ok, fail, type ActionState } from "@/lib/dashboard/action-state";
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

/**
 * Each topic modal posts only its own section, so this must stay a patch (see
 * lib/dashboard/assistant-patch.ts). The agent sync is awaited on purpose: the
 * modal shows a pending state until it resolves, so a failure reaches the user
 * instead of a server log.
 */
export async function updateAssistantAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const a = (await getDictionary()).assistants;
  const id = String(formData.get("id") ?? "");
  if (!id) return fail(a.saveFailed);
  await requireAssistantOwner(id);

  const integrations = await listIntegrations((await currentUserId()) ?? undefined).catch(() => []);

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

  const existing = await getAssistant(id).catch(() => null);
  if (!existing) return fail(a.saveFailed);
  const knowledge = readKnowledge(existing.knowledge);

  // Patch, not rebuild: only sections this submit actually carried change.
  // See lib/dashboard/assistant-patch.ts and its regression suite.
  const { top, routing } = buildAssistantPatch(
    formData,
    {
      name: existing.name,
      greeting: existing.greeting,
      system_prompt: existing.system_prompt,
      voice_id: existing.voice_id,
      language: existing.language,
      routing: (existing.routing ?? {}) as Record<string, unknown>,
    },
    {
      calendarIds: integrations.filter((c) => c.type === "calendar").map((c) => c.id),
      crmIds: integrations.filter((c) => c.type === "crm").map((c) => c.id),
    },
    voiceByLanguage,
  );

  try {
    await updateAssistant(id, {
      ...top,
      knowledge: { ...knowledge },
      routing,
    });
  } catch {
    return fail(a.saveFailed);
  }

  // Awaited, not fire-and-forget: rapid saves must serialize (last write wins
  // on the live agent) and a failure has to reach the user.
  try {
    await syncAssistantAgent(id);
  } catch (err) {
    console.error("[assistant] agent sync failed on update", err);
    return fail(a.savedButSyncFailed);
  }

  revalidatePath(`/dashboard/assistant/${id}`);
  revalidatePath("/dashboard/assistant");
  // A library voice that could not be imported is worth saying out loud - that
  // language quietly falls back to the default voice.
  if (voiceImportFailures.length) {
    return ok(a.savedVoiceImportFailed.replace("{languages}", voiceImportFailures.join(", ")));
  }
  return ok(a.settingsSaved);
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

export async function getAgentNumberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const a = (await getDictionary()).assistants;
  const assistantId = String(formData.get("assistant_id") ?? "");
  const country = String(formData.get("country") ?? "US").trim() || "US";
  if (!assistantId) return fail(a.saveFailed);
  await requireAssistantOwner(assistantId);

  const existingNumber = await getAssistantNumber(assistantId).catch(() => null);
  if (existingNumber) {
    revalidatePath(`/dashboard/assistant/${assistantId}`);
    return ok(a.numberReady);
  }

  const allowance = await canAssignNumber(await currentUserId());
  if (!allowance.ok) return fail(allowance.reason || a.saveFailed);

  try {
    // Make sure this assistant has its managed agent before we point a number at it.
    const assistant = await getAssistant(assistantId);
    const agentId =
      assistant?.elevenlabs_agent_id ?? (await syncAssistantAgent(assistantId));

    let numberId: string;
    let e164: string;
    // Prefer a pool number for the chosen country; fall back to any available
    // pool number before purchasing a new one.
    const claimed =
      (await claimFreeNumber(assistantId, country)) ?? (await claimFreeNumber(assistantId));
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
    console.error("[assistant] get number failed", err);
    return fail(a.numberFailed);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  revalidatePath("/dashboard");
  return ok(a.numberReady);
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
  // No redirect: the toggle is optimistic client-side; revalidate is enough.
  // The overview hero exposes the same switch, so refresh it too.
  revalidatePath("/dashboard/assistant");
  revalidatePath("/dashboard");
}

export async function testCallAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const a = (await getDictionary()).assistants;
  const assistantId = String(formData.get("assistant_id") ?? formData.get("id") ?? "");
  const to = String(formData.get("to") ?? formData.get("transfer_to") ?? "").trim();
  if (!assistantId) return fail(a.saveFailed);
  await requireAssistantOwner(assistantId);
  // "E.164" is a spec name, not something to put in front of a business owner.
  if (!E164.test(to)) return fail(a.badPhoneFormat);

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
    console.error("[assistant] test call failed", err);
    return fail(a.testCallFailed);
  }

  return ok(a.callingYou);
}

export async function unlinkNumberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const a = (await getDictionary()).assistants;
  const numberId = String(formData.get("number_id") ?? "");
  const assistantId = String(formData.get("assistant_id") ?? "");
  if (!assistantId) return fail(a.saveFailed);
  await requireAssistantOwner(assistantId);

  const number = await getAssistantNumber(assistantId).catch(() => null);
  if (!number || !numberId || number.id !== numberId) return fail(a.numberNotLinked);

  try {
    await setNumberAssistant(numberId, null);
    await releaseNumberFromAgent(number.e164, number.elevenlabs_phone_number_id).catch((e) =>
      console.error("[assistant] ElevenLabs release on unlink failed", e),
    );
  } catch (err) {
    console.error("[assistant] unlink failed", err);
    return fail(a.saveFailed);
  }
  revalidatePath(`/dashboard/assistant/${assistantId}`);
  revalidatePath("/dashboard");
  return ok(a.numberUnlinked);
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
