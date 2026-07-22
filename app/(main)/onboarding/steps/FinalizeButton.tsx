"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/client";
import { Spinner } from "@/app/(main)/dashboard/icons";
import { AiAvatar } from "../AiAvatar";
import { fillTemplate } from "../personality";
import { calendarContinueAction } from "../actions";

// Step 3's primary CTA. Instead of a plain "continue", it commits the funnel:
// on click it saves the calendar step and hands off to checkout, but first it
// raises a full-screen "creating your assistant" moment so the transition into
// payment feels like the assistant is actually being assembled. The server
// action redirects to the plan step, which unmounts this overlay for us.
export function FinalizeButton({ assistantName = "" }: { assistantName?: string }) {
  const t = useT();
  const o = t.onboarding;
  const name = assistantName.trim();
  const [creating, setCreating] = useState(false);

  async function finalize() {
    if (creating) return;
    setCreating(true);
    // Let the "creating" state breathe before the hand-off; the redirect that
    // calendarContinueAction throws is applied by the router, so the overlay
    // stays up straight through the navigation to the payment step.
    await new Promise((r) => setTimeout(r, 1500));
    try {
      await calendarContinueAction();
    } catch {
      // The action always redirects on success; only a genuine failure lands
      // here - drop the overlay so the button is usable again.
      setCreating(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={finalize}
        disabled={creating}
        data-ready="true"
        className="onb-cta w-full"
      >
        {o.finalizeAssistant}
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      {creating && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/85 px-6 text-center backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="rise flex flex-col items-center">
            <div className="ava-aura">
              <div className="ava-disc">
                <AiAvatar mood="friendly" className="h-[74%] w-[74%]" />
              </div>
            </div>
            <Spinner className="mt-6 h-6 w-6 animate-spin text-neutral-400" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900">
              {name ? fillTemplate(o.finalizingTitleNamed, { name }) : o.finalizingTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
              {o.finalizingSub}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
