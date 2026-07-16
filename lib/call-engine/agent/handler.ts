import type { ActionContext } from "../actions";
import { verifyToolSecret } from "./auth";
import { AgentCallFields, resolveAgentContext } from "./context";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function handleTool(
  req: Request,
  run: (ctx: ActionContext, body: Record<string, unknown>) => Promise<string>,
): Promise<Response> {
  if (!verifyToolSecret(req.headers)) {
    return json({ error: "unauthorized" }, 401);
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
    return json({
      result:
        "I ran into a problem doing that. I'll take a message so our team can follow up.",
    });
  }
}
