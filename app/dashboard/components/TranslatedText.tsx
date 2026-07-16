"use client";

import { useState } from "react";

interface Props {
  original: string;
  translated: string;
  labels: { showOriginal: string; showTranslation: string };
  className?: string;
}

export function TranslatedText({ original, translated, labels, className }: Props) {
  const [showOriginal, setShowOriginal] = useState(false);
  if (translated.trim() === original.trim()) return <p className={className}>{original}</p>;
  return (
    <div>
      <p className={className}>{showOriginal ? original : translated}</p>
      <button
        type="button"
        onClick={() => setShowOriginal((v) => !v)}
        className="press mt-1.5 text-[11px] font-medium text-neutral-400 transition-colors hover:text-neutral-900"
      >
        {showOriginal ? labels.showTranslation : labels.showOriginal}
      </button>
    </div>
  );
}
