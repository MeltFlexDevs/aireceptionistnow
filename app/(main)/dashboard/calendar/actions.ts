"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { currentUserId } from "@/lib/auth";
import { deleteIntegration, setPrimaryCalendar } from "@/lib/dashboard/db";
import { getDictionary } from "@/lib/i18n/server";
import { ok, fail, type ActionState } from "@/lib/dashboard/action-state";
import { cancelBooking, isUndatedBooking, loadBookingForCancel } from "@/lib/dashboard/booking-cancel";
import { retryBookingSync } from "@/lib/dashboard/booking-retry";
import { notifyCancelledCustomer } from "@/lib/dashboard/booking-notify";

/**
 * All four actions below report back through the shared ActionState contract
 * and an inline pill, rather than the old ?saved=/?error= redirect - which
 * reloaded the page, lost the reader's place in the agenda, and put raw
 * provider error text in the URL bar.
 */

export async function retryBookingSyncAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = (await getDictionary()).calendar;
  const actionId = String(formData.get("action_id") ?? "");
  if (!actionId) return fail(c.bookingMissing);

  const ownerId = (await currentUserId()) ?? null;
  const res = await retryBookingSync(actionId, ownerId).catch((err: Error) => ({
    ok: false as const,
    message: err.message,
  }));
  revalidatePath("/dashboard/calendar");
  // The provider's own error text never reaches the user - it is operator
  // diagnostics, and there is nothing they could do with it.
  return res.ok ? ok(c.retrySucceeded) : fail(c.retryFailed);
}

export async function cancelBookingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = (await getDictionary()).calendar;
  const actionId = String(formData.get("action_id") ?? "");
  if (!actionId) return fail(c.bookingMissing);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  const offerRebook = formData.get("offer_rebook") === "on";

  const ownerId = (await currentUserId()) ?? null;
  const booking = await loadBookingForCancel(actionId, ownerId).catch(() => null);
  if (!booking) return fail(c.bookingNotFound);
  // Either would phone the customer about nothing (same guard as the mobile route).
  if (booking.cancelled) return fail(c.alreadyCancelled);
  if (isUndatedBooking(booking)) return fail(c.cancelNoTime);

  // Claim, cancel the calendar event and save (the same shared sequence as the mobile route).
  const res = await cancelBooking(booking, { reason, offerRebook, log: "calendar" });
  if (res.kind === "claimed-elsewhere") return fail(c.alreadyCancelled);
  if (res.kind === "failed") return fail(c.calendarActionFailed);
  const { cal } = res;

  after(() => notifyCancelledCustomer(actionId, booking, reason, offerRebook, ownerId));

  revalidatePath("/dashboard/calendar");
  // When the calendar entry could not be removed automatically, say so plainly
  // and tell them what to do - never surface the provider's message.
  return ok(cal.ok ? c.cancelledNotifying : `${c.cancelledNotifying} ${c.cancelledRemoveYourself}`);
}

export async function setPrimaryCalendarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = (await getDictionary()).calendar;
  const id = String(formData.get("id") ?? "");
  if (!id) return fail(c.calendarMissing);
  try {
    await setPrimaryCalendar(id, (await currentUserId()) ?? undefined);
  } catch {
    return fail(c.calendarActionFailed);
  }
  revalidatePath("/dashboard/calendar");
  return ok(c.primarySet);
}

export async function disconnectCalendarAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const c = (await getDictionary()).calendar;
  const id = String(formData.get("id") ?? "");
  if (!id) return fail(c.calendarMissing);
  try {
    // Deleting a row that is already gone succeeds with zero rows affected, so a
    // throw here is a real failure (e.g. not signed in) - surface it rather than
    // claiming success and leaving the calendar visibly still connected.
    await deleteIntegration(id, (await currentUserId()) ?? undefined);
  } catch {
    return fail(c.calendarActionFailed);
  }
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/assistant", "layout");
  return ok(c.disconnected);
}
