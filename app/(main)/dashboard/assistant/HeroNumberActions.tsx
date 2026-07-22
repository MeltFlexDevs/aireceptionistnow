"use client";

import { useActionState } from "react";
import { useT } from "@/lib/i18n/client";
import { IDLE, type ActionState } from "@/lib/dashboard/action-state";
import { SavePill } from "../components/SavePill";
import { SubmitButton } from "../components/SubmitButton";
import { unlinkNumberAction, testCallAction } from "./actions";
import { setAssistantAction } from "../numbers/actions";
import { MathLoader } from "@/app/components/MathLoader";

// One button, like the home page's test-call: the receptionist calls your saved
// number so you can hear this assistant answer. No field to fill - it dials the
// transfer number you already set (and is disabled, with a hint, until one is).
export function TestCall({
  assistantId,
  transferTo,
}: {
  assistantId: string;
  transferTo: string;
}) {
  const a = useT().assistants;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(testCallAction, IDLE);
  const disabled = !transferTo || pending;

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="assistant_id" value={assistantId} />
      <input type="hidden" name="to" value={transferTo} />
      <button
        type="submit"
        disabled={disabled}
        title={transferTo ? undefined : a.testCallNeedsNumber}
        className="press inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <MathLoader variant="spiro" size={14} label={a.testCalling} />
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.62 10.79z" />
          </svg>
        )}
        {pending ? a.testCalling : a.callAndTry}
      </button>
      <SavePill state={state} />
    </form>
  );
}

export function UnlinkNumber({
  assistantId,
  numberId,
}: {
  assistantId: string;
  numberId: string;
}) {
  const a = useT().assistants;
  const [state, formAction] = useActionState<ActionState, FormData>(unlinkNumberAction, IDLE);
  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="number_id" value={numberId} />
      <input type="hidden" name="assistant_id" value={assistantId} />
      <SubmitButton variant="secondary" pendingText={a.unlinking} className="h-8 px-2.5 text-xs">
        {a.unlink}
      </SubmitButton>
      <SavePill state={state} />
    </form>
  );
}

/** Only rendered when more than one receptionist exists. */
export function ReassignNumber({
  numberId,
  currentAssistantId,
  assistants,
}: {
  numberId: string;
  currentAssistantId: string;
  assistants: Array<{ id: string; name: string }>;
}) {
  const t = useT();
  const a = t.assistants;
  const [state, formAction] = useActionState<ActionState, FormData>(setAssistantAction, IDLE);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={numberId} />
      <label htmlFor="reassign" className="text-xs text-neutral-500">
        {a.reassign}
      </label>
      <select
        id="reassign"
        name="assistant_id"
        defaultValue={currentAssistantId}
        className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:border-neutral-900"
      >
        {/* "Free" was the old label - it read as a price. */}
        <option value="">{a.notAssigned}</option>
        {assistants.map((other) => (
          <option key={other.id} value={other.id}>
            {other.name}
          </option>
        ))}
      </select>
      <SubmitButton variant="secondary" className="h-8 px-2.5 text-xs">
        {t.common.save}
      </SubmitButton>
      <SavePill state={state} />
    </form>
  );
}
