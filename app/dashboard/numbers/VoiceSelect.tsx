"use client";

import { useEffect, useRef, useState } from "react";
import { loadVoices, loadLibraryVoices } from "./voiceActions";
import { FALLBACK_VOICES, type VoiceOption } from "./voices";

interface Props {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  language?: string;
  /** Voices pinned to the top of the list, regardless of the language filter. */
  pinnedVoices?: VoiceOption[];
  /**
   * Fires whenever the selected voice changes, with the resolved voice metadata
   * when it's known (null for a pasted/library id we haven't loaded yet). Lets a
   * parent mirror the pick - e.g. the onboarding live preview's personality.
   */
  onChange?: (voiceId: string, voice: VoiceOption | null) => void;
}

const GENDER_RE = /^(fe)?male$|^neutral$|^non[- ]?binary$/i;

// Render a voice's " · "-joined descriptors (accent, gender, tone, tier) as
// individual badges. The gender badge is emphasized; the rest stay subtle.
function VoiceTags({ description, className = "" }: { description?: string; className?: string }) {
  const tags = (description ?? "")
    .split(/[·,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (tags.length === 0) return null;
  return (
    <span className={`flex min-w-0 flex-wrap items-center gap-1 ${className}`}>
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium capitalize leading-none ${
            GENDER_RE.test(tag) ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          {tag}
        </span>
      ))}
    </span>
  );
}

export function VoiceSelect({
  name = "voice_id",
  defaultValue = "",
  placeholder = "Select a voice",
  language = "",
  pinnedVoices = [],
  onChange,
}: Props) {
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [voices, setVoices] = useState<VoiceOption[] | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const loading = voices === null && (open || selected !== "");

  const ref = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Keep the latest callback in a ref (synced in an effect, not during render)
  // so the "mirror the pick" effect below never re-fires on callback identity.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (voices !== null) return;
    if (!open && !selected) return;
    const load = language ? loadLibraryVoices(language) : loadVoices();
    const empty = language ? [] : FALLBACK_VOICES;
    load
      .then((list) => setVoices(list.length > 0 ? list : empty))
      .catch(() => setVoices(empty));
  }, [open, voices, selected, language]);

  const voiceList = voices ?? [];
  const langBase = language.split("-")[0].toLowerCase();
  const inLanguage = langBase
    ? voiceList.filter((v) => v.languages?.includes(langBase))
    : voiceList;
  // Pinned voices always lead, deduped against the language list. They render
  // immediately (static), so the picker is never empty while voices load.
  const pinnedIds = new Set(pinnedVoices.map((v) => v.voiceId));
  const combined = [...pinnedVoices, ...inLanguage.filter((v) => !pinnedIds.has(v.voiceId))];
  const current =
    pinnedVoices.find((v) => v.voiceId === selected) ??
    voiceList.find((v) => v.voiceId === selected);

  // Mirror the current pick (and its metadata, once resolved) to any listener.
  // Keyed on primitives so it fires on a real change, not every render, and
  // via a ref so a fresh callback identity never re-triggers it.
  useEffect(() => {
    onChangeRef.current?.(selected, current ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, current?.voiceId, current?.name, current?.description]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? combined.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.description ?? "").toLowerCase().includes(q) ||
          v.voiceId.toLowerCase().includes(q),
      )
    : combined;

  function stopAudio() {
    audioRef.current?.pause();
    setPlayingId(null);
  }

  function pick(id: string) {
    setSelected(id);
    setOpen(false);
    setQuery("");
    stopAudio();
  }

  function togglePlay(e: React.MouseEvent, v: VoiceOption) {
    e.stopPropagation();
    if (!v.previewUrl) return;
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    if (playingId === v.voiceId) {
      audio.pause();
      setPlayingId(null);
      return;
    }
    audio.src = v.previewUrl;
    audio.onended = () => setPlayingId(null);
    void audio.play();
    setPlayingId(v.voiceId);
  }

  return (
    <div className="relative" ref={ref} data-el-dropdown={open ? "open" : "closed"}>
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-300 focus:border-neutral-900"
      >
        <span className="truncate">
          {current ? current.name : loading ? "Loading…" : selected ? "Custom voice" : placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-neutral-400">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="border-b border-neutral-100 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filtered[0]) pick(filtered[0].voiceId);
                }
              }}
              placeholder="Search voices..."
              className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>

          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            {loading && filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-neutral-400">Loading voices…</li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-neutral-400">
                {langBase && !q
                  ? "No voices for this language on your account yet - paste a voice ID below."
                  : "No voices found"}
              </li>
            ) : (
              filtered.map((v) => (
                <li key={v.voiceId} role="option" aria-selected={v.voiceId === selected}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 ${
                      v.voiceId === selected ? "bg-neutral-100" : "hover:bg-neutral-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => togglePlay(e, v)}
                      disabled={!v.previewUrl}
                      aria-label={playingId === v.voiceId ? "Pause preview" : "Play preview"}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:bg-white disabled:opacity-30"
                    >
                      {playingId === v.voiceId ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => pick(v.voiceId)}
                      className="flex min-w-0 flex-1 flex-col text-left"
                    >
                      <span className={`truncate text-sm ${v.voiceId === selected ? "text-neutral-900" : "text-neutral-800"}`}>{v.name}</span>
                      <VoiceTags description={v.description} className="mt-1" />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-neutral-100 p-2">
            <input
              defaultValue={selected}
              onChange={(e) => setSelected(e.target.value.trim())}
              placeholder="Or paste a voice ID"
              className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}
