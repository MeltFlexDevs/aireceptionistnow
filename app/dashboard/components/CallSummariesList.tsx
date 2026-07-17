"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useT } from "@/lib/i18n/client";
import { useTranslated } from "@/lib/i18n/use-translated";
import { ToggleText } from "./TranslatedText";

export interface SummaryItemView {
  id: string;
  /** Pre-formatted phone number; empty when unknown. */
  name: string;
  time: string;
  at: string;
  text: string;
  tags: string[];
}

// One batched translation request for the whole list (stable batch → stable
// server cache key); originals render instantly and swap when ready.
export function CallSummariesList({ items }: { items: SummaryItemView[] }) {
  const t = useT();
  const texts = useMemo(() => items.map((s) => s.text), [items]);
  const { texts: display, translating, hasTranslation } = useTranslated(texts);
  return (
    <ul className="space-y-4">
      {items.map((s, i) => (
        <li key={s.id} className={i > 0 ? "border-t border-neutral-100 pt-4" : ""}>
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/dashboard/calls/${s.id}`}
              className="text-sm font-medium text-neutral-900 hover:underline"
            >
              {s.name || t.data.unknownCaller}
            </Link>
            <span className="text-xs text-neutral-400" title={s.at}>
              {s.time}
            </span>
          </div>
          <div className="mt-1">
            <ToggleText
              original={s.text}
              translated={display[i]}
              hasTranslation={hasTranslation && display[i].trim() !== s.text.trim()}
              translating={translating}
              className="text-sm leading-relaxed text-neutral-600"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {s.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                {tag}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
