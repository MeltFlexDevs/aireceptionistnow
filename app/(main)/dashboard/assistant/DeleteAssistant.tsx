"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/client";
import { SubmitButton } from "../components/SubmitButton";
import { Modal, MODAL_PANEL } from "../components/Modal";
import { deleteAssistantAction } from "./actions";

export function DeleteAssistant({ id, name }: { id: string; name: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const confirmed =
    text.trim() === name.trim() || text.trim().toLowerCase() === "delete";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press inline-flex h-9 items-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
      >
        {t.assistants.deleteAssistant}
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.assistants.deleteAssistant}
          className={`${MODAL_PANEL} w-full max-w-md p-6`}
        >
          <h3 className="text-base font-medium text-neutral-900">{t.assistants.deleteAssistant}</h3>
          <p className="mt-1 text-sm text-neutral-500">{t.assistants.deleteBody}</p>
          <p className="mt-2 text-sm text-neutral-500">
            {t.assistants.deleteConfirmLabel.replace("{name}", name)}
          </p>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={name}
            className="mt-4 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-rose-400"
          />
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="press inline-flex h-9 items-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              {t.common.cancel}
            </button>
            <form action={deleteAssistantAction}>
              <input type="hidden" name="id" value={id} />
              <SubmitButton
                variant="danger"
                pendingText={t.assistants.deleting}
                disabled={!confirmed}
                className="press"
              >
                {t.common.delete}
              </SubmitButton>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
