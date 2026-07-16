import type { NextRequest } from "next/server";
import { assertUnderCallCaps, placeAgentCall } from "@/lib/call-engine/elevenlabs";
import { provisionDemoAgent } from "@/lib/call-engine/agent/sync";
import { pickDemoCallerId } from "@/lib/call-engine/demo-caller";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";
import { assignedElevenLabsNumberIds, listImportedFreeNumbers } from "@/lib/dashboard/db";

export const dynamic = "force-dynamic";

const E164 = /^\+[1-9]\d{6,15}$/;

let demoAgentReady: Promise<{ agentId: string; multilingual: boolean } | null> | null =
  null;
function ensureDemoAgent(): Promise<{ agentId: string; multilingual: boolean } | null> {
  demoAgentReady ??= provisionDemoAgent().catch((err) => {
    console.error("[test-call] demo agent provisioning failed:", (err as Error).message);
    demoAgentReady = null;
    return null;
  });
  return demoAgentReady;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function demoCallerNumberId(to: string): Promise<string | null> {
  try {
    const [pool, inUse] = await Promise.all([
      listImportedFreeNumbers(),
      assignedElevenLabsNumberIds(),
    ]);
    return pickDemoCallerId(to, pool, inUse, process.env.ELEVENLABS_AGENT_PHONE_NUMBER_ID);
  } catch (err) {
    console.error("[test-call] caller-ID lookup failed; refusing rather than guessing", err);
    return null;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  let to = "";
  try {
    to = String(((await req.json()) as { to?: unknown }).to ?? "").trim();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  if (!E164.test(to)) {
    return json({ ok: false, error: "Enter a valid phone number in international format." }, 400);
  }

  try {
    await assertUnderCallCaps();
  } catch (err) {
    // Over the hourly/daily usage cap - protect credits, ask them to retry later.
    return json({ ok: false, error: (err as Error).message }, 429);
  }

  try {
    const [demo, callerNumberId] = await Promise.all([
      ensureDemoAgent(),
      demoCallerNumberId(to),
    ]);
    if (!callerNumberId) {
      console.error("[test-call] no unassigned caller ID available - demo call refused");
      return json(
        { ok: false, error: "Our demo line is busy right now. Please try again shortly." },
        503,
      );
    }
    await placeAgentCall(to, {
      language: demo?.multilingual ? (languageFromPhone(to) ?? undefined) : undefined,
      agentPhoneNumberId: callerNumberId,
    });
    return json({ ok: true });
  } catch (err) {
    console.error("[test-call] failed:", (err as Error).message);
    return json({ ok: false, error: (err as Error).message }, 500);
  }
}
