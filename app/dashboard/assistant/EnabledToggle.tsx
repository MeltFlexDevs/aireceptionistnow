"use client";

import { useOptimistic, useTransition } from "react";
import { toggleAssistantEnabledAction } from "./actions";

// Optimistic Enable/Disable: the label + status pill flip the instant you click,
// before the server action returns. The action revalidates the page, so if it
// ever fails the server-rendered truth replaces the optimistic guess on refresh.
export function EnabledToggle({ id, enabled }: { id: string; enabled: boolean }) {
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
    <div className="flex items-center gap-3 sm:gap-4">
      <span
        className={`hidden items-center gap-1.5 text-xs sm:inline-flex ${
          optimistic ? "text-emerald-600" : "text-amber-600"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${optimistic ? "bg-emerald-500" : "bg-amber-500"}`} />
        {optimistic ? "Active" : "Disabled"}
      </span>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-busy={pending}
        aria-pressed={optimistic}
        className={`press inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-xs font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${
          optimistic
            ? "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
            : "bg-neutral-900 text-white hover:bg-neutral-800"
        }`}
      >
        {optimistic ? "Disable" : "Enable"}
      </button>
    </div>
  );
}
