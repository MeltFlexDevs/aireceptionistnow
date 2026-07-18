"use client";

import { useT } from "@/lib/i18n/client";

// Segment error boundary: an action/render crash (e.g. an oversized request
// body rejected before the action runs) shows a friendly retry instead of the
// framework error screen. Funnel progress is persisted server-side.
export default function OnboardingError({ reset }: { error: Error; reset: () => void }) {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="rise shape-card glass flex w-full max-w-sm flex-col items-center px-8 py-10 text-center">
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 ring-1 ring-rose-100">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </span>

        <p className="text-base font-medium leading-snug text-neutral-900">
          {t.onboarding.somethingWrong}
        </p>

        <button
          type="button"
          onClick={reset}
          className="press mt-7 inline-flex h-10 items-center gap-2 rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          {t.onboarding.retry}
        </button>
      </div>
    </div>
  );
}
