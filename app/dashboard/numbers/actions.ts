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

const E164 = z
  .string()
  .regex(/^\+[1-9]\d{6,15}$/, "Use E.164 format, e.g. +14155550142");

/**
 * Reject the request unless the caller owns this number (via its assistant's
 * owner). Server Actions are public POST endpoints (Next only enforces
 * same-origin, not auth), and the DB helpers filter by id, not owner - without
 * this any signed-in visitor could re-route, disable or delete another tenant's
 * live line by posting its id. Blocks only genuine cross-tenant access: a number
 * held by an OWNED assistant whose owner isn't the caller. A pooled/unassigned
 * number (or one held by an unowned assistant) is single-tenant territory and
 * allowed, same rule as requireAssistantOwner in the assistant actions. In
 * deploys with auth disabled (authConfigured() === false) ownership isn't
 * enforced.
 *
 * Redirects (which throw NEXT_REDIRECT) on failure - call it BEFORE any
 * try/catch so the redirect isn't swallowed.
 */
async function requireNumberOwner(id: string): Promise<void> {
  if (!authConfigured()) return;
  const userId = await currentUserId();
  const number = id ? await getNumber(id).catch(() => null) : null;
  // Distinguish a lookup FAILURE from a genuinely missing assistant: a thrown
  // error resolves to `undefined` (fail closed - don't authorize on a transient
  // DB hiccup), while `null` means no such assistant. A soft-delete leaves
  // phone_numbers.assistant_id dangling, so a null lookup is a legit unowned
  // number and stays allowed (same single-tenant rule as requireAssistantOwner).
  const assistant = number?.assistant_id
    ? await getAssistant(number.assistant_id).catch(() => undefined)
    : null;
  if (
    !number ||
    assistant === undefined ||
    (assistant?.owner_id && assistant.owner_id !== userId)
  ) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent("Not authorized.")}`);
  }
}

export async function addNumberAction(formData: FormData): Promise<void> {
  const e164 = String(formData.get("e164") ?? "").trim();
  const parsed = E164.safeParse(e164);
  if (!parsed.success) {
    redirect(
      `/dashboard/numbers?error=${encodeURIComponent(parsed.error.issues[0].message)}`,
    );
  }

  // Connecting a number still adds a billed line to the account - enforce the
  // plan's number quota and an active subscription, same gate as
  // getAgentNumberAction. countPending so the newly-added UNASSIGNED line presses
  // against the quota (usage.numbers only counts assistant-linked numbers, so
  // without this repeated connects would blow the limit). Before the try/catches
  // so the redirect isn't swallowed.
  const allowance = await canAssignNumber(await currentUserId(), { countPending: true });
  if (!allowance.ok) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent(allowance.reason ?? "")}`);
  }

  // Connect it if the Twilio account already owns it (and point its webhook at
  // us), otherwise provision that exact number. Skipped if Twilio isn't set up.
  let sid: string | null = null;
  try {
    sid = (await ensureTwilioNumber(parsed.data)).sid;
  } catch (err) {
    redirect(
      `/dashboard/numbers?error=${encodeURIComponent(`Couldn't set up ${parsed.data} in Twilio: ${(err as Error).message}. Use "Buy a new number" to get an available one.`)}`,
    );
  }

  let id: string;
  try {
    id = await createNumber({ e164: parsed.data, twilioSid: sid ?? undefined });
  } catch (err) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent((err as Error).message)}`);
  }

  revalidatePath("/dashboard/numbers");
  redirect(`/dashboard/numbers/${id}`);
}

export async function buyNumberAction(formData: FormData): Promise<void> {
  const country = String(formData.get("country") ?? "US").trim() || "US";
  const areaCode = String(formData.get("area_code") ?? "").trim();

  // Buying provisions a real Twilio number with recurring charges - enforce the
  // plan's number quota and an active subscription BEFORE spending money, same
  // gate as getAgentNumberAction. countPending so each bought (UNASSIGNED) line
  // presses against the quota - usage.numbers counts only assistant-linked
  // numbers, so without this a subscribed user could buy unlimited lines. Without
  // the gate any signed-in user (even one who never checked out) could provision.
  const allowance = await canAssignNumber(await currentUserId(), { countPending: true });
  if (!allowance.ok) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent(allowance.reason ?? "")}`);
  }

  let bought: BoughtNumber;
  try {
    // ElevenLabs owns routing once the number is connected to an assistant, so
    // don't point Twilio at our app here.
    bought = await buyTwilioNumber(
      { country, areaCode: areaCode || undefined },
      { configureWebhook: false },
    );
  } catch (err) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent((err as Error).message)}`);
  }

  let id: string;
  try {
    id = await createNumber({ e164: bought.e164, twilioSid: bought.sid });
  } catch (err) {
    redirect(`/dashboard/numbers?error=${encodeURIComponent((err as Error).message)}`);
  }

  // Import the freshly bought number into ElevenLabs right away - unassigned (no
  // assistant yet), labeled with our number id so it's traceable in the ElevenLabs
  // dashboard. Best-effort: if the import fails (e.g. Twilio auth token missing),
  // the number is still bought and pooled, and gets imported when it's connected
  // to an assistant.
  try {
    const elevenLabsPhoneNumberId = await importTwilioNumber(bought.e164, { label: id });
    await setNumberElevenLabsId(id, elevenLabsPhoneNumberId);
  } catch (err) {
    console.error("[numbers] ElevenLabs import on buy failed", err);
  }

  revalidatePath("/dashboard/numbers");
  redirect(`/dashboard/numbers/${id}`);
}

export async function setAssistantAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const assistantId = String(formData.get("assistant_id") ?? "");
  if (id) {
    // Ownership + quota gates BEFORE the try so their redirects (NEXT_REDIRECT)
    // aren't swallowed by the catch below.
    await requireNumberOwner(id);
    if (assistantId) {
      // The target assistant must be the caller's too (same rule as
      // toggleAssistantOrganizationAction) - otherwise a caller could route
      // their number to, or hijack numbers for, another tenant's assistant.
      const target = await getAssistant(assistantId).catch(() => null);
      if (!target) {
        redirect(`/dashboard/numbers/${id}?error=${encodeURIComponent("Assistant not found.")}`);
      }
      if (authConfigured() && target.owner_id && target.owner_id !== (await currentUserId())) {
        redirect(
          `/dashboard/numbers/${id}?error=${encodeURIComponent("You don't own that assistant.")}`,
        );
      }
      // Claiming a pooled (unassigned) number counts against the plan's number
      // quota, exactly like getAgentNumberAction. Re-pointing a number the
      // caller already holds doesn't change usage, so it's exempt.
      const current = await getNumber(id).catch(() => null);
      if (!current?.assistant_id) {
        const allowance = await canAssignNumber(await currentUserId());
        if (!allowance.ok) {
          redirect(`/dashboard/numbers/${id}?error=${encodeURIComponent(allowance.reason ?? "")}`);
        }
      }
    }
    try {
      await setNumberAssistant(id, assistantId || null);
      // Point the phone number at the chosen assistant's managed ElevenLabs
      // agent so inbound calls answer with THAT assistant's config. Ensure the
      // agent exists first (sync builds it if this is the assistant's first use).
      if (assistantId) {
        const [number, assistant] = await Promise.all([
          getNumber(id),
          getAssistant(assistantId),
        ]);
        const agentId =
          assistant?.elevenlabs_agent_id ?? (await syncAssistantAgent(assistantId));
        if (number?.e164) {
          const elevenLabsPhoneNumberId = await routeNumberToAgent(
            number.e164,
            agentId ?? undefined,
            id,
          );
          await setNumberElevenLabsId(id, elevenLabsPhoneNumberId);
        }
      } else {
        // Unassigned: detach the ElevenLabs agent so the number stops answering
        // as the assistant we just removed (the DB unlink alone doesn't).
        const number = await getNumber(id).catch(() => null);
        if (number?.e164) {
          await releaseNumberFromAgent(
            number.e164,
            number.elevenlabs_phone_number_id,
          ).catch((e) => console.error("[numbers] ElevenLabs release on unassign failed", e));
        }
      }
    } catch (err) {
      console.error("[numbers] assign assistant/agent failed", err);
      redirect(
        `/dashboard/numbers/${id}?error=${encodeURIComponent(`Couldn't connect the number to the assistant: ${(err as Error).message}`)}`,
      );
    }
    revalidatePath(`/dashboard/numbers/${id}`);
  }
  redirect(`/dashboard/numbers/${id}?saved=1`);
}

export async function updateNumberAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard/numbers");
  await requireNumberOwner(id);

  const enabled = formData.get("enabled") === "on";
  try {
    await updateNumber(id, { enabled });
    // Keep ElevenLabs routing in sync with the toggle. EL routing is independent
    // of our `enabled` flag, so without this a "disabled" number keeps answering.
    // Disable → detach the agent; enable → reattach the linked assistant's agent.
    // Best-effort: the DB toggle is authoritative for the dashboard.
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
      `/dashboard/numbers/${id}?error=${encodeURIComponent((err as Error).message)}`,
    );
  }

  revalidatePath(`/dashboard/numbers/${id}`);
  revalidatePath("/dashboard/numbers");
  redirect(`/dashboard/numbers/${id}?saved=1`);
}

export async function deleteNumberAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    // Deleting releases the Twilio number and removes it from ElevenLabs - a
    // cross-tenant delete would destroy another tenant's live line for good.
    await requireNumberOwner(id);
    // Remove the number from ElevenLabs (delete the imported number entirely) and
    // release it from Twilio (stop billing) before dropping the row - otherwise a
    // "deleted" number keeps costing money and lingering in ElevenLabs. Best-
    // effort: a provider hiccup must not block removing it from the dashboard.
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
    revalidatePath("/dashboard/numbers");
  }
  redirect("/dashboard/numbers");
}
