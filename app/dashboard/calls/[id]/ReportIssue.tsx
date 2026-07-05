"use client";

import { useActionState } from "react";
import { SubmitButton } from "../../components/SubmitButton";
import { reportCallIssue, type ReportState } from "./actions";

// "Report an issue" next to the transcript: expands into a small inline form,
// sends the user's description via the server action (which snapshots the full
// transcript, latency, duration and date server-side).
export function ReportIssue({ callId }: { callId: string }) {
  const [state, formAction] = useActionState<ReportState, FormData>(reportCallIssue, {
    ok: false,
    error: "",
  });

  if (state.ok) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        Report sent — thanks
      </span>
    );
  }

  return (
    <details className="relative">
      <summary className="inline-flex h-8 cursor-pointer list-none items-center rounded-lg border border-orange-200 bg-orange-50 px-3 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100 hover:text-orange-800 [&::-webkit-details-marker]:hidden">
        Report an issue
      </summary>
      <form
        action={formAction}
        className="absolute right-0 z-10 mt-2 w-72 space-y-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-card"
      >
        <input type="hidden" name="callId" value={callId} />
        <label className="block text-xs font-medium text-neutral-700">
          What went wrong on this call?
          <textarea
            name="message"
            required
            maxLength={2000}
            rows={4}
            placeholder="e.g. The AI misheard the caller's name and booked the wrong time…"
            className="mt-1.5 w-full resize-y rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-sm font-normal text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
          />
        </label>
        {state.error && <p className="text-xs text-rose-600">{state.error}</p>}
        <SubmitButton pendingText="Sending…" className="w-full">
          Send report
        </SubmitButton>
      </form>
    </details>
  );
}
