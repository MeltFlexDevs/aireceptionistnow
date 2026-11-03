import { revalidatePath } from "next/cache";

import { deleteIntegration, setPrimaryCalendar } from "@/lib/dashboard/db";
import { mobileAuth } from "@/lib/mobile/auth";
import { isUuid } from "@/lib/uuid";

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
  const auth = await mobileAuth(req, "calendar-primary");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Calendar not found." }, { status: 404 });
  try {
    await setPrimaryCalendar(id, userId);
  } catch (err) {
    // Not this owner's calendar (or gone): 404, so the app does not retry.
    if (err instanceof Error && err.message === "Calendar not found.") {
      return Response.json({ error: "Calendar not found." }, { status: 404 });
    }
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
  const auth = await mobileAuth(req, "calendar-disconnect");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  // A non-UUID id would make Postgres throw 22P02 on the uuid column (a 500).
  if (!isUuid(id)) return Response.json({ error: "Calendar not found." }, { status: 404 });
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
