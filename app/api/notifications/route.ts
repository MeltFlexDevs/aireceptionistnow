import { currentUserId } from "@/lib/auth";
import { getNotifications } from "@/lib/dashboard/notifications";

// Recent-calls feed for the top-bar bell. Scoped to the signed-in user.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const ownerId = await currentUserId();
    const items = await getNotifications(ownerId);
    return Response.json({ items });
  } catch (err) {
    return Response.json(
      { items: [], error: (err as Error).message },
      { status: 200 },
    );
  }
}
