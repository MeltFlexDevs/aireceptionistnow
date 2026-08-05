import { getCallDetail } from "@/lib/dashboard/calls";
import { serviceClient } from "@/lib/dashboard/supabase";
import { mobileUserId } from "@/lib/mobile/auth";
import { MAX_MESSAGE_CHARS } from "@/app/(main)/dashboard/calls/[id]/report-limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "This call went wrong." Mirrors `reportCallIssue`, including the transcript
 * snapshot - a report without what was actually said is not actionable, and the
 * call row can change after the fact.
 *
 * `getCallDetail(id, viewerId)` returns null for a call belonging to someone
 * else. That is the tenant boundary here, so never drop the viewerId.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await mobileUserId(req);
  if (!userId) return Response.json({ error: "Not signed in." }, { status: 401 });

  const { id } = await params;

  let message = "";
  try {
    message = String(((await req.json()) as { message?: unknown }).message ?? "").trim();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (!message) return Response.json({ error: "Tell us what went wrong." }, { status: 400 });
  if (message.length > MAX_MESSAGE_CHARS) {
    return Response.json(
      { error: `Keep it under ${MAX_MESSAGE_CHARS} characters.` },
      { status: 400 },
    );
  }

  const call = await getCallDetail(id, userId).catch(() => null);
  if (!call) return Response.json({ error: "Call not found." }, { status: 404 });

  // Latency is not part of CallDetail; snapshot it straight off the call row.
  const { data: row } = await serviceClient()
    .from("calls")
    .select("median_latency_ms,duration_seconds")
    .eq("id", id)
    .maybeSingle();

  const { error } = await serviceClient().from("call_reports").insert({
    call_id: id,
    reporter_id: userId,
    message,
    context: {
      from: call.from,
      to: call.to,
      date: call.date,
      status: call.status,
      outcome: call.outcome,
      assistant: call.assistant,
      duration_seconds: row?.duration_seconds ?? null,
      duration_label: call.durationLabel,
      median_latency_ms: row?.median_latency_ms ?? null,
      summary: call.summary,
      source: "mobile",
      transcript: call.turns.map((t) => ({ role: t.role, text: t.text, ts_ms: t.tsMs })),
    },
  });
  if (error) {
    // Schema drift: call_reports does not exist until migration 0010 is applied.
    console.warn("[mobile:call-report] insert failed:", error.message);
    return Response.json({ error: "That did not send. Try again." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
