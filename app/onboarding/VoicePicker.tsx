"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useT } from "@/lib/i18n/client";
import { loadLibraryVoices } from "@/app/dashboard/numbers/voiceActions";
import type { VoiceOption } from "@/app/dashboard/numbers/voices";
import { genderOf, voicePersonality } from "./personality";

type PickerVoice = VoiceOption & { isDefault?: boolean };

// Community voice names often cram the vibe into the name itself, e.g.
// "Sarah - Mature, Reassuring, Confident". Split it into a clean first name and
// a short descriptor; fall back to the derived tone when there's no descriptor.
function voiceDisplay(v: VoiceOption, toneLabel: string): { name: string; tag: string } {
  const parts = v.name.split(/\s[-–—]\s/);
  const name = (parts[0] ?? v.name).trim() || v.name;
  const tag = parts.slice(1).join(" - ").trim() || toneLabel;
  return { name, tag };
}

const field =
  "w-full rounded-lg border border-neutral-200 bg-white text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";

// The funnel voice picker, as a dropdown so the step stays compact. The list is
// scoped to the country's language and the gender picked on the Name tab; open
// it to search, preview, and see who each voice is best for.
export function VoicePicker({
  defaults,
  language,
  gender,
  value,
  onChange,
}: {
  defaults: VoiceOption[];
  /** Base language derived from the chosen country - filters the voice list. */
  language: string;
  /** Gender picked on the Name tab - the list only shows matching voices. */
  gender: "f" | "m";
  value: string;
  onChange: (id: string, voice: VoiceOption) => void;
}) {
  const t = useT();
  const o = t.onboarding;
  const [result, setResult] = useState<{ lang: string; list: VoiceOption[] } | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Close on outside click; stop audio on unmount.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    loadLibraryVoices(language)
      .then((list) => alive && setResult({ lang: language, list }))
      .catch(() => alive && setResult({ lang: language, list: [] }));
    return () => {
      alive = false;
    };
  }, [language]);

  const loadedList = result?.lang === language ? result.list : null;
  const loading = loadedList === null;

  const all: PickerVoice[] = useMemo(() => {
    const seen = new Set<string>();
    const out: PickerVoice[] = [];
    for (const v of defaults) {
      if (seen.has(v.voiceId)) continue;
      seen.add(v.voiceId);
      out.push({ ...v, isDefault: true });
    }
    for (const v of loadedList ?? []) {
      if (seen.has(v.voiceId)) continue;
      seen.add(v.voiceId);
      out.push(v);
    }
    return out.slice(0, 20);
  }, [defaults, loadedList]);

  // If the picked voice vanished after a language change, fall back to the first
  // voice that matches the chosen gender.
  useEffect(() => {
    if (!loadedList) return;
    if (all.length && !all.some((v) => v.voiceId === value)) {
      const next = all.find((v) => genderOf(v.description) === gender) ?? all[0];
      onChangeRef.current(next.voiceId, next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const byGender = all.filter((v) => {
    const vg = genderOf(v.description);
    return !vg || vg === gender; // hide the opposite gender; keep unknowns
  });
  const q = query.trim().toLowerCase();
  const filtered = byGender.filter((v) => {
    if (!q) return true;
    const hay = `${v.name} ${v.description ?? ""} ${o[voicePersonality(v.name, v.description).tone]}`.toLowerCase();
    return hay.includes(q);
  });

  const current = all.find((v) => v.voiceId === value);

  function stopAudio() {
    audioRef.current?.pause();
    setPlaying(null);
  }
  function togglePlay(e: React.MouseEvent, v: VoiceOption) {
    e.stopPropagation();
    if (!v.previewUrl) return;
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    if (playing === v.voiceId) {
      audio.pause();
      setPlaying(null);
      return;
    }
    audio.src = v.previewUrl;
    audio.onended = () => setPlaying(null);
    void audio.play().catch(() => setPlaying(null));
    setPlaying(v.voiceId);
  }
  function pick(v: PickerVoice) {
    onChange(v.voiceId, v);
    setOpen(false);
    setQuery("");
    stopAudio();
  }

  return (
    <div className="relative" ref={rootRef} data-el-dropdown={open ? "open" : "closed"}>
      {/* Trigger - shows the chosen voice, keeps the step short */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-left text-sm text-neutral-900 transition-colors hover:border-neutral-300 focus:border-neutral-900"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {current ? (
            <>
              <span className="shrink-0 font-medium">
                {voiceDisplay(current, o[voicePersonality(current.name, current.description).tone]).name}
              </span>
              {current.isDefault && (
                <span className="shrink-0 rounded-full border border-neutral-300 px-1.5 py-px text-[10px] font-medium text-neutral-500">
                  {o.defaultVoice}
                </span>
              )}
              <span className="hidden truncate text-xs text-neutral-400 sm:inline">
                {voiceDisplay(current, o[voicePersonality(current.name, current.description).tone]).tag}
              </span>
            </>
          ) : (
            <span className="truncate font-medium">…</span>
          )}
        </span>
        <svg className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="absolute z-50 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl
                       left-0 right-0 top-full mt-2
                       xl:fixed xl:left-auto xl:right-8 xl:top-28 xl:mt-0 xl:w-80"
          >
            <div className="max-h-56 overflow-y-auto overscroll-contain xl:max-h-[22rem]">
              {/* Sticky search header - only the list below scrolls */}
              <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/95 p-2 backdrop-blur">
                <div className="relative">
              <svg className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={o.voiceSearchPlaceholder}
                className={`${field} py-1.5 pl-8 pr-2.5 placeholder:text-neutral-300`}
              />
            </div>
          </div>

          {/* List */}
          <div className="space-y-1 p-1.5">
            {filtered.map((v) => {
              const active = v.voiceId === value;
              const isPlaying = playing === v.voiceId;
              return (
                <div
                  key={v.voiceId}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 ${
                    active ? "bg-neutral-100" : "hover:bg-neutral-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => togglePlay(e, v)}
                    disabled={!v.previewUrl}
                    aria-label={isPlaying ? "Pause preview" : "Play preview"}
                    className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 disabled:opacity-30"
                  >
                    {isPlaying ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => pick(v)}
                    className="min-w-0 flex-1 text-left"
                  >
                    {(() => {
                      const d = voiceDisplay(v, o[voicePersonality(v.name, v.description).tone]);
                      return (
                        <>
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-neutral-900">{d.name}</span>
                            {v.isDefault && (
                              <span className="shrink-0 rounded-full border border-neutral-300 px-1.5 py-px text-[10px] font-medium text-neutral-500">
                                {o.defaultVoice}
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-xs text-neutral-500">{d.tag}</span>
                        </>
                      );
                    })()}
                  </button>
                  {active && (
                    <svg className="h-4 w-4 shrink-0 text-neutral-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
              );
            })}

            {loading && (
              <p className="flex items-center justify-center gap-2 py-3 text-xs text-neutral-400">
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
                …
              </p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="py-4 text-center text-xs text-neutral-400">{t.common.noMatches}</p>
            )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
