"use client";

import { useActionState, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import { SavePill } from "../components/SavePill";
import { SubmitButton } from "../components/SubmitButton";
import { Modal, MODAL_PANEL } from "../components/Modal";
import { ValidatedForm, OptionalMark } from "@/app/components/forms/validated-form";
import { updateKnowledgeNotesAction } from "./actions";

/**
 * One topic, saves itself, closes on success. No sticky save bar anywhere.
 */
export function NotesModal({
  orgId,
  notes,
  trigger,
}: {
  orgId: string;
  notes: string;
  /** Override the default button, e.g. the "Edit" link on the notes row. */
  trigger?: (open: () => void) => React.ReactNode;
}) {
  const t = useT();
  const k = t.knowledge;
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateKnowledgeNotesAction,
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
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press h-9 shrink-0 rounded-lg border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          {k.teachNotes}
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} busy={pending}>
        <ValidatedForm
          action={formAction}
          role="dialog"
          aria-modal="true"
          aria-label={k.notesTitle}
          aria-busy={pending}
          className={`${MODAL_PANEL} flex max-h-[80dvh] w-full max-w-xl flex-col p-5`}
        >
          <input type="hidden" name="id" value={orgId} />
          <div className="flex shrink-0 items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-neutral-900">
                {k.notesTitle}
                <OptionalMark />
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{k.notesHint}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              aria-label={t.common.close}
              className="press -mr-1 -mt-1 flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-900 disabled:opacity-40"
            >
              ✕
            </button>
          </div>

          {/* Only the body scrolls. */}
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
            <textarea
              name="knowledge_notes"
              rows={10}
              defaultValue={notes}
              placeholder={k.notesPlaceholder}
              className="w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm leading-relaxed text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900"
            />
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-end gap-3">
            <SavePill state={state} />
            <SubmitButton>{t.common.save}</SubmitButton>
          </div>
        </ValidatedForm>
      </Modal>
    </>
  );
}
