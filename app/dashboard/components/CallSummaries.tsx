import Link from "next/link";
import type { Summary } from "@/lib/dashboard/analytics";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { translateTexts } from "@/lib/dashboard/translate";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { TranslatedText } from "./TranslatedText";

// translate=false renders instantly (Suspense fallback while the cached
// translation streams in).
export async function CallSummaries({
  items,
  translate = true,
}: {
  items: Summary[];
  translate?: boolean;
}) {
  const t = await getDictionary();
  const texts = items.map((s) => s.text);
  const translated = translate ? await translateTexts(texts, await getLocale()) : texts;
  const labels = { showOriginal: t.data.showOriginal, showTranslation: t.data.showTranslation };
  return (
    <ul className="space-y-4">
      {items.map((s, i) => (
        <li key={s.id} className={i > 0 ? "border-t border-neutral-100 pt-4" : ""}>
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/dashboard/calls/${s.id}`}
              className="text-sm font-medium text-neutral-900 hover:underline"
            >
              {formatPhone(s.name) || t.data.unknownCaller}
            </Link>
            <span className="text-xs text-neutral-400" title={s.at}>
              {s.time}
            </span>
          </div>
          <div className="mt-1">
            <TranslatedText
              original={s.text}
              translated={translated[i]}
              labels={labels}
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
