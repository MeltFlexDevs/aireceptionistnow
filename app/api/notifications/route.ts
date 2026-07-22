import { currentUserId } from "@/lib/auth";
import { getNotifications } from "@/lib/dashboard/notifications";

// Recent-calls feed for the top-bar bell. Scoped to the signed-in user.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const ownerId = await currentUserId();
  // This route is outside the proxy matcher (/dashboard/:path*), so it has no
  // session guard in front of it and must enforce auth itself.
  if (!ownerId) return Response.json({ items: [] }, { status: 401 });

  try {
    return Response.json({ items: await getNotifications(ownerId) });
  } catch (err) {
    // Previously this returned 200 with an empty list, so a Supabase outage
    // looked identical to "no new calls" and never surfaced in the logs.
    console.error("[notifications]", err);
    return Response.json(
      { error: "Could not load notifications." },
      { status: 500 },
    );
  }
}
