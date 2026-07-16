"use client";

import { useState } from "react";
import type { BookingCancellation } from "@/lib/dashboard/calendar";
import { cancelBookingAction } from "./actions";
import { SubmitButton } from "../components/SubmitButton";

// Cancel an AI-made booking: opens a small form for the reason and whether the
// assistant should offer a new time, then hands off to cancelBookingAction
// (which cancels the real event and calls/texts the customer). A booking already
// cancelled shows its notification status instead of the form.

const NOTIFY_LABEL: Record<BookingCancellation["notifyStatus"], string> = {
  pending: "Contacting the customer…",
  calling: "Calling the customer…",
  answered: "Customer reached by call",
  sms_sent: "Customer texted (no answer)",
  failed: "Couldn't reach the customer",
};

export function CancelBooking({
  actionId,
  cancellation,
}: {
  actionId: string;
  cancellation: BookingCancellation | null;
}) {
  const [open, setOpen] = useState(false);

  if (cancellation) {
    return (
      <span className="shrink-0 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
        {NOTIFY_LABEL[cancellation.notifyStatus]}
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press shrink-0 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
      >
        Cancel
      </button>
    );
  }

  return (
    <form
      action={cancelBookingAction}
      className="w-full rounded-xl border border-neutral-200 bg-neutral-50/60 p-3"
    >
      <input type="hidden" name="action_id" value={actionId} />
      <p className="mb-2 text-xs font-medium text-neutral-700">
        Cancel this booking and let the customer know
      </p>
      <textarea
        name="reason"
        rows={2}
        maxLength={500}
        placeholder="Reason for cancelling (the assistant explains this to the customer), e.g. the dentist is out sick."
        className="w-full resize-y rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-900"
      />
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-neutral-700">
        <input
          type="checkbox"
          name="offer_rebook"
          defaultChecked
          className="h-3.5 w-3.5 rounded border-neutral-300"
        />
        Have the assistant offer a new time
      </label>
      <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400">
        The assistant calls the customer to explain and, if ticked, rebook. If they don&apos;t pick
        up, it texts them instead.
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <SubmitButton
          variant="danger"
          pendingText="Cancelling…"
          className="press h-8 px-3 text-xs"
        >
          Cancel booking
        </SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="press h-8 rounded-lg px-3 text-xs font-medium text-neutral-500 hover:text-neutral-900"
        >
          Keep it
        </button>
      </div>
    </form>
  );
}
