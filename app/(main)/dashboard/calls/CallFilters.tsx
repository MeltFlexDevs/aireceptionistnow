"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, Spinner } from "../icons";
import { useT } from "@/lib/i18n/client";

interface Props {
  q: string;
}

// Search only. A single field, capped in width, with an inline clear affordance
// when there is text - no status dropdown alongside it.
export function CallFilters({ q }: Props) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [text, setText] = useState(q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set when Clear empties the input so the debounce doesn't re-push q.
  const skipDebounce = useRef(false);
  const [isPending, startTransition] = useTransition();

  function setQuery(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("q", value);
    else next.delete("q");
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function clear() {
    if (timer.current) clearTimeout(timer.current);
    if (text) {
      skipDebounce.current = true;
      setText("");
    }
    // Clear only the query. Keep ?selected= so the detail pane stays put.
    const next = new URLSearchParams(params.toString());
    next.delete("q");
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  // Debounce the free-text search so each keystroke doesn't navigate.
  useEffect(() => {
    if (skipDebounce.current) {
      skipDebounce.current = false;
      return;
    }
    if (text === q) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setQuery(text.trim()), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="relative" aria-busy={isPending}>
      {isPending ? (
        <Spinner className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
      ) : (
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      )}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.calls.searchPlaceholder}
        className="h-10 w-full rounded-lg bg-white pl-9 pr-9 text-sm text-neutral-700 border border-neutral-200 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-300"
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          aria-label={t.common.clear}
          className="press absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
