import { z } from "zod";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { translateTextsOrThrow } from "@/lib/dashboard/translate";
import { isLocale } from "@/lib/i18n/config";
import { translateLimiter } from "@/lib/rate-limit";

// Translates dynamic dashboard content (summaries, transcripts) into the
// dashboard locale for the client-side useTranslated hook. translateTextsOrThrow
// caches per (content, locale), so repeats never re-hit the model. `ok: false`
// tells the client the model failed (originals returned) so it won't cache
// the fallback as a translation. The native app has a bearer-token twin at
// /api/mobile/translate with the same body, caps and limiter - keep them in step.

const Body = z.object({
  texts: z.array(z.string().max(8000)).min(1).max(300),
  locale: z.string(),
});

const MAX_TOTAL_CHARS = 60_000;

export async function POST(request: Request): Promise<Response> {
  let userId: string | null = null;
  if (authConfigured()) {
    userId = await currentUserId();
    if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success || !isLocale(parsed.data.locale)) {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }
  const { texts, locale } = parsed.data;
  const totalChars = texts.reduce((n, t) => n + t.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return Response.json({ error: "too large" }, { status: 413 });
  }

  // Best-effort, per-instance rate limit (lib/rate-limit) - enough to blunt
  // cost abuse against the translation model without extra infra. Keyed by
  // user id (or IP before auth is configured).
  const limitKey = userId ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!translateLimiter.allow(limitKey, totalChars)) {
    return Response.json({ error: "rate limited" }, { status: 429 });
  }

  try {
    return Response.json({ texts: await translateTextsOrThrow(texts, locale), ok: true });
  } catch (err) {
    console.error("[translate] api translation failed", err);
    return Response.json({ texts, ok: false });
  }
}
