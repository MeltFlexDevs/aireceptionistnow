"use client";

import { useActionState } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import { SavePill } from "../components/SavePill";
import { retryBookingSyncAction } from "./actions";

/**
 * Per-row action, so it carries its own form and its own pill rather than
 * bouncing the whole page through a ?saved= redirect. Kept as a bare submit
 * button (not SubmitButton) because this sits inside the failed strip, where
 * the base button size cannot shrink reliably.
 */
export function RetrySyncButton({ actionId }: { actionId: string }) {
  const t = useT();
  const c = t.calendar;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    retryBookingSyncAction,
    IDLE,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="action_id" value={actionId} />
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="press shrink-0 rounded-md border border-rose-200 bg-white px-2 py-0.5 text-[11px] font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? c.retrying : c.retrySync}
      </button>
      <SavePill state={state} />
    </form>
  );
}
