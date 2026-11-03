import { z } from "zod";
import { translateTextsOrThrow } from "@/lib/dashboard/translate";
import { isLocale } from "@/lib/i18n/config";
import { mobileAuth } from "@/lib/mobile/auth";
import { translateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same contract as /api/translate - body, caps, model call and limiter - for a
// client that authenticates with a bearer token instead of the web cookie.
// Keep the two in step.
const Body = z.object({
  texts: z.array(z.string().max(8000)).min(1).max(300),
  locale: z.string(),
});

const MAX_TOTAL_CHARS = 60_000;

/**
 * Translates call summaries and transcripts into the app's language.
 *
 * Not wrapped in `mobileRoute`: that helper always answers 200 with the
 * handler's value, and this route needs its 413/429 statuses. `ok: false`
 * means the model failed and the originals came back - the app must not cache
 * them as a translation.
 */
export async function POST(req: Request): Promise<Response> {
  const auth = await mobileAuth(req, "translate");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success || !isLocale(parsed.data.locale)) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { texts, locale } = parsed.data;
  const totalChars = texts.reduce((n, t) => n + t.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return Response.json({ error: "Too much text to translate at once." }, { status: 413 });
  }

  // Keyed by user id, on the same limiter as the web route, so one account's
  // web and app traffic share one budget.
  if (!translateLimiter.allow(userId, totalChars)) {
    return Response.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  try {
    return Response.json({ texts: await translateTextsOrThrow(texts, locale), ok: true });
  } catch (err) {
    console.error("[mobile:translate]", err);
    return Response.json({ texts, ok: false });
  }
}
