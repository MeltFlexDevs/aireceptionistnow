// Status ball + label. Palette: green = ok, yellow = warning, red = error.
// Pure presentational server component.

export type StatusTone = "ok" | "warn" | "error";

const DOT: Record<StatusTone, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  error: "bg-rose-500",
};
const TEXT: Record<StatusTone, string> = {
  ok: "text-emerald-600",
  warn: "text-amber-600",
  error: "text-rose-600",
};

function resolveTone(tone?: StatusTone, ok?: boolean): StatusTone {
  return tone ?? (ok ? "ok" : "error");
}

export function StatusDot({ tone, ok }: { tone?: StatusTone; ok?: boolean }) {
  const t = resolveTone(tone, ok);
  return (
    <span
      aria-hidden
      className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${DOT[t]}`}
    />
  );
}

interface StatusRowProps {
  tone?: StatusTone;
  ok?: boolean;
  label: string;
  /** Shown when not ok. */
  detail?: string;
}

export function StatusRow({ tone, ok, label, detail }: StatusRowProps) {
  const t = resolveTone(tone, ok);
  return (
    <div className="flex items-center gap-2">
      <StatusDot tone={t} />
      <span className="text-sm font-medium text-neutral-900">{label}</span>
      <span className={`text-xs ${TEXT[t]}`}>
        {t === "ok" ? "OK" : (detail ?? (t === "warn" ? "Warning" : "Not connected"))}
      </span>
    </div>
  );
}
