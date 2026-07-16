import type { CallTurn } from "@/lib/dashboard/calls";
import { translateTexts } from "@/lib/dashboard/translate";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { TranscriptView } from "./TranscriptView";

function elapsed(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// translate=false renders instantly (used as the Suspense fallback while the
// cached translation streams in).
export async function Transcript({
  turns,
  translate = true,
}: {
  turns: CallTurn[];
  translate?: boolean;
}) {
  const t = await getDictionary();
  if (turns.length === 0) {
    return <p className="text-sm text-neutral-500">{t.data.noTranscript}</p>;
  }
  const texts = turns.map((turn) => turn.text);
  const translated = translate ? await translateTexts(texts, await getLocale()) : texts;
  const hasTranslation = translated.some((s, i) => s.trim() !== texts[i].trim());
  return (
    <TranscriptView
      turns={turns.map((turn, i) => ({
        id: turn.id,
        caller: turn.role === "caller",
        text: turn.text,
        translated: translated[i],
        atLabel: turn.atLabel,
        elapsedTitle: `${elapsed(turn.tsMs)} into the call`,
      }))}
      hasTranslation={hasTranslation}
      labels={{
        caller: t.data.talkCaller,
        ai: t.data.talkAi,
        showOriginal: t.data.showOriginal,
        showTranslation: t.data.showTranslation,
      }}
    />
  );
}
