import type { ActionContext } from "../actions";
import { verifyToolSecret } from "./auth";
import { AgentCallFields, resolveAgentContext } from "./context";

// One request lifecycle for every tier-A tool webhook, so each route file is
// just its action. ElevenLabs reads the JSON `result` string and feeds it back
// to the agent as the tool output, exactly like the tier-B tool return values.

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Authenticate, resolve context, run the action, and shape the response. Tool
 *  failures return 200 with a spoken `result` so the agent recovers gracefully
 *  instead of the LLM seeing a hard HTTP error mid-call. */
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

  const ctx = await resolveAgentContext(fields.data);
  if (!ctx) {
    return json({
      result: "I'm sorry, I can't access this account right now. Please try again later.",
    });
  }

  try {
    const result = await run(ctx, body);
    return json({ result });
  } catch (err) {
    console.error("[agent] tool run failed", err);
    return json({
      result:
        "I ran into a problem doing that. I'll take a message so the team can follow up.",
    });
  }
}
