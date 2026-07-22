"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import { SavePill } from "../components/SavePill";
import { SubmitButton } from "../components/SubmitButton";
import { ChevronRight } from "../icons";
import { updateAssistantAction } from "./actions";

/**
 * One topic, one card, one self-saving modal. No sticky save bar anywhere.
 *
 * The form posts only its own section marker, so the patch leaves every other
 * setting alone (lib/dashboard/assistant-patch.ts). Saving awaits the agent
 * sync, which takes seconds - the modal stays open and pending until it
 * resolves, so a sync failure lands in front of the user instead of a log.
 */
export function TopicModal({
  assistantId,
  section,
  icon,
  title,
  subtitle,
  summary,
  children,
}: {
  assistantId: string;
  /** The SECTION marker this modal owns. */
  section: string;
  /** Leading glyph for the feature card. */
  icon?: ReactNode;
  title: string;
  subtitle: string;
  /** What the card shows at rest, e.g. the current voice name. */
  summary: ReactNode;
  children: ReactNode;
}) {
  const t = useT();
  const a = t.assistants;
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateAssistantAction,
    IDLE,
  );

  // Close on a clean save; a failure keeps the modal open with the error.
  // Derived while rendering, not in an effect: setState in an effect body
  // causes a cascading render, and this needs no external synchronization.
  const [seenSave, setSeenSave] = useState(state.at);
  if (state.ok && state.at !== seenSave) {
    setSeenSave(state.at);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending]);

  return (
    <>
      {/* Feature card: icon, what the setting is, what it does, and its current
          value. The whole card opens the editor - no repeated "Edit" button. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={a.edit + " - " + title}
        className="group flex h-full w-full items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50/50"
      >
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-neutral-900">{title}</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-neutral-500">{subtitle}</span>
          {summary && (
            <span className="mt-1.5 block truncate text-sm font-medium text-neutral-800">{summary}</span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {/* The pill lives on the card, so a save is still visible after the
              modal closes. */}
          <SavePill state={state} />
          <ChevronRight className="h-5 w-5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500" />
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
          onClick={(e) => e.target === e.currentTarget && !pending && setOpen(false)}
        >
          <form
            action={formAction}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            aria-busy={pending}
            className="glass shape-card flex max-h-[85dvh] w-full max-w-lg flex-col p-5"
          >
            <input type="hidden" name="id" value={assistantId} />
            <input type="hidden" name={section} value="1" />

            <div className="flex shrink-0 items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-neutral-900">{title}</h2>
                <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                aria-label={t.common.close}
                className="press -mr-1 -mt-1 rounded-lg p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            {/* Only the body scrolls. */}
            <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto">{children}</div>

            <div className="mt-4 flex shrink-0 items-center justify-end gap-3">
              {state.ok === false && <SavePill state={state} />}
              <SubmitButton pendingText={a.updating}>{t.common.save}</SubmitButton>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
