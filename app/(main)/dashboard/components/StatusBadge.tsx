import { Check } from "../icons";

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

/**
 * "Configured" / "Set up" pill for a settings surface.
 *
 * Distinct from StatusRow above, which reports a live health signal (a calendar
 * that is erroring, a notification that failed). This one reports whether the
 * user has finished configuring something - a flat done/not-done, where
 * not-done is an invitation rather than a fault. Hence amber, never red.
 *
 * Wording is a prop rather than a dictionary lookup: the pages using this
 * already have the right words in their own namespaces ("Connected" on one,
 * "Configured" on another), and routing them through one shared key would make
 * the copy worse to make the code marginally shorter.
 */
export function SetupBadge({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
        done ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-800"
      }`}
    >
      {done && <Check className="h-3 w-3" />}
      {label}
    </span>
  );
}
