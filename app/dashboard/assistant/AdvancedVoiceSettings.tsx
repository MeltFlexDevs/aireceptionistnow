"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/client";
import { VoiceSelect } from "../numbers/VoiceSelect";

export interface LangOption {
  code: string;
  name: string;
  flag: string;
}

interface Props {
  defaultSpeed: number;
  defaultStability: number;
  voiceByLanguage: Record<string, string>;
  languages: LangOption[];
}

const SPEED = { min: 0.7, max: 1.2, step: 0.05 } as const;
const STABILITY = { min: 0, max: 1, step: 0.05 } as const;

function Slider({
  name,
  label,
  hint,
  min,
  max,
  step,
  defaultValue,
  format,
}: {
  name: string;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  format: (v: number) => string;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        <span className="tabular-nums text-sm font-medium text-neutral-900">{format(value)}</span>
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 w-full accent-neutral-900"
      />
      <p className="mt-1 text-xs text-neutral-400">{hint}</p>
    </div>
  );
}

export function AdvancedVoiceSettings({ defaultSpeed, defaultStability, voiceByLanguage, languages }: Props) {
  const t = useT();
  const byCode = new Map(languages.map((l) => [l.code, l]));
  const [rows, setRows] = useState<string[]>(() =>
    languages.filter((l) => voiceByLanguage[l.code]).map((l) => l.code),
  );
  const available = languages.filter((l) => !rows.includes(l.code));

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Slider
          name="voice_speed"
          label="Speaking speed"
          hint="How fast the voice talks. 1.0× is natural."
          {...SPEED}
          defaultValue={defaultSpeed}
          format={(v) => `${v.toFixed(2)}×`}
        />
        <Slider
          name="voice_stability"
          label="Stability"
          hint="Higher is steadier and calmer; lower is more expressive."
          {...STABILITY}
          defaultValue={defaultStability}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </div>

      <div className="border-t border-neutral-100 pt-5">
        <h3 className="text-sm font-medium text-neutral-900">{t.assistants.voicePerLanguage}</h3>
        <p className="mt-0.5 text-xs text-neutral-500">
          Give a language its own voice. Any language you don&apos;t set here uses your default voice,
          matched to the caller automatically.
        </p>

        {rows.length > 0 && (
          <ul className="mt-4 space-y-2">
            {rows.map((code) => {
              const l = byCode.get(code);
              if (!l) return null;
              return (
                <li
                  key={code}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200/70 bg-white/60 p-3"
                >
                  <span className="flex w-28 shrink-0 items-center gap-2 text-sm font-medium text-neutral-800">
                    <span aria-hidden>{l.flag}</span>
                    <span className="truncate">{l.name}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <VoiceSelect
                      name={`voice_lang_${code}`}
                      defaultValue={voiceByLanguage[code] ?? ""}
                      placeholder="Choose a voice"
                      language={code}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setRows((r) => r.filter((c) => c !== code))}
                    aria-label={`Remove ${l.name} voice`}
                    className="press flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {available.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              const code = e.target.value;
              if (code) setRows((r) => [...r, code]);
            }}
            className="press mt-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 outline-none hover:border-neutral-300 focus:border-neutral-900"
          >
            <option value="" disabled>
              + Add a language…
            </option>
            {available.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
