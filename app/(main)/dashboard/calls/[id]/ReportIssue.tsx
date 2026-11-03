"use client";

import { useActionState, useState } from "react";
import { useT } from "@/lib/i18n/client";
import { SubmitButton } from "../../components/SubmitButton";
import {
  ValidatedForm,
  RequiredMark,
  FieldError,
  useFormValidity,
} from "@/app/components/forms/validated-form";
import { reportCallIssue, type ReportState } from "./actions";
import { MAX_MESSAGE_CHARS } from "./report-limits";

// Keeps the shared SubmitButton (with its pending spinner) but gates it on the
// surrounding form's validity - so it can read the ValidatedForm context.
// It also stays off for a blank message: required accepts spaces, the server does not.
function ReportSubmit({ label, pendingText, blank }: { label: string; pendingText: string; blank: boolean }) {
  const { valid } = useFormValidity();
  return (
    <SubmitButton pendingText={pendingText} className="w-full" disabled={!valid || blank}>
      {label}
    </SubmitButton>
  );
}

export function ReportIssue({ callId, alreadyReported }: { callId: string; alreadyReported: boolean }) {
  const t = useT();
  const d = t.calls.detail;
  // A network failure rejects the server action. Keep it inline, so the page
  // and the typed text stay; reportCallIssue never redirects, so this catches nothing else.
  const [state, formAction] = useActionState<ReportState, FormData>(
    async (prev, formData) => {
      try {
        return await reportCallIssue(prev, formData);
      } catch {
        return { ok: false, error: d.reportErrorNetwork };
      }
    },
    { ok: false, error: "" },
  );
  const [message, setMessage] = useState("");

  // Reporting is one-shot: a second identical report is noise, so success
  // replaces the form rather than showing a transient pill beside it.
  // A report already on file (sent before a reload, or from the app) shows the same pill.
  if (state.ok || alreadyReported) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        {d.reportSent}
      </span>
    );
  }

  return (
    <details className="relative">
      <summary className="press inline-flex h-8 cursor-pointer list-none items-center rounded-lg border border-orange-200 bg-orange-50 px-3 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100 hover:text-orange-800 [&::-webkit-details-marker]:hidden">
        {d.reportButton}
      </summary>
      <ValidatedForm
        action={formAction}
        className="absolute right-0 z-10 mt-2 w-72 space-y-2 rounded-xl border border-neutral-200 bg-white p-3"
      >
        <input type="hidden" name="callId" value={callId} />
        <label className="block text-xs font-medium text-neutral-700">
          {d.reportQuestion}
          <RequiredMark />
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={MAX_MESSAGE_CHARS}
            rows={4}
            placeholder={d.reportPlaceholder}
            className="mt-1.5 w-full resize-y rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-sm font-normal text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
          />
        </label>
        <FieldError name="message" />
        {state.error && <p className="text-xs text-rose-600">{state.error}</p>}
        <ReportSubmit label={d.reportSend} pendingText={d.reportSending} blank={!message.trim()} />
      </ValidatedForm>
    </details>
  );
}
