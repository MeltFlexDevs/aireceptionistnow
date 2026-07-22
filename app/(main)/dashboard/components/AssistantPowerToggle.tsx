"use client";

import { useOptimistic, useTransition } from "react";
import { toggleAssistantEnabledAction } from "@/app/(main)/dashboard/assistant/actions";

// Hero Pause/Resume control. Reuses the assistant enable/disable server action
// but presents it as the overview's primary "is it answering?" switch, with an
// optimistic flip so the button reacts instantly; the surrounding status pill
// catches up on revalidation.
export function AssistantPowerToggle({
  id,
  enabled,
  pauseLabel,
  resumeLabel,
}: {
  id: string;
  enabled: boolean;
  pauseLabel: string;
  resumeLabel: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(enabled);
  const [pending, startTransition] = useTransition();

  const onClick = () =>
    startTransition(async () => {
      setOptimistic(!optimistic);
      const fd = new FormData();
      fd.set("id", id);
      fd.set("enabled", optimistic ? "0" : "1");
      await toggleAssistantEnabledAction(fd);
    });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      aria-pressed={optimistic}
      className={`press inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${
        optimistic
          ? "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900"
          : "bg-neutral-900 text-white hover:bg-neutral-800"
      }`}
    >
      {optimistic ? (
        // pause glyph
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="6" y="5" width="4" height="14" rx="1.5" />
          <rect x="14" y="5" width="4" height="14" rx="1.5" />
        </svg>
      ) : (
        // play glyph
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 7 5.5z" />
        </svg>
      )}
      {optimistic ? pauseLabel : resumeLabel}
    </button>
  );
}
