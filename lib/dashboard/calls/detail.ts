import { serviceClient } from "../supabase";
import { fetchTwilioCall } from "../twilio";
import { assistantName, assistantOwnerId, num, str } from "./embed";
import { fmtDateTime, fmtDuration, isLiveStatus, normalizeDirection, statusLabel } from "./format";
import type { CallActionItem, CallDetail, CallTurn } from "./types";

const SELECT =
  "id,twilio_call_sid,from_number,to_number,direction,status,started_at,duration_seconds,outcome,sentiment,summary,recording_url,phone_number:phone_numbers(assistant:assistants(name,owner_id))";

// Full single-call view: the DB row enriched with persisted transcript turns and
// AI action items, reconciled with the live Twilio call (status/duration/date).
export async function getCallDetail(
  id: string,
  viewerId?: string | null,
): Promise<CallDetail | null> {
  const sb = serviceClient();
  const { data, error } = await sb.from("calls").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const c = data as unknown as Record<string, unknown>;

  // Owner scoping: hide a call that belongs to another user's assistant.
  const ownerId = assistantOwnerId(c);
  if (viewerId && ownerId && ownerId !== viewerId) return null;

  const [turnsRes, actionsRes] = await Promise.all([
    sb.from("call_turns").select("id,role,text,ts_ms").eq("call_id", id).order("id", { ascending: true }),
    sb.from("call_actions").select("id,type,status,payload,error").eq("call_id", id).order("created_at", { ascending: true }),
  ]);

  const sid = str(c.twilio_call_sid);
  const tw = sid ? await fetchTwilioCall(sid).catch(() => null) : null;
  const status = tw?.status || str(c.status);
  const durationSec = tw?.durationSec ?? num(c.duration_seconds);
  const date = tw?.date || str(c.started_at);

  const turns: CallTurn[] = (turnsRes.data ?? []).map((t) => {
    const row = t as Record<string, unknown>;
    return { id: num(row.id), role: str(row.role), text: str(row.text), tsMs: num(row.ts_ms) };
  });
  const actions: CallActionItem[] = (actionsRes.data ?? []).map((a) => {
    const row = a as Record<string, unknown>;
    return {
      id: str(row.id),
      type: str(row.type),
      status: str(row.status),
      payload: (row.payload as Record<string, unknown>) ?? {},
      error: str(row.error) || null,
    };
  });

  return {
    id: str(c.id),
    sid,
    date,
    dateLabel: fmtDateTime(date),
    status,
    statusLabel: statusLabel(status),
    direction: normalizeDirection(str(c.direction)),
    from: tw?.from || str(c.from_number),
    to: tw?.to || str(c.to_number),
    durationLabel: fmtDuration(durationSec),
    outcome: str(c.outcome) || null,
    sentiment: str(c.sentiment) || null,
    summary: str(c.summary) || null,
    assistant: assistantName(c),
    recordingUrl: str(c.recording_url) || null,
    isLive: isLiveStatus(status),
    turns,
    actions,
  };
}
