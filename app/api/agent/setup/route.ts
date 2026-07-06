import { verifyToolSecret } from "@/lib/call-engine/agent/auth";
import {
  configureWorkspaceWebhooks,
  importPoolNumbersToElevenLabs,
} from "@/lib/call-engine/agent/workspace";
import { provisionDemoAgent } from "@/lib/call-engine/agent/sync";

// One-time setup endpoint: wires the workspace-global ElevenLabs webhooks
// (conversation-init + post-call) at our app, fully provisions the public
// demo agent (greeting + LLM + voice + multilingual presets + override flags),
// and imports any DB pool numbers not yet in ElevenLabs (backfilling their
// ElevenLabs ids). Guarded by the same shared secret as the agent tool webhooks
// (AGENT_WEBHOOK_SECRET) so it can't be triggered by anyone. Run once after
// deploy (and again after changing the demo persona/voice or seeding numbers):
//   curl -X POST "$APP_BASE_URL/api/agent/setup" -H "x-agent-secret: $AGENT_WEBHOOK_SECRET"

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
    // Best-effort: a demo agent misconfig shouldn't fail the workspace wiring -
    // placeAgentCall degrades gracefully anyway (retries without the override).
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
