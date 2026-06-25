"use client";

import { useFormStatus } from "react-dom";

// Submit button that shows "Calling…" while the test call is being placed.
export function TestCallButton({
  action,
  className,
  idleLabel = "Test call",
}: {
  action: (formData: FormData) => void | Promise<void>;
  className?: string;
  idleLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" formAction={action} disabled={pending} className={className}>
      {pending ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.62 10.79z" />
        </svg>
      )}
      {pending ? "Calling…" : idleLabel}
    </button>
  );
}
