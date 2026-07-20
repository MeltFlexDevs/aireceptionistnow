"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/lib/i18n/client";
import { formatPhone } from "@/lib/call-engine/voice/phone-language";
import { AssistantPowerToggle } from "./AssistantPowerToggle";
import { useShell } from "./ShellProviders";
import { Phone } from "../icons";

/**
 * Clicking the sidebar avatar opens this instead of navigating - the wordmark
 * beside it keeps the link home. Shows what the receptionist is doing right
 * now, its number, and the one control worth having a click away: Pause/Resume.
 */
export function AvatarStatusPopover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const { status, number, assistant } = useShell();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      // The avatar button toggles on its own click; ignore anything inside it
      // so opening does not immediately close again.
      const el = e.target as Node;
      if (ref.current?.contains(el)) return;
      if ((el as HTMLElement).closest?.("[data-avatar-trigger]")) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const statusLine =
    status === "online" ? t.home.statusAnswering : status === "paused" ? t.home.statusPaused : t.home.statusNoNumber;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={t.home.statusTitle}
      className="glass shape-card absolute left-1/2 top-full z-30 mt-2 w-60 -translate-x-1/2 p-3.5 text-left"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-neutral-900">
        <span
          aria-hidden
          className={`h-2 w-2 shrink-0 rounded-full ${
            status === "online" ? "bg-emerald-500" : status === "paused" ? "bg-amber-500" : "bg-rose-500"
          }`}
        />
        {statusLine}
      </p>

      {number && <p className="mt-1 text-[13px] tabular-nums text-neutral-500">{formatPhone(number)}</p>}

      <div className="mt-3 flex flex-col gap-2">
        {assistant && (
          <AssistantPowerToggle
            id={assistant.id}
            enabled={assistant.enabled}
            pauseLabel={t.home.pause}
            resumeLabel={t.home.resume}
          />
        )}
        {number && (
          <a
            href={`tel:${number}`}
            className="press inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 text-[13px] font-medium text-neutral-700 hover:border-neutral-400 hover:text-neutral-900"
          >
            <Phone className="h-3.5 w-3.5" />
            {t.home.callToTry}
          </a>
        )}
      </div>
    </div>
  );
}
