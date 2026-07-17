"use client";

import { useEffect, useState } from "react";
import { useI18n } from "./client";

// Client-side translation of dynamic content (summaries, transcripts) into the
// current dashboard locale. Originals render immediately; the translation
// swaps in when ready and re-fetches the moment the locale changes - it never
// blocks a server render or a locale switch.
//
// Promises are cached module-wide, so concurrent consumers of the same content
// share one request; the server route caches per (content, locale) on top.
// Failed translations (ok: false) are evicted so a later mount retries.
const cache = new Map<string, Promise<string[]>>();

function contentKeyOf(texts: string[]): string {
  const joined = JSON.stringify(texts);
  let h = 0;
  for (let i = 0; i < joined.length; i++) h = (h * 31 + joined.charCodeAt(i)) | 0;
  return `${h}:${joined.length}`;
}

async function requestTranslation(texts: string[], locale: string, key: string): Promise<string[]> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ texts, locale }),
  });
  if (!res.ok) throw new Error(`translate failed: ${res.status}`);
  const data = (await res.json()) as { texts?: unknown; ok?: unknown };
  if (!Array.isArray(data.texts) || data.texts.length !== texts.length) {
    throw new Error("translate: bad shape");
  }
  // Model failure: the server returned the originals as a fallback. Show them,
  // but don't keep them cached as if they were a translation.
  if (data.ok === false) cache.delete(key);
  return data.texts.map((s, i) => (typeof s === "string" && s.trim() ? s : texts[i]));
}

export function useTranslated(texts: string[]): {
  /** Best text to show now: current translation, else the previous one for the same content, else originals. */
  texts: string[];
  /** True while the translation for the current locale is being fetched. */
  translating: boolean;
  /** True when the current locale's translation differs from the originals. */
  hasTranslation: boolean;
} {
  const { locale } = useI18n();
  const contentKey = texts.length > 0 ? contentKeyOf(texts) : "";
  const key = contentKey ? `${locale}:${contentKey}` : "";
  const [ready, setReady] = useState<{ key: string; contentKey: string; texts: string[] } | null>(null);

  // Consumers memoize `texts`, so these deps only change on real input changes;
  // the functional setReady keeps re-runs idempotent regardless.
  useEffect(() => {
    if (texts.length === 0) return;
    const contentKey = contentKeyOf(texts);
    const key = `${locale}:${contentKey}`;
    let alive = true;
    let promise = cache.get(key);
    if (!promise) {
      promise = requestTranslation(texts, locale, key);
      cache.set(key, promise);
      // Don't cache failures - a later mount should retry.
      promise.catch(() => cache.delete(key));
    }
    promise.then(
      (out) => {
        if (alive) {
          setReady((prev) => (prev && prev.key === key && prev.texts === out ? prev : { key, contentKey, texts: out }));
        }
      },
      () => {
        if (alive) {
          setReady((prev) => (prev && prev.key === key ? prev : { key, contentKey, texts }));
        }
      },
    );
    return () => {
      alive = false;
    };
  }, [locale, texts]);

  const current = ready && ready.key === key ? ready.texts : null;
  // While re-translating after a locale change, hold the previous translation
  // of the SAME content instead of flashing back to the originals. A content
  // change (new call, live transcript update) must not hold - old translations
  // would be misattributed to the new items.
  const held = ready && ready.contentKey === contentKey ? ready.texts : null;
  const display = current ?? held ?? texts;
  return {
    texts: display,
    translating: texts.length > 0 && !current,
    hasTranslation: !!current && current.some((s, i) => s.trim() !== texts[i].trim()),
  };
}
