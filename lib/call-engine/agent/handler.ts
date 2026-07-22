import type { ActionContext } from "../actions";
import { verifyToolSecret } from "./auth";
import { AgentCallFields, resolveAgentContext } from "./context";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Log the ElevenLabs egress IP once per warm instance so we can confirm the
// serving region (5.2): US IPs 34.67.146.145 / 34.59.11.47 mean every tool
// call pays a transatlantic hop before our fra1 code runs.
let egressLogged = false;

export async function handleTool(
  req: Request,
  run: (ctx: ActionContext, body: Record<string, unknown>) => Promise<string>,
): Promise<Response> {
  if (!verifyToolSecret(req.headers)) {
    return json({ error: "unauthorized" }, 401);
  }

  if (!egressLogged) {
    egressLogged = true;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    console.log("[agent] tool webhook egress ip", ip);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const fields = AgentCallFields.safeParse(body);
  if (!fields.success) {
    return json({ error: fields.error.issues.map((i) => i.message).join("; ") }, 400);
  }

  let ctx;
  try {
    ctx = await resolveAgentContext(fields.data);
  } catch (err) {
    console.error("[agent] resolve context failed", err);
    return json({
      result: "I'm sorry, our system is having a little trouble right now. Please try again in a moment.",
    });
  }
  if (!ctx) {
    return json({
      result: "I'm sorry, our system is having a little trouble right now. Please try again in a moment.",
    });
  }

  try {
    const result = await run(ctx, body);
    return json({ result });
  } catch (err) {
    console.error("[agent] tool run failed", err);
    // Instruct, don't claim: nothing was recorded yet, so the agent must
    // actually call take_message rather than tell the caller it already did.
    // Phrased conditionally in case the take_message tool wasn't provisioned.
    return json({
      result:
        "That didn't go through on my end. Apologize briefly, and if you can take a message, record the caller's request with take_message so our team can follow up.",
    });
  }
}
