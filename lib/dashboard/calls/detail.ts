import { serviceClient } from "../supabase";
import { clockSecFmt, ownerTimezone } from "../timezone";
import { fetchTwilioCall } from "../twilio";
import { assistantName, assistantOwnerId, num, str } from "./embed";
import { dateTimeFmt, fmtDuration, isLiveStatus, normalizeDirection, statusLabel } from "./format";
import type { CallActionItem, CallDetail, CallTurn } from "./types";

const SELECT =
  "id,twilio_call_sid,elevenlabs_conversation_id,from_number,to_number,direction,status,started_at,duration_seconds,outcome,sentiment,summary,needs_review,review_claims,recording_url,owner_id,assistant:assistants!assistant_id(name),phone_number:phone_numbers(assistant:assistants(name,owner_id))";

export async function getCallDetail(
  id: string,
  viewerId?: string | null,
  /** Viewer's locale for the date label; the page threads it in. */
  locale?: string,
): Promise<CallDetail | null> {
  const sb = serviceClient();
  const { data, error } = await sb.from("calls").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const c = data as unknown as Record<string, unknown>;

  const ownerId = (str(c.owner_id) || null) ?? assistantOwnerId(c);
  if (viewerId && ownerId !== viewerId) return null;

  // sid and ownerId are known after the first query - fetch the rest together.
  const sid = str(c.twilio_call_sid);
  const [turnsRes, actionsRes, tw, tz] = await Promise.all([
    sb.from("call_turns").select("id,role,text,ts_ms").eq("call_id", id).order("id", { ascending: true }),
    sb.from("call_actions").select("id,type,status,payload,error").eq("call_id", id).order("created_at", { ascending: true }),
    sid ? fetchTwilioCall(sid).catch(() => null) : Promise.resolve(null),
    ownerTimezone(ownerId),
  ]);
  const status = tw?.status || str(c.status);
  const durationSec = tw?.durationSec ?? num(c.duration_seconds);
  const date = tw?.date || str(c.started_at);
  const atFmt = clockSecFmt(tz);
  const startMs = Date.parse(date);
  const turns: CallTurn[] = (turnsRes.data ?? []).map((t) => {
    const row = t as Record<string, unknown>;
    const tsMs = num(row.ts_ms);
    const atLabel = Number.isFinite(startMs)
      ? atFmt(new Date(startMs + tsMs).toISOString())
      : "";
    return { id: num(row.id), role: str(row.role), text: str(row.text), tsMs, atLabel };
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
    // Owner's timezone, matching the call log and Calendar (tz resolved above).
    dateLabel: dateTimeFmt(tz, locale)(date),
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
    // The audio lives at ElevenLabs, keyed by the conversation id, and is only
    // finalized once the call ends - so a live call reports no audio even
    // though the id already exists. Streamed through
    // /api/mobile/calls/[id]/recording; there is no public URL to hand out.
    hasAudio: Boolean(str(c.elevenlabs_conversation_id)) && !isLiveStatus(status),
    isLive: isLiveStatus(status),
    needsReview: c.needs_review === true,
    reviewClaims: Array.isArray(c.review_claims)
      ? (c.review_claims as unknown[]).filter((x): x is string => typeof x === "string")
      : [],
    turns,
    actions,
  };
}

/**
 * The conversation id behind a call, for the audio proxy - and nothing else.
 *
 * Separate from `getCallDetail` because that one also hits Twilio, reads every
 * turn and every action, and formats dates: all wasted on a request whose
 * answer is one string. The ownership rule is duplicated deliberately rather
 * than skipped; this is a tenant boundary, and `serviceClient` bypasses RLS.
 */
export async function getCallAudioRef(
  id: string,
  viewerId: string,
): Promise<{ conversationId: string; isLive: boolean } | null> {
  const { data, error } = await serviceClient()
    .from("calls")
    .select(
      "id,status,owner_id,elevenlabs_conversation_id,phone_number:phone_numbers(assistant:assistants(owner_id))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const c = data as unknown as Record<string, unknown>;
  const ownerId = (str(c.owner_id) || null) ?? assistantOwnerId(c);
  if (ownerId !== viewerId) return null;

  const conversationId = str(c.elevenlabs_conversation_id);
  if (!conversationId) return null;
  return { conversationId, isLive: isLiveStatus(str(c.status)) };
}

/**
 * The two numbers on a call - who rang, and which of your lines they rang -
 * with the same ownership check as everything else here.
 *
 * Exists so the text-back route never takes a destination from its request
 * body. The number it texts comes out of the call row, which means a caller can
 * only ever be replied to on the line they actually dialled, and this endpoint
 * cannot be turned into an open SMS relay.
 */
export async function getCallContactRef(
  id: string,
  viewerId: string,
): Promise<{ from: string; to: string } | null> {
  const { data, error } = await serviceClient()
    .from("calls")
    .select(
      "id,from_number,to_number,owner_id,phone_number:phone_numbers(assistant:assistants(owner_id))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const c = data as unknown as Record<string, unknown>;
  const ownerId = (str(c.owner_id) || null) ?? assistantOwnerId(c);
  if (ownerId !== viewerId) return null;

  const from = str(c.from_number);
  const to = str(c.to_number);
  if (!from || !to) return null;
  return { from, to };
}
