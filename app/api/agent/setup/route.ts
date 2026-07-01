import { verifyToolSecret } from "@/lib/call-engine/agent/auth";
import { configureWorkspaceWebhooks } from "@/lib/call-engine/agent/workspace";

// One-time setup endpoint: wires the workspace-global ElevenLabs webhooks
// (conversation-init + post-call) at our app. Guarded by the same shared secret
// as the agent tool webhooks (AGENT_WEBHOOK_SECRET) so it can't be triggered by
// anyone. Run once after deploy:
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
    return new Response(JSON.stringify({ ok: true, ...result }), {
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
