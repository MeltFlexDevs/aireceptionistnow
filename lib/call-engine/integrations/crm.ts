import { createHmac } from "node:crypto";
import type { CallSummary, TranscriptTurn } from "../types";

// Optional per-assistant CRM/ERP push. After a call wraps up, POST the call
// record (summary + transcript) to a URL the user configures — Salesforce/
// HubSpot via a middleware, an ERP intake endpoint, Zapier, Make, n8n, or a
// custom webhook. Generic on purpose: one JSON contract drives any system.

export interface CrmConfig {
  enabled?: boolean;
  url?: string;
  secret?: string;
}

export interface CrmPayload {
  callId: string;
  businessName: string;
  line: string; // which phone line / label
  to: string;
  from?: string;
  summary: CallSummary;
  transcript: Array<{ role: TranscriptTurn["role"]; text: string }>;
}

const TIMEOUT_MS = 10_000;

/** Read and validate the CRM config off an assistant's routing JSON. */
export function readCrmConfig(routing: Record<string, unknown>): CrmConfig | null {
  const crm = (routing.crm as CrmConfig) ?? null;
  if (!crm || !crm.enabled || !crm.url) return null;
  return crm;
}

/**
 * Deliver the call to the configured CRM endpoint. Best-effort: returns a
 * result object instead of throwing so the post-call pipeline never breaks on a
 * misconfigured or down endpoint.
 */
export async function pushCallToCrm(
  crm: CrmConfig,
  payload: CrmPayload,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (!crm.url) return { ok: false, error: "no crm url configured" };

  const body = JSON.stringify({
    type: "call.completed",
    ...payload,
    outcome: payload.summary.outcome,
    sentiment: payload.summary.sentiment,
    actionItems: payload.summary.actionItems,
    tags: payload.summary.tags,
  });

  const headers: Record<string, string> = { "content-type": "application/json" };
  if (crm.secret) {
    // HMAC-SHA256 over the exact body so the receiver can verify authenticity.
    headers["x-signature"] = createHmac("sha256", crm.secret).update(body).digest("hex");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(crm.url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, status: res.status, error: `crm ${res.status}` };
    return { ok: true, status: res.status };
  } catch (err) {
    const msg = (err as Error).name === "AbortError" ? "crm timeout" : (err as Error).message;
    return { ok: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
