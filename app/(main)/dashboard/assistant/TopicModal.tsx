"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import { SavePill } from "../components/SavePill";
import { SubmitButton } from "../components/SubmitButton";
import { Modal, MODAL_PANEL } from "../components/Modal";
import { CARD_INTERACTIVE } from "../components/card";
import { SetupBadge } from "../components/StatusBadge";
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
  done,
  todoLabel,
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
  /**
   * Whether this topic is configured. Undefined opts the card out of the
   * status system entirely - every card currently opts in, and a card without
   * a status reads as "nothing to finish here", which is a claim, not a default.
   */
  done?: boolean;
  /** Call to action shown on an unconfigured card, e.g. "Choose a voice". */
  todoLabel?: string;
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

  return (
    <>
      {/* Feature card: icon, what the setting is, what it does, its current
          value, and whether it is finished. The whole card opens the editor -
          no chevron and no "Edit" button, because a card that is entirely a
          button does not need to advertise it twice. Hover lifts instead. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={a.edit + " - " + title}
        className={`${CARD_INTERACTIVE} group flex h-full w-full flex-col p-6 ${
          // An unfinished card overrides the neutral surface with amber. Listed
          // after CARD_INTERACTIVE so these win on the border and background.
          done === false ? "border-amber-200 bg-amber-50/30 hover:border-amber-300" : ""
        }`}
      >
        <span className="flex w-full items-start gap-4">
          {icon && (
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                done === false
                  ? "bg-amber-100 text-amber-700"
                  : "bg-neutral-100 text-neutral-700 group-hover:bg-neutral-200"
              }`}
            >
              {icon}
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-neutral-900">{title}</span>
            <span className="mt-1 block text-[13px] leading-relaxed text-neutral-500">
              {subtitle}
            </span>
          </span>
          <SavePill state={state} />
        </span>

        {/* Bottom row: what is set now, or what to do about it. Kept on its own
            line so the value never competes with the description for width. */}
        <span className="mt-4 flex w-full items-end justify-between gap-3 pt-3 border-t border-neutral-100">
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-800">
            {done === false ? (
              <span className="text-amber-700">{todoLabel ?? a.setupNotDone}</span>
            ) : (
              summary
            )}
          </span>
          {done !== undefined && (
            <SetupBadge done={done} label={done ? a.setupDone : a.setupNotDone} />
          )}
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} busy={pending}>
        <form
          action={formAction}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          aria-busy={pending}
          className={`${MODAL_PANEL} flex max-h-[85dvh] w-full max-w-lg flex-col p-5`}
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
      </Modal>
    </>
  );
}
