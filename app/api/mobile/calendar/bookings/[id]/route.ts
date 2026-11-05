import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { cancelBooking, isUndatedBooking, loadBookingForCancel } from "@/lib/dashboard/booking-cancel";
import { notifyCancelledCustomer } from "@/lib/dashboard/booking-notify";
import {
  retryBookingSync,
  retryResponseStatus,
  type RetryFailureCode,
  type RetryResult,
} from "@/lib/dashboard/booking-retry";
import { mobileAuth } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// What the owner should do instead when a plain retry cannot fix the sync.
const RETRY_ERRORS: Record<RetryFailureCode, string> = {
  slot_taken: "That time is no longer free. Call the customer to pick another time.",
  not_connected: "No calendar is connected for this booking. Connect one, then retry.",
  no_calendar: "No calendar is connected for this booking. Connect one, then retry.",
  past: "This appointment time has passed.",
  no_time: "This appointment time has passed.",
  not_failed: "This appointment already changed. Pull down to refresh.",
};

/**
 * Cancel an appointment, or retry a calendar sync that failed.
 *
 * `loadBookingForCancel` / `retryBookingSync` both take the ownerId and refuse
 * a booking that is not this user's - that is the tenant boundary, so never
 * call them without it.
 *
 * The customer notification runs in `after()`: it places an outbound call and
 * can take tens of seconds, which is far past what a phone will wait for. That
 * call is also why a cancel is refused (409) for a booking that is already
 * cancelled or has no time yet: either would phone a customer about nothing.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const auth = await mobileAuth(req, "calendar-booking");
  if (auth instanceof Response) return auth;
  const userId = auth;
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id: actionId } = await params;
  if (!actionId) return Response.json({ error: "Bad request." }, { status: 400 });

  let body: { action?: unknown; reason?: unknown; offerRebook?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  if (body.action === "retry") {
    const res: RetryResult = await retryBookingSync(actionId, userId).catch((err: Error) => ({
      ok: false as const,
      message: err.message,
    }));
    revalidatePath("/dashboard/calendar");
    // The provider's own error text never reaches the user - it is operator
    // diagnostics and there is nothing they could do with it.
    const status = retryResponseStatus(res);
    // Gone or not this user's: 404, since "try again" would make the app retry forever.
    if (status === 404) return Response.json({ error: "Appointment not found." }, { status });
    // A retry cannot fix it (slot taken, no calendar, time passed, row changed):
    // 409 with what to do instead. The app shows `error` as is.
    if (status === 409 && res.code) return Response.json({ error: RETRY_ERRORS[res.code] }, { status });
    // Only a provider error or a timeout is worth another try.
    if (status === 502) return Response.json({ error: "That did not sync. Try again shortly." }, { status });
    return Response.json({ ok: true });
  }

  if (body.action === "cancel") {
    const reason = String(body.reason ?? "").trim().slice(0, 500);
    const offerRebook = Boolean(body.offerRebook);

    const booking = await loadBookingForCancel(actionId, userId).catch(() => null);
    if (!booking) return Response.json({ error: "Appointment not found." }, { status: 404 });
    if (booking.cancelled) {
      return Response.json({ error: "This booking is already cancelled." }, { status: 409 });
    }
    if (isUndatedBooking(booking)) {
      return Response.json(
        { error: "This request has no time yet - call the customer to arrange one." },
        { status: 409 },
      );
    }

    // Claim, cancel the calendar event and save, in one shared sequence (it
    // gives the row back when a step after the claim fails).
    const res = await cancelBooking(booking, { reason, offerRebook, log: "mobile:calendar-booking" });
    if (res.kind === "claimed-elsewhere") {
      return Response.json({ error: "This booking is already cancelled." }, { status: 409 });
    }
    if (res.kind === "failed") {
      return Response.json({ error: "That did not cancel. Try again." }, { status: 500 });
    }
    const { cal } = res;

    after(() => notifyCancelledCustomer(actionId, booking, reason, offerRebook, userId));

    revalidatePath("/dashboard/calendar");
    return Response.json({
      ok: true,
      // When the calendar entry could not be removed automatically, say so
      // plainly and say what to do - never surface the provider's message.
      warning: cal.ok ? null : "Remove it from your calendar yourself - we could not.",
    });
  }

  return Response.json({ error: "Bad request." }, { status: 400 });
}
