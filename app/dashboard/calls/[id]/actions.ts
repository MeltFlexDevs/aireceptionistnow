"use server";

import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { getCallDetail } from "@/lib/dashboard/calls";
import { serviceClient } from "@/lib/dashboard/supabase";

export interface ReportState {
  ok: boolean;
  error: string;
}

const MAX_MESSAGE_CHARS = 2000;

/**
 * File an issue report for a call. The report row snapshots the full context
 * support needs (transcript, latency, duration, date) server-side from the
 * call id - the client only ever supplies the free-text message, so a forged
 * request can't attach another tenant's transcript.
 */
export async function reportCallIssue(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const callId = String(formData.get("callId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { ok: false, error: "Describe the issue first." };
  if (message.length > MAX_MESSAGE_CHARS) {
    return { ok: false, error: `Keep the report under ${MAX_MESSAGE_CHARS} characters.` };
  }

  const reporterId = await currentUserId();
  if (authConfigured() && !reporterId) return { ok: false, error: "Not signed in." };

  // getCallDetail enforces the viewer's ownership (fails closed with auth on),
  // and already carries the reconciled transcript/duration/date.
  const call = await getCallDetail(callId, reporterId).catch(() => null);
  if (!call) return { ok: false, error: "Call not found." };

  // Latency isn't part of CallDetail; snapshot it straight off the call row.
  const { data: row } = await serviceClient()
    .from("calls")
    .select("median_latency_ms,duration_seconds")
    .eq("id", callId)
    .maybeSingle();

  const { error } = await serviceClient().from("call_reports").insert({
    call_id: callId,
    reporter_id: reporterId,
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
      transcript: call.turns.map((t) => ({ role: t.role, text: t.text, ts_ms: t.tsMs })),
    },
  });
  if (error) {
    // Schema drift: call_reports doesn't exist until migration 0010 is applied.
    console.warn("[call-report] insert failed:", error.message);
    return { ok: false, error: "Couldn't send the report. Please try again." };
  }
  return { ok: true, error: "" };
}
