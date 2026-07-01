"use client";

import { useEffect, useRef, useState } from "react";
import { loadVoices } from "./voiceActions";
import { FALLBACK_VOICES, type VoiceOption } from "./voices";

interface Props {
  name?: string;
  defaultValue?: string;
}

export function VoiceSelect({ name = "voice_id", defaultValue = "" }: Props) {
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    if (loaded) return;
    // Load when the dropdown opens, or on mount when a voice is already set - so
    // the trigger shows its name instead of the raw voice ID.
    if (!open && !selected) return;
    setLoading(true);
    loadVoices()
      .then((list) => setVoices(list.length > 0 ? list : FALLBACK_VOICES))
      .catch(() => setVoices(FALLBACK_VOICES))
      .finally(() => {
        setLoaded(true);
        setLoading(false);
      });
  }, [open, loaded, selected]);

  const current = voices.find((v) => v.voiceId === selected);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? voices.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.description ?? "").toLowerCase().includes(q) ||
          v.voiceId.toLowerCase().includes(q),
      )
    : voices;

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
    <div className="relative" ref={ref}>
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors hover:border-neutral-300 focus:border-neutral-900"
      >
        <span className="truncate">
          {current ? current.name : loading ? "Loading…" : selected ? "Custom voice" : "Select a voice"}
          {current?.description ? <span className="ml-2 text-xs text-neutral-400">{current.description}</span> : null}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-neutral-400">
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
                  if (filtered[0]) pick(filtered[0].voiceId);
                }
              }}
              placeholder="Search voices..."
              className="w-full rounded-md border border-neutral-200 px-2.5 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>

          <ul className="max-h-64 overflow-y-auto py-1" role="listbox">
            {loading ? (
              <li className="px-3 py-3 text-sm text-neutral-400">Loading voices…</li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-neutral-400">No voices found</li>
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
                      {v.description ? <span className="truncate text-xs text-neutral-400">{v.description}</span> : null}
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
