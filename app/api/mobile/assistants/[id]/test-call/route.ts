import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { pickDemoCallerId } from "@/lib/call-engine/demo-caller";
import { assertUnderCallCaps, placeAgentCall } from "@/lib/call-engine/elevenlabs";
import {
  assignedElevenLabsNumberIds,
  getAssistant,
  getAssistantNumber,
  listImportedFreeNumbers,
} from "@/lib/dashboard/db";
import { isOwnedBy } from "@/lib/dashboard/ownership";
import { normalizePhone } from "@/lib/phone";
import { mobileAuth } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Ring the owner so they can hear their own receptionist. Same caller-id
 * resolution as `testCallAction`: the assistant's linked number first, then an
 * unused imported number, then the env fallback - without that chain a
 * number-less assistant made the button do nothing at all.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = await mobileAuth(req, "test-call");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const assistant = await getAssistant(id).catch(() => null);
  if (!assistant || !isOwnedBy(assistant.owner_id, userId)) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  let to = "";
  try {
    to = normalizePhone(String(((await req.json()) as { to?: unknown }).to ?? "")) ?? "";
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (!to) {
    return Response.json(
      { error: "Enter the number with its country code, like +1 415 555 0142.", code: "invalid_phone" },
      { status: 400 },
    );
  }

  try {
    await assertUnderCallCaps();
  } catch (err) {
    // Over the hourly/daily cap - this one throws a message worth showing.
    return Response.json({ error: (err as Error).message }, { status: 429 });
  }

  try {
    const agentId = assistant.elevenlabs_agent_id ?? (await syncAssistantAgent(id));
    const number = await getAssistantNumber(id).catch(() => null);

    let agentPhoneNumberId = number?.elevenlabs_phone_number_id ?? "";
    if (!agentPhoneNumberId) {
      const [pool, inUse] = await Promise.all([
        listImportedFreeNumbers().catch(() => []),
        assignedElevenLabsNumberIds().catch(() => new Set<string>()),
      ]);
      agentPhoneNumberId =
        pickDemoCallerId(to, pool, inUse, process.env.ELEVENLABS_AGENT_PHONE_NUMBER_ID) ?? "";
    }
    if (!agentPhoneNumberId) {
      return Response.json({ error: "Calling is not set up yet." }, { status: 400 });
    }

    await placeAgentCall(to, { agentId: agentId ?? undefined, agentPhoneNumberId });
  } catch (err) {
    console.error("[mobile:test-call]", err);
    return Response.json({ error: "The test call could not be placed." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
