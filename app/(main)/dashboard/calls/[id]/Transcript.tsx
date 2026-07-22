import type { CallTurn } from "@/lib/dashboard/calls";
import { getDictionary } from "@/lib/i18n/server";
import { TranscriptView } from "./TranscriptView";

function elapsed(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Renders originals; TranscriptView translates client-side into the current
// dashboard locale, so this never blocks a server render on the model.
export async function Transcript({ turns }: { turns: CallTurn[] }) {
  const d = (await getDictionary()).calls.detail;
  return (
    <TranscriptView
      turns={turns.map((turn) => ({
        id: turn.id,
        caller: turn.role === "caller",
        text: turn.text,
        atLabel: turn.atLabel,
        elapsedTitle: d.elapsedIntoCall.replace("{time}", elapsed(turn.tsMs)),
      }))}
    />
  );
}
