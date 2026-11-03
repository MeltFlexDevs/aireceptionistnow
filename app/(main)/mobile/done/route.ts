import { APP_RETURN_URL, safeAppReturnUrl } from "@/lib/mobile/link";

export const dynamic = "force-dynamic";

/**
 * The last hop of a calendar Connect started in the app.
 *
 * web-link mints `/api/integrations/<id>/connect?next=/mobile/done?return=<app url>`;
 * the OAuth callback lands here with `connected=1` or `error=<message>`
 * appended, and this bounces the browser tab back into the app, which closes
 * the auth sheet (openAuthSessionAsync watches for the return URL).
 *
 * `return` must be one of the app's own schemes (see safeAppReturnUrl); anything
 * else falls back to aireceptionistnow://handoff, so this can never redirect to
 * a website. The provider's error text is reduced to a short [a-z0-9-] slug:
 * it is diagnostics, and a deep link is no place for free text.
 */

function slug(message: string): string {
  const s = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return s || "failed";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function GET(req: Request): Response {
  const params = new URL(req.url).searchParams;

  const target = new URL(safeAppReturnUrl(params.get("return")) ?? APP_RETURN_URL);
  target.searchParams.set("to", "calendar");
  const error = params.get("error");
  if (error) target.searchParams.set("error", slug(error));
  else if (params.get("connected") === "1") target.searchParams.set("connected", "1");

  const href = target.href;
  // For a browser that does not follow a redirect to a custom scheme.
  const body =
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>AI Receptionist Now</title></head><body>` +
    `<p><a href="${escapeHtml(href)}">You can return to the app.</a></p></body></html>`;

  return new Response(body, {
    status: 302,
    headers: {
      Location: href,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
