"use client";

import { useFormStatus } from "react-dom";
import { Plus } from "../icons";
import { createOrganizationAction } from "./actions";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
    >
      <Plus className="h-4 w-4" />
      {pending ? "Creating…" : "Create organization"}
    </button>
  );
}

export function CreateOrganizationForm() {
  return (
    <form action={createOrganizationAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="org_name" className="mb-1.5 block text-sm font-medium text-neutral-700">
          Name
        </label>
        <input id="org_name" name="name" placeholder="e.g. Acme Corp" className={field} />
      </div>
      <SubmitButton />
    </form>
  );
}
