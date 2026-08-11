import { serviceClient } from "@/lib/dashboard/supabase";
import { buildDemandDigests, type DemandCluster, type DemandDigest } from "@/lib/dashboard/demand";

export const dynamic = "force-dynamic";

/**
 * The Monday email: what your phone line said no to last week.
 *
 * This is the one report in the product that contains information the business
 * cannot get anywhere else. A CRM records what was sold. Analytics records who
 * visited. Neither hears a customer say "do you do X?" and then hears the answer
 * be no - only the phone line does, and until now it threw that away at the end
 * of every call.
 *
 * It is deliberately cheap: the signals were already extracted by the post-call
 * summary pass that runs anyway, the clustering is string grouping rather than
 * another model call, and this route is one read plus one email per tenant.
 *
 * It is also deliberately quiet. A report is only sent to an account with enough
 * calls in the window for a pattern to mean anything, and only when there is a
 * repeated request to report. "No email this week" is the correct output most
 * weeks, and it is what keeps the email worth opening the week it does arrive.
 */

const WINDOW_DAYS = 7;

export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET || process.env.AGENT_WEBHOOK_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();

  let digests: DemandDigest[];
  try {
    digests = await buildDemandDigests(since);
  } catch (err) {
    console.error("[demand-digest] build failed", err);
    return Response.json({ ok: false }, { status: 500 });
  }

  if (digests.length === 0) return Response.json({ ok: true, sent: 0, considered: 0 });

  const emails = await resolveOwnerEmails(digests.map((d) => d.ownerId));

  let sent = 0;
  const results = await Promise.allSettled(
    digests.map(async (digest) => {
      const to = emails.get(digest.ownerId);
      if (!to) return;
      const ok = await sendDigest(to, digest);
      if (ok) sent += 1;
    }),
  );
  for (const r of results) {
    if (r.status === "rejected") console.error("[demand-digest] send failed", r.reason);
  }

  return Response.json({ ok: true, sent, considered: digests.length });
}

/**
 * Owner ids to addresses.
 *
 * `auth.users` is not reachable through PostgREST, so the address comes from the
 * admin API. One call per owner, but the caller has already filtered to accounts
 * with something to report, which in practice is a handful per week.
 */
async function resolveOwnerEmails(ownerIds: string[]): Promise<Map<string, string>> {
  const db = serviceClient();
  const out = new Map<string, string>();
  await Promise.all(
    ownerIds.map(async (id) => {
      try {
        const { data } = await db.auth.admin.getUserById(id);
        const email = data?.user?.email;
        if (email) out.set(id, email);
      } catch (err) {
        console.error("[demand-digest] could not resolve owner email", id, err);
      }
    }),
  );
  return out;
}

async function sendDigest(to: string, digest: DemandDigest): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.info("[demand-digest] no email provider configured - skipping send");
    return false;
  }

  const lead = digest.notOffered[0] ?? digest.unanswered[0];
  // The subject IS the finding. A generic "your weekly report" subject makes an
  // email with a real number in it look like every other automated mail.
  const subject = lead
    ? `${lead.count} callers asked about ${lead.topic}`
    : "What your callers asked for last week";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject,
      text: renderText(digest),
      html: renderHtml(digest),
    }),
  });
  if (!res.ok) {
    console.error(`[demand-digest] resend ${res.status}`);
    return false;
  }
  return true;
}

function renderText(d: DemandDigest): string {
  const lines: string[] = [
    `Across ${d.calls} calls in the last ${WINDOW_DAYS} days, here is what your callers asked for and did not get.`,
    "",
  ];
  if (d.notOffered.length > 0) {
    lines.push("ASKED FOR, BUT NOT SOMETHING YOU OFFER");
    for (const c of d.notOffered) lines.push(...clusterText(c));
    lines.push("");
  }
  if (d.unanswered.length > 0) {
    lines.push("QUESTIONS YOUR RECEPTIONIST COULD NOT ANSWER");
    for (const c of d.unanswered) lines.push(...clusterText(c));
    lines.push("");
    lines.push("Answer any of these once and it will use your exact words from then on:");
    lines.push(`${base()}/dashboard/knowledge`);
  }
  lines.push("");
  lines.push(
    "Every line above is taken verbatim from a real call. Nothing here is an estimate.",
  );
  return lines.join("\n");
}

function clusterText(c: DemandCluster): string[] {
  const out = [`- ${c.count} x ${c.topic}`];
  for (const q of c.quotes) out.push(`    "${q}"`);
  return out;
}

function renderHtml(d: DemandDigest): string {
  const section = (title: string, clusters: DemandCluster[]): string =>
    clusters.length === 0
      ? ""
      : `<h2 style="font:600 14px/1.4 -apple-system,system-ui,sans-serif;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin:28px 0 10px">${esc(title)}</h2>` +
        clusters
          .map(
            (c) =>
              `<div style="padding:12px 0;border-top:1px solid #e5e7eb">` +
              `<p style="margin:0;font:600 16px/1.4 -apple-system,system-ui,sans-serif;color:#1D1D1D">${c.count} &times; ${esc(c.topic)}</p>` +
              c.quotes
                .map(
                  (q) =>
                    `<p style="margin:6px 0 0;font:14px/1.5 -apple-system,system-ui,sans-serif;color:#6b7280">&ldquo;${esc(q)}&rdquo;</p>`,
                )
                .join("") +
              `</div>`,
          )
          .join("");

  return (
    `<div style="max-width:560px;margin:0 auto;padding:24px 20px;font-family:-apple-system,system-ui,sans-serif;color:#1D1D1D">` +
    `<p style="margin:0;font:15px/1.6 -apple-system,system-ui,sans-serif;color:#374151">Across <strong>${d.calls} calls</strong> in the last ${WINDOW_DAYS} days, here is what your callers asked for and did not get.</p>` +
    section("Asked for, but not something you offer", d.notOffered) +
    section("Questions your receptionist could not answer", d.unanswered) +
    (d.unanswered.length > 0
      ? `<p style="margin:24px 0 0"><a href="${base()}/dashboard/knowledge" style="display:inline-block;background:#1D1D1D;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font:500 14px/1 -apple-system,system-ui,sans-serif">Answer these once</a></p>`
      : "") +
    `<p style="margin:28px 0 0;font:12px/1.5 -apple-system,system-ui,sans-serif;color:#9ca3af">Every line above is quoted from a real call. Nothing here is an estimate.</p>` +
    `</div>`
  );
}

function base(): string {
  return (process.env.APP_BASE_URL ?? "").replace(/\/$/, "");
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
