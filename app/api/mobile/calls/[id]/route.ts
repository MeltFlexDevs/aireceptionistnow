import { getCallDetail } from "@/lib/dashboard/calls";
import { mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One call: transcript, actions, recording.
 *
 * Not built on `mobileRoute` because this handler takes the route params too,
 * and because a call belonging to another owner has to answer 404 rather than
 * the wrapper's 500. `getCallDetail` returns null for a non-owned id when a
 * viewerId is passed - that guard is the tenant boundary, so never drop it.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const locale = new URL(req.url).searchParams.get("locale") ?? undefined;
  try {
    const detail = await getCallDetail(id, userId, locale);
    if (!detail) return Response.json({ error: "Call not found." }, { status: 404 });
    return Response.json(detail);
  } catch (err) {
    console.error("[mobile:call-detail]", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
