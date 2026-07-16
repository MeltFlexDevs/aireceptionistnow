import { verifyToolSecret } from "@/lib/call-engine/agent/auth";
import {
  configureWorkspaceWebhooks,
  importPoolNumbersToElevenLabs,
} from "@/lib/call-engine/agent/workspace";
import { provisionDemoAgent } from "@/lib/call-engine/agent/sync";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  if (!verifyToolSecret(req.headers)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const result = await configureWorkspaceWebhooks();
    const demoAgent = await provisionDemoAgent().catch((err) => {
      console.warn("[agent/setup] demo agent provisioning failed", err);
      return null;
    });
    // Best-effort too: one bad number must not fail the whole setup call.
    const numbers = await importPoolNumbersToElevenLabs().catch((err) => {
      console.warn("[agent/setup] pool number import failed", err);
      return null;
    });
    return new Response(JSON.stringify({ ok: true, ...result, demoAgent, numbers }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: (err as Error).message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
