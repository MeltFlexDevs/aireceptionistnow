"use server";

import { currentUserId } from "@/lib/auth";
import { authConfigured } from "@/lib/supabase/config";
import { getCallDetail } from "@/lib/dashboard/calls";
import { serviceClient } from "@/lib/dashboard/supabase";
import { getDictionary } from "@/lib/i18n/server";
import { MAX_MESSAGE_CHARS } from "./report-limits";

export interface ReportState {
  ok: boolean;
  error: string;
}

export async function reportCallIssue(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const d = (await getDictionary()).calls.detail;
  const callId = String(formData.get("callId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!message) return { ok: false, error: d.reportErrorEmpty };
  if (message.length > MAX_MESSAGE_CHARS) {
    return { ok: false, error: d.reportErrorTooLong.replace("{max}", String(MAX_MESSAGE_CHARS)) };
  }

  const reporterId = await currentUserId();
  if (authConfigured() && !reporterId) return { ok: false, error: d.reportErrorNotSignedIn };

  const call = await getCallDetail(callId, reporterId).catch(() => null);
  if (!call) return { ok: false, error: d.reportErrorNotFound };

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
    return { ok: false, error: d.reportErrorGeneric };
  }
  return { ok: true, error: "" };
}
