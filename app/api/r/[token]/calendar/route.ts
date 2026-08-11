import { getPublicReceipt } from "@/lib/receipts/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The appointment as a calendar file.
 *
 * The receipt's one piece of genuine utility beyond checking it: an
 * appointment the caller can actually put in their own calendar, on the phone
 * they are already holding, without retyping a date read out to them over the
 * phone. Every no-show that starts with "I wrote it down wrong" is this file
 * not existing.
 *
 * Built by hand rather than with a library - an ICS event is six lines, and the
 * only hard parts are CRLF endings and escaping, both of which are below.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;

  let receipt: Awaited<ReturnType<typeof getPublicReceipt>> = null;
  try {
    receipt = await getPublicReceipt(token);
  } catch (err) {
    console.error("[receipt:ics]", err);
    return new Response(null, { status: 500 });
  }
  if (!receipt || receipt.expired || !receipt.booking) {
    return new Response(null, { status: 404 });
  }

  const start = stamp(receipt.booking.startTime);
  const end = stamp(receipt.booking.endTime) || start;
  if (!start) return new Response(null, { status: 404 });

  const summary = receipt.booking.title || `Appointment - ${receipt.businessName}`;

  // UID must be stable: re-downloading the file has to update the existing
  // entry rather than add a second copy of the same appointment.
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Receptionist Now//Call receipt//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${receipt.callId}@aireceptionistnow.com`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `ORGANIZER;CN=${escapeIcs(receipt.businessName)}:MAILTO:noreply@aireceptionistnow.com`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // RFC 5545 wants CRLF; some calendar clients genuinely reject LF-only files.
  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'attachment; filename="appointment.ics"',
      "cache-control": "private, max-age=0, no-store",
    },
  });
}

/** ISO 8601 to the UTC basic format an ICS DTSTART needs. */
function stamp(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/** Backslash, semicolon, comma and newline are the four that break a line. */
function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}
