import { createHmac } from "node:crypto";
import { isSafeHttpsUrl } from "../../net/safe-url";
import type { CallSummary, IntegrationConfig, TranscriptTurn } from "../types";

// Optional CRM/ERP push. After a call wraps up, POST the call record (summary +
// transcript) to a URL the user configures - Salesforce/HubSpot via a
// middleware, an ERP intake endpoint, Zapier, Make, n8n, or a custom webhook.
// Generic on purpose: one JSON contract drives any system.
//
// An endpoint is a shared `crm` integration owned by the account (Integrations
// page), not per-assistant config: several assistants can push to one endpoint,
// and an assistant can push to several. The assistant's routing only stores
// which ones it uses - see resolveCrmTargets.

export interface CrmConfig {
  /** Endpoint label, for logs only. */
  name: string;
  url: string;
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

/** What an assistant's routing JSON stores: which shared endpoints it pushes to. */
interface CrmTarget {
  integrationId: string;
}

/**
 * The CRM endpoints this assistant pushes completed calls to: its routing target
 * ids resolved against the integrations loaded for the call.
 *
 * Resolving against that list (rather than trusting the ids) is what keeps a
 * stale target harmless - `integrations` is already scoped to the assistant's
 * business + owner and filtered to enabled rows by resolveInboundNumber, so a
 * deleted, disabled, or another tenant's endpoint simply drops out.
 */
export function resolveCrmTargets(
  routing: Record<string, unknown>,
  integrations: IntegrationConfig[],
): CrmConfig[] {
  const targets = (routing.crm as { targets?: CrmTarget[] } | undefined)?.targets;
  if (!Array.isArray(targets) || targets.length === 0) return [];

  const byId = new Map(
    integrations.filter((i) => i.type === "crm" && i.enabled).map((i) => [i.id, i]),
  );
  const out: CrmConfig[] = [];
  for (const t of targets) {
    const row = byId.get(t?.integrationId);
    if (!row) continue;
    const url = typeof row.config.url === "string" ? row.config.url : "";
    if (!url) continue;
    const secret = typeof row.config.secret === "string" ? row.config.secret : "";
    const name = typeof row.config.name === "string" ? row.config.name : "CRM";
    out.push({ name, url, ...(secret ? { secret } : {}) });
  }
  return out;
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
  // Re-validate at dispatch, not just at save time: a hostname that was public
  // when saved can be repointed to an internal address before this fires (DNS
  // rebinding). Combined with redirect:"manual" below (an open redirect would
  // otherwise walk past the check), this is the dispatch-time SSRF guard.
  if (!isSafeHttpsUrl(crm.url)) return { ok: false, error: "crm url not allowed" };

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
      redirect: "manual", // don't follow a 3xx into an internal host
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
