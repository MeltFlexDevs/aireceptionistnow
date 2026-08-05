import { revalidatePath } from "next/cache";

import { deleteIntegration, setPrimaryCalendar } from "@/lib/dashboard/db";
import { mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Make a calendar primary, or disconnect it.
 *
 * Both helpers take the ownerId and scope the write themselves - that is the
 * tenant boundary here, so never call them without it.
 */

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  try {
    await setPrimaryCalendar(id, userId);
  } catch (err) {
    console.error("[mobile:calendar-primary]", err);
    return Response.json({ error: "Could not update that calendar." }, { status: 500 });
  }
  revalidatePath("/dashboard/calendar");
  return Response.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  try {
    // Deleting a row that is already gone succeeds with zero rows affected, so
    // a throw here is a real failure - surface it rather than claiming success
    // and leaving the calendar visibly still connected.
    await deleteIntegration(id, userId);
  } catch (err) {
    console.error("[mobile:calendar-disconnect]", err);
    return Response.json({ error: "Could not disconnect." }, { status: 500 });
  }
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/assistant", "layout");
  return Response.json({ ok: true });
}
