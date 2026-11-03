import { getCallDetail } from "@/lib/dashboard/calls";
import { serviceClient } from "@/lib/dashboard/supabase";
import { mobileAuth } from "@/lib/mobile/auth";
import { resolveTimezone } from "@/lib/mobile/timezone-param";

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
  const auth = await mobileAuth(req, "call-detail");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;
  const locale = new URL(req.url).searchParams.get("locale") ?? undefined;
  try {
    // The phone's `?tz=`, used only when the account has no zone of its own.
    const detail = await getCallDetail(id, userId, locale, resolveTimezone(null, req).timezone);
    if (!detail) return Response.json({ error: "Call not found." }, { status: 404 });
    // Like the web's call detail: the call is scoped to this owner, so counting
    // its reports by id is safe. On a query error count is null and the app
    // offers the report form, as before.
    const { count } = await serviceClient()
      .from("call_reports")
      .select("id", { count: "exact", head: true })
      .eq("call_id", id);
    return Response.json({ ...detail, reported: (count ?? 0) > 0 });
  } catch (err) {
    console.error("[mobile:call-detail]", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
