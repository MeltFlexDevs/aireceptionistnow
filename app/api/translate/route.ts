import { z } from "zod";
import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { translateTextsOrThrow } from "@/lib/dashboard/translate";
import { isLocale } from "@/lib/i18n/config";

// Translates dynamic dashboard content (summaries, transcripts) into the
// dashboard locale for the client-side useTranslated hook. translateTexts
// caches per (content, locale), so repeats never re-hit the model. `ok: false`
// tells the client the model failed (originals returned) so it won't cache
// the fallback as a translation.

const Body = z.object({
  texts: z.array(z.string().max(8000)).min(1).max(300),
  locale: z.string(),
});

const MAX_TOTAL_CHARS = 60_000;

// Best-effort, per-instance rate limit - enough to blunt cost abuse against
// the translation model without extra infra. Keyed by user id (or IP before
// auth is configured).
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_CHARS_PER_WINDOW = 150_000;
const usage = new Map<string, { start: number; requests: number; chars: number }>();

function allowUsage(key: string, chars: number): boolean {
  const now = Date.now();
  if (usage.size > 5000) {
    for (const [k, u] of usage) if (now - u.start > WINDOW_MS) usage.delete(k);
  }
  const u = usage.get(key);
  if (!u || now - u.start > WINDOW_MS) {
    usage.set(key, { start: now, requests: 1, chars });
    return true;
  }
  u.requests += 1;
  u.chars += chars;
  return u.requests <= MAX_REQUESTS_PER_WINDOW && u.chars <= MAX_CHARS_PER_WINDOW;
}

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

  const limitKey = userId ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!allowUsage(limitKey, totalChars)) {
    return Response.json({ error: "rate limited" }, { status: 429 });
  }

  try {
    return Response.json({ texts: await translateTextsOrThrow(texts, locale), ok: true });
  } catch (err) {
    console.error("[translate] api translation failed", err);
    return Response.json({ texts, ok: false });
  }
}
