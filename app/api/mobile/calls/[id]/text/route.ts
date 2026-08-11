import { getRepository } from "@/lib/call-engine/persistence/supabase";
import { sendSms } from "@/lib/call-engine/telephony";
import { getCallContactRef } from "@/lib/dashboard/calls";
import { mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Two SMS segments. Long enough for a real reply, short enough that nobody sends a novel by accident. */
const MAX_CHARS = 300;

/**
 * Text the caller back.
 *
 * The gap this closes: the app could already ring a caller back with one tap,
 * but a missed call at 8pm is answered far more often by a text than by a
 * return call, and until now the only way to send one was to leave the app,
 * copy the number into Messages, and type it from a personal handset - which
 * also gives the caller the wrong number to reply to.
 *
 * The destination is never taken from the request body. `getCallContactRef`
 * returns the numbers off the call row after checking ownership, so this can
 * only ever text somebody who actually rang one of your lines. Without that,
 * an authenticated user could point the account's Twilio credentials at any
 * number in the world.
 *
 * Nothing is persisted. An outbound text from the owner is not something the
 * assistant did, and filing it under the call's actions would misreport the
 * call; a real message log is a larger feature than this route.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;

  let message = "";
  try {
    message = String(((await req.json()) as { message?: unknown }).message ?? "").trim();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (!message) return Response.json({ error: "Write something to send." }, { status: 400 });
  if (message.length > MAX_CHARS) {
    return Response.json({ error: `Keep it under ${MAX_CHARS} characters.` }, { status: 400 });
  }

  let contact: Awaited<ReturnType<typeof getCallContactRef>>;
  try {
    contact = await getCallContactRef(id, userId);
  } catch (err) {
    console.error("[mobile:call-text]", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
  if (!contact) return Response.json({ error: "Call not found." }, { status: 404 });

  // The business name is the SMS sender where the country allows an
  // alphanumeric one, so the text arrives from the same name the caller heard
  // on the phone rather than an unknown number.
  const config = await getRepository()
    .resolveInboundNumber(contact.to)
    .catch(() => null);

  try {
    await sendSms(contact.from, contact.to, message, config?.businessName);
  } catch (err) {
    console.error("[mobile:call-text] send failed", err);
    return Response.json({ error: "That did not send. Try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
