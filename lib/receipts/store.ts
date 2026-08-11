/**
 * Server-side reads and writes for the public receipt page.
 *
 * Separate from `SupabaseCallRepository` on purpose. That class is the call
 * engine's view of a call - it exists to serve a live conversation and the
 * pipeline behind it, and everything holding a reference to it is already
 * trusted. This module serves an unauthenticated stranger holding a link, so it
 * is written to a different rule: one lookup, by token, returning only the
 * fields that belong on the caller's own page and nothing else about the tenant.
 */

import { serviceClient } from "@/lib/dashboard/supabase";
import { isReceiptToken } from "@/lib/call-engine/receipts";
import { languageFromPhone } from "@/lib/call-engine/voice/phone-language";

export interface PublicReceipt {
  token: string;
  callId: string;
  kind: "live" | "demo";
  /** Who they called. The only tenant identity the page ever shows. */
  businessName: string;
  /** The recap, in the caller's language. Empty while the summary is in flight. */
  recap: string;
  startedAt: string;
  /** BCP-47-ish two-letter code inferred from the caller's own number. */
  language: string;
  booking: {
    title: string;
    startTime: string;
    endTime: string;
  } | null;
  hasAudio: boolean;
  confirmed: boolean;
  corrected: boolean;
  expired: boolean;
}

interface ReceiptRow {
  token: string;
  call_id: string;
  kind: string;
  expires_at: string;
  confirmed_at: string | null;
  corrected_at: string | null;
}

/**
 * Load a receipt for rendering.
 *
 * Returns null for a bad token, an unknown token and a deleted call alike. The
 * page turns every one of those into the same "this link has expired" - a
 * distinct 404 would tell someone walking the token space when they had guessed
 * a real one.
 */
