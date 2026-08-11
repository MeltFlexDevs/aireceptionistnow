import { getReceiptAudioRef } from "@/lib/receipts/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The call recording, streamed to whoever holds the receipt link.
 *
 * Structurally the same proxy as app/api/mobile/calls/[id]/recording/route.ts,
 * with the authorization swapped: that route trusts a Supabase bearer token and
 * checks call ownership, this one trusts the receipt token and nothing else. The
 * upstream key is the same account-wide ELEVENLABS_API_KEY, which is precisely
 * why the bytes are proxied rather than the URL shared - handing that key's
 * reach to a public page would hand over every other tenant's calls.
 *
 * The audio is the caller's own voice on their own call, which is the strongest
 * argument for showing it here and also the reason it dies with the link: the
 * token expiry is checked on every request, not just at render.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return new Response(null, { status: 404 });

  const { token } = await params;

  let conversationId: string | null = null;
  try {
    conversationId = await getReceiptAudioRef(token);
  } catch (err) {
    console.error("[receipt:audio]", err);
    return new Response(null, { status: 500 });
  }
  // One 404 for a bad token, an expired link and a call that never had audio.
  if (!conversationId) return new Response(null, { status: 404 });

  const range = req.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(conversationId)}/audio`,
      {
        headers: { "xi-api-key": apiKey, ...(range ? { range } : {}) },
        cache: "no-store",
      },
    );
  } catch (err) {
    console.error("[receipt:audio] upstream fetch failed", err);
    return new Response(null, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    // Upstream 404 is routine - ElevenLabs retains audio for a limited window,
    // so an old call simply stops having any.
    if (upstream.status !== 404) {
      console.error(`[receipt:audio] upstream ${upstream.status}`);
    }
    return new Response(null, { status: 404 });
  }

  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "audio/mpeg",
    // Private and uncacheable: this is one person's phone call, and it must not
    // be held by any shared cache between here and their handset.
    "cache-control": "private, max-age=0, no-store",
    "accept-ranges": "bytes",
  });
  for (const header of ["content-length", "content-range"] as const) {
    const value = upstream.headers.get(header);
    if (value) headers.set(header, value);
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}
