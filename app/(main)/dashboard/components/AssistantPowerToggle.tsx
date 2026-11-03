"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleAssistantEnabledAction } from "@/app/(main)/dashboard/assistant/actions";

// Sends the enable/disable server action; `enabled` is the new state.
export async function toggleAssistant(id: string, enabled: boolean): Promise<void> {
  const fd = new FormData();
  fd.set("id", id);
  fd.set("enabled", enabled ? "1" : "0");
  await toggleAssistantEnabledAction(fd);
}

// Pause/Resume control with an optimistic flip so the button reacts at once.
// After the action it refreshes the route, so server-rendered status text
// catches up. Home uses HomeStatusBand instead: there the status pill reads
// the same optimistic state as the button.
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
  const router = useRouter();
  const [optimistic, setOptimistic] = useOptimistic(enabled);
  const [pending, startTransition] = useTransition();

  const onClick = () =>
    startTransition(async () => {
      setOptimistic(!optimistic);
      await toggleAssistant(id, !optimistic);
      router.refresh();
    });

  return (
    <PowerButton
      on={optimistic}
      pending={pending}
      onClick={onClick}
      pauseLabel={pauseLabel}
      resumeLabel={resumeLabel}
    />
  );
}

export function PowerButton({
  on,
  pending,
  onClick,
  pauseLabel,
  resumeLabel,
}: {
  on: boolean;
  pending: boolean;
  onClick: () => void;
  pauseLabel: string;
  resumeLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      aria-pressed={on}
      className={`press inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${
        on
          ? "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900"
          : "bg-neutral-900 text-white hover:bg-neutral-800"
      }`}
    >
      {on ? (
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
      {on ? pauseLabel : resumeLabel}
    </button>
  );
}
