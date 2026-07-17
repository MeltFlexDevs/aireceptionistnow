"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { Spinner } from "../icons";

export function LanguageSwitcher() {
  const { t, locale, setLocale, preloadLocale, pending } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Warm every dictionary chunk (a few KB each) so the switch itself is instant.
  function preloadAll() {
    for (const l of LOCALES) preloadLocale(l.code);
  }

  function choose(code: Locale) {
    setOpen(false);
    setLocale(code); // applies instantly on the client; the server syncs in the background
  }

  return (
    <div className="relative" ref={ref} data-el-dropdown={open ? "open" : "closed"}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          preloadAll();
        }}
        onMouseEnter={preloadAll}
        onFocus={preloadAll}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.topbar.language}
        title={t.topbar.language}
        className="press flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      >
        <span className="text-base leading-none" aria-hidden>
          {current.flag}
        </span>
        <span className="hidden font-medium uppercase sm:inline">{current.code}</span>
        {pending ? (
          <Spinner className="h-3 w-3 animate-spin text-neutral-400" />
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
        >
          <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            {t.topbar.language}
          </p>
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="menuitemradio"
              aria-checked={l.code === locale}
              onClick={() => choose(l.code)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                l.code === locale
                  ? "font-medium text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <span className="text-base leading-none" aria-hidden>
                {l.flag}
              </span>
              <span className="flex-1">{l.label}</span>
              {l.code === locale && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
