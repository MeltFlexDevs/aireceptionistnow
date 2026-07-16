"use client";

import { useState } from "react";

export interface TranscriptTurnView {
  id: number;
  caller: boolean;
  text: string;
  translated: string;
  atLabel: string;
  elapsedTitle: string;
}

interface Props {
  turns: TranscriptTurnView[];
  hasTranslation: boolean;
  labels: { caller: string; ai: string; showOriginal: string; showTranslation: string };
}

export function TranscriptView({ turns, hasTranslation, labels }: Props) {
  const [showOriginal, setShowOriginal] = useState(false);
  return (
    <div>
      {hasTranslation && (
        <div className="mb-3 text-right">
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className="press text-[11px] font-medium text-neutral-400 transition-colors hover:text-neutral-900"
          >
            {showOriginal ? labels.showTranslation : labels.showOriginal}
          </button>
        </div>
      )}
      <ol className="space-y-4">
        {turns.map((turn) => (
          <li key={turn.id} className={`flex ${turn.caller ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] ${turn.caller ? "" : "text-right"}`}>
              <div className="mb-1 flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="font-medium uppercase tracking-wide">
                  {turn.caller ? labels.caller : labels.ai}
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
                {showOriginal ? turn.text : turn.translated}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
