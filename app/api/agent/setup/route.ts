import { verifyToolSecret } from "@/lib/call-engine/agent/auth";
import { elevenClient } from "@/lib/call-engine/agent/eleven-client";
import { configureWorkspaceWebhooks } from "@/lib/call-engine/agent/workspace";

// One-time setup endpoint: wires the workspace-global ElevenLabs webhooks
// (conversation-init + post-call) at our app, and asserts the demo agent's
// override permissions. Guarded by the same shared secret as the agent tool
// webhooks (AGENT_WEBHOOK_SECRET) so it can't be triggered by anyone. Run once
// after deploy:
//   curl -X POST "$APP_BASE_URL/api/agent/setup" -H "x-agent-secret: $AGENT_WEBHOOK_SECRET"

export const dynamic = "force-dynamic";

/** The hand-managed demo agent (ELEVENLABS_AGENT_ID) must whitelist the
 *  language + first_message overrides or the landing page's per-call language
 *  switch is silently ignored/rejected. Asserting it here makes the demo flow
 *  reproducible from code instead of dashboard clicking. Managed assistants get
 *  the same via sync.ts. */
async function enableDemoAgentOverrides(): Promise<string | null> {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!agentId) return null;
  await elevenClient().conversationalAi.agents.update(agentId, {
    platformSettings: {
      overrides: {
        conversationConfigOverride: {
          agent: { firstMessage: true, language: true },
        },
      },
    },
  });
  return agentId;
}

export async function POST(req: Request): Promise<Response> {
  if (!verifyToolSecret(req.headers)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const result = await configureWorkspaceWebhooks();
    // Best-effort: a demo agent misconfig shouldn't fail the workspace wiring —
    // placeAgentCall degrades gracefully anyway (retries without the override).
    const demoAgentOverrides = await enableDemoAgentOverrides().catch((err) => {
      console.warn("[agent/setup] demo agent override setup failed", err);
      return null;
    });
    return new Response(JSON.stringify({ ok: true, ...result, demoAgentOverrides }), {
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
