import { revalidatePath } from "next/cache";
import { after } from "next/server";

import {
  cancelCalendarEvent,
  loadBookingForCancel,
  saveCancellationState,
} from "@/lib/dashboard/booking-cancel";
import { notifyCancelledCustomer } from "@/lib/dashboard/booking-notify";
import { retryBookingSync } from "@/lib/dashboard/booking-retry";
import { mobileUserId } from "@/lib/mobile/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cancel an appointment, or retry a calendar sync that failed.
 *
 * `loadBookingForCancel` / `retryBookingSync` both take the ownerId and refuse
 * a booking that is not this user's - that is the tenant boundary, so never
 * call them without it.
 *
 * The customer notification runs in `after()`: it places an outbound call and
 * can take tens of seconds, which is far past what a phone will wait for.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
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
    const res = await retryBookingSync(actionId, userId).catch((err: Error) => ({
      ok: false as const,
      message: err.message,
    }));
    revalidatePath("/dashboard/calendar");
    // The provider's own error text never reaches the user - it is operator
    // diagnostics and there is nothing they could do with it.
    if (!res.ok) return Response.json({ error: "That did not sync. Try again shortly." }, { status: 502 });
    return Response.json({ ok: true });
  }

  if (body.action === "cancel") {
    const reason = String(body.reason ?? "").trim().slice(0, 500);
    const offerRebook = Boolean(body.offerRebook);

    const booking = await loadBookingForCancel(actionId, userId).catch(() => null);
    if (!booking) return Response.json({ error: "Appointment not found." }, { status: 404 });

    const cal = await cancelCalendarEvent(booking, reason);

    await saveCancellationState(actionId, {
      reason,
      offerRebook,
      notifyStatus: "pending",
      calendarCancelled: cal.ok,
      calendarError: cal.ok ? undefined : cal.error,
      at: new Date().toISOString(),
    });

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
