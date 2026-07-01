"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

// Submit button wired to its <form>'s pending state: shows a spinner, swaps to
// a "working" label, disables itself, and flips to the wait cursor while the
// server action runs. Drop-in replacement for a plain submit <button>.

const VARIANTS = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-800",
  secondary: "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50",
  danger: "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
} as const;

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  );
}

interface Props {
  children: ReactNode;
  /** Label shown while the action runs (defaults to "Working…"). */
  pendingText?: string;
  variant?: keyof typeof VARIANTS;
  /** Icon shown when idle (hidden while pending in favour of the spinner). */
  icon?: ReactNode;
  /** Extra gate (e.g. not signed in) merged with the pending state. */
  disabled?: boolean;
  className?: string;
}

export function SubmitButton({
  children,
  pendingText = "Working…",
  variant = "primary",
  icon,
  disabled = false,
  className = "",
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${VARIANTS[variant]} ${className}`}
    >
      {pending ? <Spinner /> : icon}
      {pending ? pendingText : children}
    </button>
  );
}
