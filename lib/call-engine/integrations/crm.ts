import { createHmac } from "node:crypto";
import { isSafeHttpsUrl } from "../../net/safe-url";
import type { CallSummary, IntegrationConfig, TranscriptTurn } from "../types";

export interface CrmConfig {
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

interface CrmTarget {
  integrationId: string;
}

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

export async function pushCallToCrm(
  crm: CrmConfig,
  payload: CrmPayload,
): Promise<{ ok: boolean; status?: number; error?: string }> {
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
