"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createNumber,
  deleteNumber,
  getAssistant,
  getNumber,
  setNumberAssistant,
  setNumberElevenLabsId,
  updateNumber,
} from "@/lib/dashboard/db";
import {
  buyTwilioNumber,
  ensureTwilioNumber,
  releaseTwilioNumber,
  type BoughtNumber,
} from "@/lib/dashboard/twilio";
import {
  deleteImportedNumber,
  importTwilioNumber,
  releaseNumberFromAgent,
  routeNumberToAgent,
} from "@/lib/call-engine/elevenlabs";
import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { canAssignNumber } from "@/lib/dashboard/plan";
import { getDictionary } from "@/lib/i18n/server";
import { ok, fail, type ActionState } from "@/lib/dashboard/action-state";

const E164 = z
  .string()
  .regex(/^\+[1-9]\d{6,15}$/, "Use E.164 format, e.g. +14155550142");

async function requireNumberOwner(id: string): Promise<void> {
  if (!authConfigured()) return;
  const userId = await currentUserId();
  const number = id ? await getNumber(id).catch(() => null) : null;
  const assistant = number?.assistant_id
    ? await getAssistant(number.assistant_id).catch(() => undefined)
    : null;
  if (
    !number ||
    assistant === undefined ||
    (assistant?.owner_id && assistant.owner_id !== userId)
  ) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent("Not authorized.")}`);
  }
}

export async function addNumberAction(formData: FormData): Promise<void> {
  const e164 = String(formData.get("e164") ?? "").trim();
  const parsed = E164.safeParse(e164);
  if (!parsed.success) {
    redirect(
      `/dashboard/assistant?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  const allowance = await canAssignNumber(await currentUserId(), { countPending: true });
  if (!allowance.ok) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent(allowance.reason ?? "")}`);
  }

  let sid: string | null = null;
  try {
    sid = (await ensureTwilioNumber(parsed.data)).sid;
  } catch (err) {
    redirect(
      `/dashboard/assistant?error=${encodeURIComponent(`Couldn't set up ${parsed.data} in Twilio: ${(err as Error).message}. Use "Buy a new number" to get an available one.`)}`,
    );
  }

  try {
    await createNumber({ e164: parsed.data, twilioSid: sid ?? undefined });
  } catch (err) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/assistant");
  redirect("/dashboard/assistant");
}

export async function buyNumberAction(formData: FormData): Promise<void> {
  const country = String(formData.get("country") ?? "US").trim() || "US";
  const areaCode = String(formData.get("area_code") ?? "").trim();

  const allowance = await canAssignNumber(await currentUserId(), { countPending: true });
  if (!allowance.ok) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent(allowance.reason ?? "")}`);
  }

  let bought: BoughtNumber;
  try {
    bought = await buyTwilioNumber(
      { country, areaCode: areaCode || undefined },
      { configureWebhook: false },
    );
  } catch (err) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent((err as Error).message)}`);
  }

  let id: string;
  try {
    id = await createNumber({ e164: bought.e164, twilioSid: bought.sid });
  } catch (err) {
    redirect(`/dashboard/assistant?error=${encodeURIComponent((err as Error).message)}`);
  }

  try {
    const elevenLabsPhoneNumberId = await importTwilioNumber(bought.e164, { label: id });
    await setNumberElevenLabsId(id, elevenLabsPhoneNumberId);
  } catch (err) {
    console.error("[numbers] ElevenLabs import on buy failed", err);
  }

  revalidatePath("/dashboard/assistant");
  redirect("/dashboard/assistant");
}

/**
 * Reassign a number to a different receptionist. Returns state for an inline
 * pill rather than redirecting - the old version bounced through
 * ?saved=1 and, worse, built its redirect from the NUMBER's id.
 */
export async function setAssistantAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const a = (await getDictionary()).assistants;
  const id = String(formData.get("id") ?? "");
  const assistantId = String(formData.get("assistant_id") ?? "");
  if (!id) return fail(a.saveFailed);

  await requireNumberOwner(id);

  if (assistantId) {
    const target = await getAssistant(assistantId).catch(() => null);
    if (!target) return fail(a.saveFailed);
    if (authConfigured() && target.owner_id && target.owner_id !== (await currentUserId())) {
      return fail(a.notYours);
    }
    const current = await getNumber(id).catch(() => null);
    if (!current?.assistant_id) {
      const allowance = await canAssignNumber(await currentUserId(), { reassign: true });
      if (!allowance.ok) return fail(allowance.reason || a.saveFailed);
    }
  }

  try {
    await setNumberAssistant(id, assistantId || null);
    if (assistantId) {
      const [number, assistant] = await Promise.all([getNumber(id), getAssistant(assistantId)]);
      const agentId = assistant?.elevenlabs_agent_id ?? (await syncAssistantAgent(assistantId));
      if (number?.e164) {
        const elevenLabsPhoneNumberId = await routeNumberToAgent(
          number.e164,
          agentId ?? undefined,
          id,
        );
        await setNumberElevenLabsId(id, elevenLabsPhoneNumberId);
      }
    } else {
      const number = await getNumber(id).catch(() => null);
      if (number?.e164) {
        await releaseNumberFromAgent(number.e164, number.elevenlabs_phone_number_id).catch((e) =>
          console.error("[numbers] ElevenLabs release on unassign failed", e),
        );
      }
    }
  } catch (err) {
    console.error("[numbers] assign assistant/agent failed", err);
    return fail(a.numberConnectFailed);
  }

  revalidatePath("/dashboard/assistant", "layout");
  revalidatePath("/dashboard");
  return ok(assistantId ? a.numberReassigned : a.numberUnlinked);
}

export async function updateNumberAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/assistant");
  await requireNumberOwner(id);

  const enabled = formData.get("enabled") === "on";
  try {
    await updateNumber(id, { enabled });
    const number = await getNumber(id).catch(() => null);
    if (number?.e164) {
      if (!enabled) {
        await releaseNumberFromAgent(number.e164, number.elevenlabs_phone_number_id).catch((e) =>
          console.error("[numbers] ElevenLabs release on disable failed", e),
        );
      } else if (number.assistant_id) {
        const assistant = await getAssistant(number.assistant_id).catch(() => null);
        if (assistant?.elevenlabs_agent_id) {
          await routeNumberToAgent(number.e164, assistant.elevenlabs_agent_id).catch((e) =>
            console.error("[numbers] ElevenLabs re-route on enable failed", e),
          );
        }
      }
    }
  } catch (err) {
    redirect(
      `/dashboard/assistant?error=${encodeURIComponent((err as Error).message)}`,
    );
  }

  revalidatePath("/dashboard/assistant");
  revalidatePath("/dashboard/assistant");
  redirect("/dashboard/assistant");
}

export async function deleteNumberAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await requireNumberOwner(id);
    const number = await getNumber(id).catch(() => null);
    if (number) {
      await deleteImportedNumber(number.e164, number.elevenlabs_phone_number_id).catch((e) =>
        console.error("[numbers] ElevenLabs delete on number delete failed", e),
      );
      if (number.twilio_sid) {
        await releaseTwilioNumber(number.twilio_sid).catch((e) =>
          console.error("[numbers] Twilio release on delete failed", e),
        );
      }
    }
    try {
      await deleteNumber(id);
    } catch {
      // ignore - number may already be gone
    }
    revalidatePath("/dashboard/assistant");
  }
  redirect("/dashboard/assistant");
}
