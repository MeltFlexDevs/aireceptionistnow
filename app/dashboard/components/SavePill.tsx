"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";
import type { ActionState } from "@/lib/dashboard/action-state";
import { Check, Info, Spinner } from "../icons";
import { PILL_BASE, PILL_TONE } from "./pill";

interface Props {
  state: ActionState;
  /**
   * In flight. Inside a <form action={formAction}> the SubmitButton already
   * owns the spinner, so leave this off. Pass useActionState's third tuple
   * element for controls that call formAction() programmatically - there
   * useFormStatus stays false and the button shows nothing.
   */
  pending?: boolean;
  /** ms before the success pill fades. 0 keeps it. Errors always persist. */
  successMs?: number;
  className?: string;
}

export function SavePill({ state, pending = false, successMs = 2400, className = "" }: Props) {
  const t = useT();

  if (pending) {
    return (
      <span role="status" aria-live="polite" className={`${PILL_BASE} ${PILL_TONE.neutral} ${className}`}>
        <Spinner className="h-3.5 w-3.5 shrink-0 animate-spin" />
        {t.common.saving}
      </span>
    );
  }

  if (state.ok === null) return null;

  // Keyed on the action's change token so each result remounts with fresh
  // timers - which is also what keeps the fade out of an effect body.
  return <ResultPill key={state.at ?? 0} state={state} successMs={successMs} className={className} />;
}

function ResultPill({
  state,
  successMs,
  className,
}: {
  state: ActionState;
  successMs: number;
  className: string;
}) {
  const t = useT();
  const isError = state.ok === false;
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  // Success is transient; failure sticks until the next submit replaces it.
  // Both setState calls happen in timer callbacks, never synchronously in the
  // effect body.
  useEffect(() => {
    if (isError || !successMs) return;
    const fade = setTimeout(() => setPhase("fade"), successMs);
    const gone = setTimeout(() => setPhase("gone"), successMs + 300);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, [isError, successMs]);

  if (phase === "gone") return null;

  return (
    <span
      role="status"
      aria-live={isError ? "assertive" : "polite"}
      className={`${PILL_BASE} ${isError ? PILL_TONE.error : PILL_TONE.success} ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      } ${className}`}
    >
      {isError ? <Info className="h-3.5 w-3.5 shrink-0" /> : <Check className="h-3.5 w-3.5 shrink-0" />}
      {isError ? state.error : (state.message ?? t.common.saved)}
    </span>
  );
}
