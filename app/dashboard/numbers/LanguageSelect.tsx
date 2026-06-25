"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGES, findLanguage } from "./languages";

// Searchable language picker with country flags. Submits through a hidden input
// so it works inside the settings server-action form with no client API.

interface Props {
  name?: string;
  defaultValue?: string;
}

export function LanguageSelect({ name = "language", defaultValue = "en" }: Props) {
  const [selected, setSelected] = useState(defaultValue || "en");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const current = findLanguage(selected);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? LANGUAGES.filter(
        (l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q),
      )
    : LANGUAGES;

  function pick(code: string) {
    setSelected(code);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative" ref={ref}>
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-300 focus:border-violet-400"
      >
        <span className="flex items-center gap-2">
          <span className="text-base leading-none">{current?.flag ?? "🌐"}</span>
          <span>{current ? current.name : selected}</span>
          <span className="text-xs text-neutral-400">{current?.code ?? ""}</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="border-b border-neutral-100 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtered[0]) pick(filtered[0].code);
                }
              }}
              placeholder="Search language..."
              className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-violet-400"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-neutral-400">No matches</li>
            ) : (
              filtered.map((l) => (
                <li key={l.code} role="option" aria-selected={l.code === selected}>
                  <button
                    type="button"
                    onClick={() => pick(l.code)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 ${
                      l.code === selected ? "bg-violet-50 text-violet-700" : "text-neutral-700"
                    }`}
                  >
                    <span className="text-base leading-none">{l.flag}</span>
                    <span className="flex-1">{l.name}</span>
                    <span className="text-xs text-neutral-400">{l.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
