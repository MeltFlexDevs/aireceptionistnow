"use client";

import { useState } from "react";
import { deleteAssistantAction } from "./actions";

// Delete with a confirmation modal — requires typing the assistant name (or
// "delete") so it can't be triggered accidentally.
export function DeleteAssistant({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const confirmed =
    text.trim() === name.trim() || text.trim().toLowerCase() === "delete";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
      >
        Delete assistant
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-medium text-neutral-900">Delete assistant</h3>
            <p className="mt-1 text-sm text-neutral-500">
              This permanently deletes{" "}
              <span className="font-medium text-neutral-800">{name}</span> and unlinks its
              number. Type <span className="font-medium text-neutral-800">{name}</span> or{" "}
              <span className="font-medium text-neutral-800">delete</span> to confirm.
            </p>
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={name}
              className="mt-4 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-rose-400"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
              <form action={deleteAssistantAction}>
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  disabled={!confirmed}
                  className="inline-flex h-9 items-center rounded-lg bg-rose-600 px-4 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
