import { revalidatePath } from "next/cache";

import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { isServedCountry } from "@/lib/call-engine/test-call-limit";
import { releaseNumberFromAgent, routeNumberToAgent } from "@/lib/call-engine/elevenlabs";
import {
  getAssistant,
  getAssistantNumber,
  setNumberAssistant,
  setNumberElevenLabsId,
} from "@/lib/dashboard/db";
import { assignNumber, numberAssignDeps } from "@/lib/dashboard/number-assign";
import { isOwnedBy } from "@/lib/dashboard/ownership";
import { canAssignNumber } from "@/lib/dashboard/plan";
import { mobileAuth } from "@/lib/mobile/auth";

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
  if (!isOwnedBy(assistant.owner_id, userId)) return null;
  return assistant;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = await mobileAuth(req, "number-claim");
  if (auth instanceof Response) return auth;
  const userId = auth;
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

  // Any two letters parse above; only the countries we serve and price can be bought.
  if (!isServedCountry(country)) {
    return Response.json(
      { error: "We do not offer numbers in that country yet.", code: "unsupported_country" },
      { status: 400 },
    );
  }

  const allowance = await canAssignNumber(userId);
  if (!allowance.ok) {
    // `code` tells the app which way out to offer: the paywall for
    // 'plan_required', an upgrade note for 'limit_reached'.
    return Response.json(
      { error: allowance.reason || "Could not add a number.", code: allowance.code ?? "plan_required" },
      { status: 403 },
    );
  }

  try {
    const agentId = assistant.elevenlabs_agent_id ?? (await syncAssistantAgent(id));

    // Reserve, claim a pool number or buy one, and store it (number-assign.ts).
    // A parallel request for this assistant gets "busy" and buys nothing.
    const assigned = await assignNumber(
      { ownerId: userId, assistantId: id, country, limit: allowance.limit ?? null },
      await numberAssignDeps(),
    );
    if (assigned.status !== "ok") {
      if (assigned.status === "limit") {
        // A parallel request took the plan's last number slot first.
        return Response.json(
          { error: allowance.limitReason || "Could not add a number.", code: "limit_reached" },
          { status: 403 },
        );
      }
      // "exists": a parallel request stored this assistant's number first.
      const current =
        assigned.status === "exists" ? await getAssistantNumber(id).catch(() => null) : null;
      if (current) return Response.json({ e164: current.e164, id: current.id });
      return Response.json(
        { error: "Your number is still being set up. Try again in a minute.", code: "busy" },
        { status: 409 },
      );
    }
    const { numberId, e164 } = assigned;

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
  const auth = await mobileAuth(req, "number-unlink");
  if (auth instanceof Response) return auth;
  const userId = auth;
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
