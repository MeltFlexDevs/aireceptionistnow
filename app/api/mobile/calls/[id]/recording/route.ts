import { getCallAudioRef } from "@/lib/dashboard/calls";
import { mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Call audio, streamed.
 *
 * Until now nothing in the product could play a call back: `calls.recording_url`
 * is read in three places and written in none, so the dashboard's Recording
 * section has never rendered. The audio does exist - ElevenLabs keeps it against
 * the conversation - it just has no public URL, and it must not get one: the
 * only key that can fetch it is the account-wide ELEVENLABS_API_KEY, which would
 * hand a listener every other tenant's calls.
 *
 * So the bytes are proxied. The client sends its Supabase bearer token, this
 * route checks that the caller owns the call, and the upstream key never leaves
 * the server.
 *
 * Range requests are forwarded so a player can seek without pulling the whole
 * file first - a ten-minute call is several megabytes on a phone connection.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return Response.json({ error: "Recordings are not available." }, { status: 503 });

  const { id } = await params;

  let ref: Awaited<ReturnType<typeof getCallAudioRef>>;
  try {
    ref = await getCallAudioRef(id, userId);
  } catch (err) {
    console.error("[mobile:recording]", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
  // One 404 for "not yours", "no such call" and "never had audio" alike: a
  // distinct answer for the first would confirm the id exists to someone
  // probing for it.
  if (!ref) return Response.json({ error: "No recording for this call." }, { status: 404 });
  if (ref.isLive) {
    return Response.json({ error: "The call is still in progress." }, { status: 409 });
  }

  const range = req.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(ref.conversationId)}/audio`,
      {
        headers: {
          "xi-api-key": apiKey,
          ...(range ? { range } : {}),
        },
        cache: "no-store",
      },
    );
  } catch (err) {
    console.error("[mobile:recording] upstream fetch failed", err);
    return Response.json({ error: "Could not load the recording." }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    // 404 upstream is normal and not an error worth logging loudly: audio is
    // retained for a limited window, so old calls simply stop having any.
    if (upstream.status !== 404) {
      console.error(`[mobile:recording] upstream ${upstream.status} for call ${id}`);
    }
    return Response.json({ error: "No recording for this call." }, { status: 404 });
  }

  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "audio/mpeg",
    // Private and short-lived: the response is one tenant's call audio, and it
    // must never be held by a shared cache between here and the phone.
    "cache-control": "private, max-age=0, no-store",
    "accept-ranges": "bytes",
  });
  for (const header of ["content-length", "content-range"] as const) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
