import { z } from "zod";
import { confirmReceipt, correctReceipt } from "@/lib/receipts/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The caller's answer to their receipt.
 *
 * Unauthenticated by necessity - the reader is a member of the public holding a
 * link, and there is no account to sign into. The token IS the authorization,
 * which is why it is 160 random bits and why this route can do exactly two
 * things with it: set a confirmation flag, or attach one piece of text to one
 * call. It cannot read anything back.
 *
 * Every response is a bare `{ ok: true }`, including for a token that does not
 * exist. A route that answered differently for a real token than a fake one
 * would be a free oracle for anyone enumerating them.
 */

const Body = z.union([
  z.object({ confirm: z.literal(true) }),
  z.object({ correction: z.string().min(1).max(600) }),
]);

// Per-instance and deliberately tight. A receipt has one legitimate reader who
// presses at most one button, so anything past a handful of writes on the same
// token is either a stuck client or someone playing with it.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, { start: number; count: number }>();

function allow(token: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, h] of hits) if (now - h.start > WINDOW_MS) hits.delete(k);
  }
  const h = hits.get(token);
  if (!h || now - h.start > WINDOW_MS) {
    hits.set(token, { start: now, count: 1 });
    return true;
  }
  h.count += 1;
  return h.count <= MAX_PER_WINDOW;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;
  if (!allow(token)) return Response.json({ ok: true }, { status: 429 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: true });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) return Response.json({ ok: true });

  try {
    if ("confirm" in parsed.data) {
      await confirmReceipt(token);
    } else {
      await correctReceipt(token, parsed.data.correction);
    }
  } catch (err) {
    console.error("[receipt:feedback]", err);
  }

  return Response.json({ ok: true });
}
