import type { CallSummary, NumberConfig, TranscriptTurn } from "../types";

export interface EmailTranscriptConfig {
  enabled?: boolean;
  to?: string;
}

export interface TranscriptEmailInput {
  config: NumberConfig;
  summary: CallSummary;
  turns: TranscriptTurn[];
  from?: string; // caller's number, shown in the subject
  bookingUrl?: string; // link to the booking, when the call booked one
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AVATAR_CID = "assistant-avatar";

export function readEmailConfig(routing: Record<string, unknown>): EmailTranscriptConfig | null {
  const cfg = (routing.emailTranscripts as EmailTranscriptConfig) ?? null;
  if (!cfg || !cfg.enabled || !cfg.to || !EMAIL_RE.test(cfg.to)) return null;
  return cfg;
}

// The transcript and summary are untrusted (a caller can say anything), so every
// dynamic value goes through this before it lands in the HTML email.
function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function subjectLine(input: TranscriptEmailInput): string {
  const { config, summary, from } = input;
  const caller = (from ?? "").trim();
  return `Call summary: ${config.businessName} (${summary.outcome})${caller ? ` - ${caller}` : ""}`;
}

function renderText(input: TranscriptEmailInput): string {
  const { config, summary, turns, from, bookingUrl } = input;
  const caller = (from ?? "").trim();
  const lines: string[] = [`Call summary - ${config.businessName} (${config.label} line)`];
  if (caller) lines.push(`Caller: ${caller}`);
  lines.push("", summary.summary || "(no summary available)");
  if (bookingUrl) lines.push("", `View booking in calendar: ${bookingUrl}`);
  if (summary.actionItems.length) {
    lines.push("", "Action items:", ...summary.actionItems.map((a) => `- ${a}`));
  }
  const transcript = turns.length
    ? turns.map((t) => `${t.role === "caller" ? "Caller" : "AI"}: ${t.text}`).join("\n")
    : "(no conversation captured)";
  lines.push("", "Transcript:", transcript);
  return lines.join("\n");
}

function renderHtml(input: TranscriptEmailInput): string {
  const { config, summary, turns, from, bookingUrl } = input;
  const caller = (from ?? "").trim();

  // The receptionist character, referenced as a cid: inline attachment (see
  // sendTranscriptEmail) so it renders even when the client blocks remote images
  // - which is exactly what happens in the spam folder. Falls back to a lettered
  // circle when APP_BASE_URL isn't set (dev), so the header is never empty.
  const base = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  const initial = esc((config.businessName || "?").trim().charAt(0).toUpperCase() || "?");
  const avatar = base
    ? `<img src="cid:${AVATAR_CID}" width="48" height="48" alt="" style="display:block;border-radius:50%;" />`
    : `<span style="display:inline-block;width:48px;height:48px;border-radius:50%;background:#f4f4f5;color:#111111;font-size:20px;font-weight:700;text-align:center;line-height:48px;">${initial}</span>`;

  const button = bookingUrl
    ? `<tr><td style="padding:20px 28px 0;">
        <a href="${esc(bookingUrl)}" target="_blank" rel="noopener" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px;">View booking in calendar &rarr;</a>
      </td></tr>`
    : "";

  const actionItems = summary.actionItems.length
    ? `<tr><td style="padding:18px 28px 0;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#71717a;font-weight:700;margin-bottom:6px;">Action items</div>
        <table role="presentation" width="100%" style="border-collapse:collapse;">${summary.actionItems
          .map(
            (a) =>
              `<tr><td style="padding:3px 0;font-size:14px;color:#27272a;line-height:1.5;">•&nbsp;${esc(a)}</td></tr>`,
          )
          .join("")}</table>
      </td></tr>`
    : "";

  // Chat bubbles so it's obvious who said what: the caller sits left in a light
  // bubble, the AI sits right in a dark one, each with its own label.
  const transcriptRows = turns.length
    ? turns
        .map((t) => {
          const isCaller = t.role === "caller";
          const bubbleBg = isCaller ? "#f1f1f3" : "#111111";
          const bubbleColor = isCaller ? "#27272a" : "#ffffff";
          const labelColor = isCaller ? "#8a8a92" : "#c7c7cd";
          const tlr = isCaller ? "4px" : "16px";
          const trr = isCaller ? "16px" : "4px";
          return `<tr><td style="padding:5px 0;">
            <table role="presentation" width="100%" style="border-collapse:collapse;"><tr>
              <td align="${isCaller ? "left" : "right"}">
                <table role="presentation" style="border-collapse:collapse;max-width:80%;"><tr>
                  <td style="background:${bubbleBg};color:${bubbleColor};border-radius:16px;border-top-left-radius:${tlr};border-top-right-radius:${trr};padding:9px 14px;font-size:14px;line-height:1.5;">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${labelColor};margin-bottom:2px;">${
                      isCaller ? "Caller" : "AI"
                    }</div>
                    ${esc(t.text)}
                  </td>
                </tr></table>
              </td>
            </tr></table>
          </td></tr>`;
        })
        .join("")
    : `<tr><td style="font-size:14px;color:#a1a1aa;padding:6px 0;">(no conversation captured)</td></tr>`;

  const transcript = `<tr><td style="padding:22px 28px 8px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#71717a;font-weight:700;border-top:1px solid #eeeeee;padding-top:18px;margin-bottom:6px;">Transcript</div>
      <table role="presentation" width="100%" style="border-collapse:collapse;">${transcriptRows}</table>
    </td></tr>`;

  const callerLine = caller
    ? `<div style="font-size:12px;color:#71717a;">${esc(config.label)} line &middot; ${esc(caller)}</div>`
    : `<div style="font-size:12px;color:#71717a;">${esc(config.label)} line</div>`;

  return `<div style="background:#f4f4f5;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" style="border-collapse:collapse;"><tr><td align="center">
    <table role="presentation" width="600" style="width:100%;max-width:600px;border-collapse:collapse;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
      <tr><td style="padding:22px 28px;background:#111111;">
        <table role="presentation" style="border-collapse:collapse;"><tr>
          <td width="48" valign="middle">${avatar}</td>
          <td valign="middle" style="padding-left:14px;">
            <div style="font-size:12px;color:#a1a1aa;letter-spacing:.02em;">Call summary</div>
            <div style="font-size:18px;font-weight:600;color:#ffffff;">${esc(config.businessName)}</div>
            ${callerLine}
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:22px 28px 0;font-size:15px;line-height:1.6;color:#27272a;">${esc(
        summary.summary || "(no summary available)",
      )}</td></tr>
      ${button}
      ${actionItems}
      ${transcript}
      <tr><td style="padding:20px 28px;background:#fafafa;text-align:center;font-size:12px;color:#a1a1aa;border-top:1px solid #f0f0f0;">
        Sent by your AI receptionist at ${esc(config.businessName)}.
      </td></tr>
    </table>
  </td></tr></table>
</div>`;
}

export async function sendTranscriptEmail(
  cfg: EmailTranscriptConfig,
  input: TranscriptEmailInput,
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const subject = subjectLine(input);
  const text = renderText(input);
  const html = renderHtml(input);

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

  // Embed the avatar as a cid: inline attachment (Resend fetches the hosted PNG
  // server-side) so it renders even when the client blocks remote images - as it
  // does for spam-foldered mail. Skipped when APP_BASE_URL is unset (the HTML
  // then uses the lettered-circle fallback).
  const base = (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
  const body: Record<string, unknown> = { from, to: cfg.to, subject, text, html };
  if (base) {
    body.attachments = [
      {
        path: `${base}/assistant-avatar.png`,
        filename: "assistant-avatar.png",
        content_id: AVATAR_CID,
      },
    ];
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, error: `resend ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
