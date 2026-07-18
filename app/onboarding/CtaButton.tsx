"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

// Full-width primary submit button in the funnel's signature CTA style, with the
// form's pending state. Shared by the server steps that submit via server action.
export function CtaButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="onb-cta w-full">
      {pending ? (
        <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
      ) : null}
      {children}
      {!pending && (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </button>
  );
}
