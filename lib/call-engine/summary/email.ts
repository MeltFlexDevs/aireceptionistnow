import type { CallSummary, NumberConfig, TranscriptTurn } from "../types";

export interface EmailTranscriptConfig {
  enabled?: boolean;
  to?: string;
}

export interface TranscriptEmailInput {
  config: NumberConfig;
  summary: CallSummary;
  turns: TranscriptTurn[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readEmailConfig(routing: Record<string, unknown>): EmailTranscriptConfig | null {
  const cfg = (routing.emailTranscripts as EmailTranscriptConfig) ?? null;
  if (!cfg || !cfg.enabled || !cfg.to || !EMAIL_RE.test(cfg.to)) return null;
  return cfg;
}

function renderBody(input: TranscriptEmailInput): { subject: string; text: string } {
  const { config, summary, turns } = input;
  const transcript = turns.length
    ? turns.map((t) => `${t.role === "caller" ? "Caller" : "AI"}: ${t.text}`).join("\n")
    : "(no conversation captured)";

  const text = [
    `Call recap - ${config.businessName} (${config.label} line)`,
    "",
    `Outcome: ${summary.outcome}`,
    `Sentiment: ${summary.sentiment}`,
    "",
    "Summary:",
    summary.summary || "(none)",
    "",
    summary.actionItems.length ? `Action items:\n${summary.actionItems.map((a) => `- ${a}`).join("\n")}\n` : "",
    "Transcript:",
    transcript,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return { subject: `New call - ${config.businessName} (${summary.outcome})`, text };
}

export async function sendTranscriptEmail(
  cfg: EmailTranscriptConfig,
  input: TranscriptEmailInput,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const { subject, text } = renderBody(input);

  if (!apiKey || !from) {
    if (apiKey || from) {
      console.error(
        `[email] transcript email for ${cfg.to} NOT sent: ${apiKey ? "EMAIL_FROM" : "RESEND_API_KEY"} is missing while ${apiKey ? "RESEND_API_KEY" : "EMAIL_FROM"} is set - check the env var names`,
      );
    } else {
      console.info(
        `[email] transcript ready for ${cfg.to} but no email provider configured (set RESEND_API_KEY + EMAIL_FROM) - skipping send`,
      );
    }
    return { ok: false, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, to: cfg.to, subject, text }),
    });
    if (!res.ok) return { ok: false, error: `resend ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