export async function getPublicReceipt(token: string): Promise<PublicReceipt | null> {
  if (!isReceiptToken(token)) return null;
  const db = serviceClient();

  const { data, error } = await db
    .from("call_receipts")
    .select("token, call_id, kind, expires_at, confirmed_at, corrected_at")
    .eq("token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const receipt = data as unknown as ReceiptRow;
  const expired = new Date(receipt.expires_at).getTime() < Date.now();

  const { data: call, error: callErr } = await db
    .from("calls")
    .select(
      "id, from_number, started_at, caller_recap, summary, elevenlabs_conversation_id, phone_number:phone_numbers(assistant:assistants(name, organization:organizations(name)))",
    )
    .eq("id", receipt.call_id)
    .maybeSingle();
  if (callErr) throw callErr;
  if (!call) return null;

  const row = call as unknown as Record<string, unknown>;

  // Only a booking. The other action types are the business's business: a
  // message the caller left is already known to them, and a transfer reason is
  // internal routing they should never read.
  const { data: actions } = await db
    .from("call_actions")
    .select("type, status, payload")
    .eq("call_id", receipt.call_id)
    .eq("type", "booking")
    .eq("status", "done")
    .order("id", { ascending: true })
    .limit(1);

  const bookingPayload = (actions?.[0]?.payload ?? null) as Record<string, unknown> | null;
  const booking = bookingPayload
    ? {
        title: str(bookingPayload.title),
        startTime: str(bookingPayload.start_time),
        endTime: str(bookingPayload.end_time),
      }
    : null;

  const from = str(row.from_number);

  return {
    token: receipt.token,
    callId: str(row.id),
    kind: receipt.kind === "demo" ? "demo" : "live",
    businessName: businessNameOf(row) || "the business you called",
    // The operational summary is NOT a fallback here. It is written in the
    // owner's language and in the owner's voice ("caller asked about..."), so
    // showing it to the caller would be both the wrong language and the wrong
    // person's point of view. An empty recap renders the "still writing this
    // up" state instead, which is honest and self-correcting.
    recap: str(row.caller_recap),
    startedAt: str(row.started_at),
    language: languageFromPhone(from) ?? "en",
    booking: booking && booking.startTime ? booking : null,
    hasAudio: Boolean(str(row.elevenlabs_conversation_id)),
    confirmed: Boolean(receipt.confirmed_at),
    corrected: Boolean(receipt.corrected_at),
    expired,
  };
}

/**
 * The caller pressed "that's right".
 *
 * Recorded, never published. A confirmation rate computed from this would be a
 * number we generate, host, count and grade ourselves, off a response rate of a
 * fraction of receipts, from a population that skews hard towards the satisfied
 * - the callers the assistant actually failed hang up and ring a competitor.
 * It is a fact about one call and it stays that way.
 */
export async function confirmReceipt(token: string): Promise<boolean> {
  if (!isReceiptToken(token)) return false;
  const { error } = await serviceClient()
    .from("call_receipts")
    .update({ confirmed_at: new Date().toISOString() })
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .is("confirmed_at", null);
  if (error) {
    console.error("[receipts] confirm failed", error);
    return false;
  }
  return true;
}

/**
 * The caller said we got something wrong.
 *
 * This is the whole point of the feature, so it does not land in a new inbox
 * nobody opens. It writes into `needs_review` and `review_claims` - the two
 * columns migration 0007 already added for the accuracy audit - which means the
 * correction immediately appears in the calls list's existing "needs review"
 * filter, hits its partial index, and fires the same escalation push the audit
 * fires. One surface, two intake paths.
 */
export async function correctReceipt(token: string, correction: string): Promise<boolean> {
  if (!isReceiptToken(token)) return false;
  const text = correction.trim().slice(0, MAX_CORRECTION_CHARS);
  if (!text) return false;

  const db = serviceClient();
  const { data, error } = await db
    .from("call_receipts")
    .update({ correction: text, corrected_at: new Date().toISOString() })
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .select("call_id")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("[receipts] correction failed", error);
    return false;
  }

  const callId = String((data as { call_id: string }).call_id);
  const { data: call } = await db
    .from("calls")
    .select("review_claims")
    .eq("id", callId)
    .maybeSingle();

  const existing = Array.isArray((call as { review_claims?: unknown } | null)?.review_claims)
    ? ((call as { review_claims: unknown[] }).review_claims as unknown[]).map(String)
    : [];

  // Prefixed so an operator reading the review list can tell the two sources
  // apart at a glance. A model-flagged claim is a suspicion; this one is the
  // customer telling you directly, and it deserves to read that way.
  const claim = `Caller says: ${text}`;

  const { error: flagErr } = await db
    .from("calls")
    .update({ needs_review: true, review_claims: [claim, ...existing].slice(0, MAX_CLAIMS) })
    .eq("id", callId);
  if (flagErr) {
    console.error("[receipts] could not flag the call for review", flagErr);
    return false;
  }
  return true;
}

const MAX_CORRECTION_CHARS = 600;
const MAX_CLAIMS = 12;

export async function markReceiptViewed(token: string): Promise<void> {
  if (!isReceiptToken(token)) return;
  const { error } = await serviceClient()
    .from("call_receipts")
    .update({ viewed_at: new Date().toISOString() })
    .eq("token", token)
    .is("viewed_at", null);
  if (error) console.error("[receipts] could not mark viewed", error);
}

/**
 * The conversation id behind a token, for the audio proxy.
 *
 * A separate, deliberately minimal lookup: the audio route needs exactly one
 * string and must not be able to reach anything else about the call, so it never
 * sees the full receipt object.
 */
export async function getReceiptAudioRef(token: string): Promise<string | null> {
  if (!isReceiptToken(token)) return null;
  const db = serviceClient();
  const { data } = await db
    .from("call_receipts")
    .select("call_id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;
  const row = data as { call_id: string; expires_at: string };
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  const { data: call } = await db
    .from("calls")
    .select("elevenlabs_conversation_id, status")
    .eq("id", row.call_id)
    .maybeSingle();
  const conversationId = str((call as Record<string, unknown> | null)?.elevenlabs_conversation_id);
  return conversationId || null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function businessNameOf(row: Record<string, unknown>): string {
  const pn = row.phone_number as { assistant?: Record<string, unknown> | null } | null;
  const assistant = pn?.assistant ?? null;
  const org = (assistant?.organization ?? null) as { name?: string } | null;
  return (org?.name ?? "").trim() || String(assistant?.name ?? "").trim();
}
