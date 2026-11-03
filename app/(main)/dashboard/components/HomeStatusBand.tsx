"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { statusBandState } from "@/lib/dashboard/status-band";
import { PowerButton, toggleAssistant } from "./AssistantPowerToggle";

// Home status band. The dot, the headline and the Pause/Resume button read one
// optimistic state, so they always agree; router.refresh() then loads the
// saved state from the server.
export function HomeStatusBand({
  toggleId,
  enabled,
  hasAssistant,
  hasNumber,
  answeringText,
  pausedText,
  noNumberText,
  pauseLabel,
  resumeLabel,
  children,
}: {
  /** The assistant the button pauses; null hides the button. */
  toggleId: string | null;
  enabled: boolean;
  hasAssistant: boolean;
  hasNumber: boolean;
  answeringText: string;
  pausedText: string;
  noNumberText: string;
  pauseLabel: string;
  resumeLabel: string;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [on, setOn] = useOptimistic(enabled);
  const [pending, startTransition] = useTransition();
  const state = statusBandState(hasAssistant, hasNumber, on);

  const onToggle = () => {
    if (!toggleId) return;
    startTransition(async () => {
      setOn(!on);
      await toggleAssistant(toggleId, !on);
      router.refresh();
    });
  };

  return (
    <div className="shape-card glass flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2.5 px-5 py-3.5">
      <p className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-neutral-900">
        <span
          aria-hidden
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            state === "offline" ? "bg-rose-500" : state === "live" ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span className="truncate">
          {state === "offline" ? noNumberText : state === "live" ? answeringText : pausedText}
        </span>
      </p>
      <div className="ml-auto flex items-center gap-2">
        {toggleId && (
          <PowerButton
            on={on}
            pending={pending}
            onClick={onToggle}
            pauseLabel={pauseLabel}
            resumeLabel={resumeLabel}
          />
        )}
        {children}
      </div>
    </div>
  );
}
