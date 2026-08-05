import { revalidatePath } from "next/cache";

import { getAssistant, setAssistantEnabled } from "@/lib/dashboard/db";
import { mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Pause / resume the receptionist - the app's one write that changes what
 * happens on a live phone line, so the owner check is explicit rather than
 * inherited. Mirrors `toggleAssistantEnabledAction`, including revalidating the
 * two dashboard paths that show the same switch, so a phone toggle is reflected
 * the next time the web dashboard is opened.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const assistant = await getAssistant(id).catch(() => null);
  if (!assistant || (assistant.owner_id && assistant.owner_id !== userId)) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  let enabled: boolean;
  try {
    enabled = Boolean(((await req.json()) as { enabled?: unknown }).enabled);
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    await setAssistantEnabled(id, enabled);
  } catch (err) {
    console.error("[mobile:assistant-power]", err);
    return Response.json({ error: "Could not update." }, { status: 500 });
  }

  revalidatePath("/dashboard/assistant");
  revalidatePath("/dashboard");
  return Response.json({ id, enabled });
}
