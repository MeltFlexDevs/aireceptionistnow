import { revalidatePath } from "next/cache";

import { syncAssistantAgent } from "@/lib/call-engine/agent/sync";
import { createAssistant, getAssistantNumber, listAssistants } from "@/lib/dashboard/db";
import { mobileRoute, mobileUserId } from "@/lib/mobile/auth";

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
 * `createAssistant` enforces the plan's assistant cap itself and throws with a
 * message worth showing, so that check is not duplicated here.
 */
export async function POST(req: Request): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let name = "";
  try {
    name = String(((await req.json()) as { name?: unknown }).name ?? "").trim();
  } catch {
    // An empty body is fine - the default name covers it.
  }

  let id: string;
  try {
    id = await createAssistant(name || "My assistant", userId);
  } catch (err) {
    console.error("[mobile:assistant-create]", err);
    return Response.json({ error: (err as Error).message || "Could not create." }, { status: 400 });
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
