// Red/green status ball + label, used across the dashboard for integration and
// service health. Pure presentational server component.

export function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
        ok ? "bg-emerald-500" : "bg-rose-500"
      }`}
    />
  );
}

interface StatusRowProps {
  ok: boolean;
  label: string;
  /** Shown when not ok (e.g. "Invalid API key."). */
  detail?: string;
}

export function StatusRow({ ok, label, detail }: StatusRowProps) {
  return (
    <div className="flex items-center gap-2">
      <StatusDot ok={ok} />
      <span className="text-sm font-medium text-neutral-900">{label}</span>
      <span className={`text-xs ${ok ? "text-emerald-600" : "text-rose-600"}`}>
        {ok ? "OK" : (detail ?? "Not connected")}
      </span>
    </div>
  );
}
