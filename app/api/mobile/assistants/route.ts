import { revalidatePath } from "next/cache";

import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { mayAddAssistant } from "@/lib/dashboard/assistant-cap";
import { createAssistant, getAssistantNumber, listAssistants } from "@/lib/dashboard/db";
import { getPlanContext } from "@/lib/dashboard/plan";
import { mobileAuth, mobileRoute } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The Assistant tab's list. Deliberately a thin projection, not the whole row:
 * `knowledge`, `routing`, `system_prompt` and the ElevenLabs mirrors are large
 * and the list neither renders nor edits them - the detail route does.
 */
export const GET = mobileRoute(async (userId) => {
  const assistants = await listAssistants(userId);
  const withNumbers = await Promise.all(
    assistants.map(async (a) => ({
      id: a.id,
      name: a.name,
      greeting: a.greeting,
      language: a.language,
      enabled: a.enabled,
      createdAt: a.created_at,
      connected: Boolean(a.elevenlabs_agent_id),
      number: (await getAssistantNumber(a.id).catch(() => null))?.e164 ?? "",
    })),
  );
  return { assistants: withNumbers };
}, "assistants");

/**
 * Create one. Mirrors `createAssistantAction`, including the awaited agent sync:
 * an assistant with no ElevenLabs agent behind it looks created but answers
 * nothing, so a sync failure is reported rather than logged and swallowed.
 * The plan's receptionist cap is checked first with `mayAddAssistant`, the
 * same check as the web action; a refusal answers 403 `assistant_limit`.
 */
export async function POST(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "assistant-create");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let name = "";
  try {
    name = String(((await req.json()) as { name?: unknown }).name ?? "").trim();
  } catch {
    // An empty body is fine - the default name covers it.
  }

  if (!(await mayAddAssistant(userId, getPlanContext))) {
    return Response.json(
      {
        error: "Your plan doesn't include another receptionist. Upgrade to add more.",
        code: "assistant_limit",
      },
      { status: 403 },
    );
  }

  let id: string;
  try {
    id = await createAssistant(name || "My assistant", userId);
  } catch (err) {
    // createAssistant throws only Supabase errors: log them, never send their text.
    console.error("[mobile:assistant-create] create failed", err);
    return Response.json({ error: "Could not create." }, { status: 500 });
  }

  let warning: string | null = null;
  try {
    await syncAssistantAgent(id);
  } catch (err) {
    console.error("[mobile:assistant-create-sync]", err);
    warning = "Receptionist saved, but setting up its voice agent failed.";
  }

  revalidatePath("/dashboard/assistant");
  return Response.json({ id, warning });
}
