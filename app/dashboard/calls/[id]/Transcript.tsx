import type { CallTurn } from "@/lib/dashboard/calls";

function clock(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function Transcript({ turns }: { turns: CallTurn[] }) {
  if (turns.length === 0) {
    return <p className="text-sm text-neutral-500">No transcript yet.</p>;
  }
  return (
    <ol className="space-y-4">
      {turns.map((t) => {
        const caller = t.role === "caller";
        return (
          <li key={t.id} className={`flex ${caller ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] ${caller ? "" : "text-right"}`}>
              <div className="mb-1 flex items-center gap-2 text-[11px] text-neutral-400">
                <span className="font-medium uppercase tracking-wide">{caller ? "Caller" : "Assistant"}</span>
                <span className="tabular-nums">{clock(t.tsMs)}</span>
              </div>
              <div
                className={`inline-block rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  caller ? "bg-neutral-100 text-neutral-800" : "bg-neutral-900 text-white"
                }`}
              >
                {t.text}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
