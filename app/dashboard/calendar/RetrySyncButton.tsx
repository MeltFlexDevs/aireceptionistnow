"use client";

import { useFormStatus } from "react-dom";

// Submit button sized for the failed-sync strip (SubmitButton's base size
// can't shrink reliably against its own utility classes).
export function RetrySyncButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="press shrink-0 rounded-md border border-rose-200 bg-white px-2 py-0.5 text-[11px] font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
