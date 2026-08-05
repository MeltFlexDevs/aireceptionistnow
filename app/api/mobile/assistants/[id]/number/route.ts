import { revalidatePath } from "next/cache";

import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { releaseNumberFromAgent, routeNumberToAgent } from "@/lib/call-engine/elevenlabs";
import {
  claimFreeNumber,
  createNumber,
  getAssistant,
  getAssistantNumber,
  setNumberAssistant,
  setNumberElevenLabsId,
} from "@/lib/dashboard/db";
import { canAssignNumber } from "@/lib/dashboard/plan";
import { buyTwilioNumber } from "@/lib/dashboard/twilio";
import { mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Give this receptionist a phone number, or take it away.
 *
 * A faithful port of `getAgentNumberAction` / `unlinkNumberAction`, right down
 * to releasing the number again if ElevenLabs refuses to route it - a number
 * left assigned to an agent that never received it is invisible to the owner
 * and silently eats the plan's number allowance.
 */

async function owned(id: string, userId: string) {
  const assistant = await getAssistant(id).catch(() => null);
  if (!assistant) return null;
  if (assistant.owner_id && assistant.owner_id !== userId) return null;
  return assistant;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const assistant = await owned(id, userId);
  if (!assistant) return Response.json({ error: "Not found." }, { status: 404 });

  let country = "US";
  try {
    const raw = String(((await req.json()) as { country?: unknown }).country ?? "").trim();
    if (/^[A-Za-z]{2}$/.test(raw)) country = raw.toUpperCase();
  } catch {
    // Default country is fine.
  }

  const existing = await getAssistantNumber(id).catch(() => null);
  if (existing) return Response.json({ e164: existing.e164, id: existing.id });

  const allowance = await canAssignNumber(userId);
  if (!allowance.ok) {
    return Response.json({ error: allowance.reason || "Could not add a number." }, { status: 403 });
  }

  try {
    const agentId = assistant.elevenlabs_agent_id ?? (await syncAssistantAgent(id));

    let numberId: string;
    let e164: string;
    // Prefer a pool number for the chosen country, then any pool number, and
    // only then buy - a purchase is the one step here that costs money.
    const claimed = (await claimFreeNumber(id, country)) ?? (await claimFreeNumber(id));
    if (claimed) {
      numberId = claimed.id;
      e164 = claimed.e164;
    } else {
      const bought = await buyTwilioNumber({ country }, { configureWebhook: false });
      numberId = await createNumber({ e164: bought.e164, twilioSid: bought.sid, assistantId: id });
      e164 = bought.e164;
    }

    let elevenLabsPhoneNumberId: string;
    try {
      elevenLabsPhoneNumberId = await routeNumberToAgent(e164, agentId ?? undefined, numberId);
    } catch (routeErr) {
      await setNumberAssistant(numberId, null).catch((e) =>
        console.error("[mobile:number] release after route failure", e),
      );
      throw routeErr;
    }
    await setNumberElevenLabsId(numberId, elevenLabsPhoneNumberId).catch((e) =>
      console.error("[mobile:number] persist ElevenLabs phone id failed (number is routed)", e),
    );

    revalidatePath(`/dashboard/assistant/${id}`);
    revalidatePath("/dashboard");
    return Response.json({ e164, id: numberId });
  } catch (err) {
    console.error("[mobile:number-claim]", err);
    return Response.json({ error: "Could not get a number right now." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  if (!(await owned(id, userId))) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const number = await getAssistantNumber(id).catch(() => null);
  if (!number) return Response.json({ error: "No number is linked." }, { status: 404 });

  try {
    await setNumberAssistant(number.id, null);
    await releaseNumberFromAgent(number.e164, number.elevenlabs_phone_number_id).catch((e) =>
      console.error("[mobile:number] ElevenLabs release on unlink failed", e),
    );
  } catch (err) {
    console.error("[mobile:number-unlink]", err);
    return Response.json({ error: "Could not unlink." }, { status: 500 });
  }

  revalidatePath(`/dashboard/assistant/${id}`);
  revalidatePath("/dashboard");
  return Response.json({ ok: true });
}
