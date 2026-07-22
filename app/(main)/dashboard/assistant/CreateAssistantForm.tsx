"use client";

import { useFormStatus } from "react-dom";
import { useT } from "@/lib/i18n/client";
import { Plus, Spinner } from "../icons";
import { createAssistantAction } from "./actions";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";

function Progress() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return <ProgressOverlay />;
}

// Honest indeterminate progress: the real work (DB row + ElevenLabs agent
// sync) reports nothing back mid-flight, so don't fake step percentages.
function ProgressOverlay() {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="status">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Spinner className="h-5 w-5 animate-spin text-neutral-900" />
          <h3 className="text-base font-medium text-neutral-900">{t.assistants.creating}…</h3>
        </div>
        <p className="mt-2 text-sm text-neutral-500">{t.assistants.creatingBody}</p>
      </div>
    </div>
  );
}

function SubmitButton() {
  const t = useT();
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="press inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      {pending ? t.assistants.createPending : t.assistants.createButton}
    </button>
  );
}

export function CreateAssistantForm() {
  const t = useT();
  return (
    <form action={createAssistantAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-700">
          {t.assistants.name}
        </label>
        <input id="name" name="name" placeholder={t.assistants.namePlaceholder} className={field} />
      </div>
      <SubmitButton />
      <Progress />
    </form>
  );
}
