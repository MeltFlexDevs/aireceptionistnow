"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useT } from "@/lib/i18n/client";

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
  /** Defaults to the localized "Saving…". */
  pendingText?: string;
  variant?: keyof typeof VARIANTS;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  icon,
  disabled = false,
  className = "",
}: Props) {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={`press inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium disabled:cursor-wait disabled:opacity-70 ${VARIANTS[variant]} ${className}`}
    >
      {pending ? <Spinner /> : icon}
      {pending ? (pendingText ?? t.common.saving) : children}
    </button>
  );
}
