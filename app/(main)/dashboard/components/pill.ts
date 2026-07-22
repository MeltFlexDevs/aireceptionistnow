/**
 * Pill classes, kept apart from SavePill.tsx so server components can render a
 * static pill (e.g. the ?connected=1 success chip on Appointments) without
 * pulling a client component in.
 */
export const PILL_BASE =
  "shape-pill inline-flex max-w-full items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-opacity duration-300";

export const PILL_TONE = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-neutral-200 bg-white text-neutral-500",
} as const;
