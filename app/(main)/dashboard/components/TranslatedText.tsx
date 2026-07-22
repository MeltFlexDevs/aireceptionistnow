"use client";

import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { useTranslated } from "@/lib/i18n/use-translated";

// Presentational half: shows the translation with a "show original" toggle,
// or just the text when there is nothing to toggle. Labels come from context
// so they flip instantly on a locale switch.
export function ToggleText({
  original,
  translated,
  hasTranslation,
  translating = false,
  className,
}: {
  original: string;
  translated: string;
  hasTranslation: boolean;
  translating?: boolean;
  className?: string;
}) {
  const t = useT();
  const [showOriginal, setShowOriginal] = useState(false);
  const textCls = `${className ?? ""} transition-opacity duration-300 ${translating ? "opacity-70" : "opacity-100"}`;
  if (!hasTranslation) return <p className={textCls}>{translated}</p>;
  return (
    <div>
      <p className={textCls}>{showOriginal ? original : translated}</p>
      <button
        type="button"
        onClick={() => setShowOriginal((v) => !v)}
        className="press mt-1.5 text-[11px] font-medium text-neutral-400 transition-colors hover:text-neutral-900"
      >
        {showOriginal ? t.data.showTranslation : t.data.showOriginal}
      </button>
    </div>
  );
}

// Self-translating text: renders the original immediately, swaps in the
// client-fetched translation the moment it's ready, and re-translates
// whenever the dashboard locale changes.
export function TranslatedText({ text, className }: { text: string; className?: string }) {
  const texts = useMemo(() => [text], [text]);
  const { texts: display, translating, hasTranslation } = useTranslated(texts);
  return (
    <ToggleText
      original={text}
      translated={display[0]}
      hasTranslation={hasTranslation}
      translating={translating}
      className={className}
    />
  );
}
