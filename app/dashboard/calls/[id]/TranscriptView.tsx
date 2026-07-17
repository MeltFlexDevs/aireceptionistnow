"use client";

import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { useTranslated } from "@/lib/i18n/use-translated";

export interface TranscriptTurnView {
  id: number;
  caller: boolean;
  text: string;
  atLabel: string;
  elapsedTitle: string;
}

// Originals render instantly; the whole transcript translates client-side in
// one batched request and re-translates the moment the locale changes.
export function TranscriptView({ turns }: { turns: TranscriptTurnView[] }) {
  const t = useT();
  const [showOriginal, setShowOriginal] = useState(false);
  const texts = useMemo(() => turns.map((turn) => turn.text), [turns]);
  const { texts: display, translating, hasTranslation } = useTranslated(texts);

  if (turns.length === 0) {
    return <p className="text-sm text-neutral-500">{t.data.noTranscript}</p>;
  }

  return (
    <div>
      {hasTranslation && (
        <div className="mb-3 text-right">
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className="press text-[11px] font-medium text-neutral-400 transition-colors hover:text-neutral-900"
          >
            {showOriginal ? t.data.showTranslation : t.data.showOriginal}
          </button>
        </div>
      )}
      <ol className={`space-y-4 transition-opacity duration-300 ${translating ? "opacity-70" : "opacity-100"}`}>
        {turns.map((turn, i) => (
          <li key={turn.id} className={`flex ${turn.caller ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] ${turn.caller ? "" : "text-right"}`}>
              <div className="mb-1 flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="font-medium uppercase tracking-wide">
                  {turn.caller ? t.data.talkCaller : t.data.talkAi}
                </span>
                {turn.atLabel && (
                  <span className="tabular-nums" title={turn.elapsedTitle}>
                    {turn.atLabel}
                  </span>
                )}
              </div>
              <div
                className={`inline-block rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  turn.caller ? "bg-neutral-100 text-neutral-800" : "bg-neutral-900 text-white"
                }`}
              >
                {showOriginal ? turn.text : display[i]}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
