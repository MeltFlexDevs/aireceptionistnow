export function publicSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

// Auth-off mode: no public Supabase env during local development (`npm run
// dev`). Pages and actions then run unscoped on the service-role client, and
// the dashboard opens as the guest "Workspace" user. Outside development a
// missing env is a broken deploy, never this mode (prod-web-03): the proxy
// answers 503 and authConfigured() stays true, so every auth check fails closed.
export function authOff(): boolean {
  return publicSupabaseEnv() === null && process.env.NODE_ENV === "development";
}

// Whether sign-in is enforced: true everywhere except auth-off mode. It does
// not promise that the env is there; publicSupabaseEnv() tells that.
export function authConfigured(): boolean {
  return !authOff();
}

// Dev-only bypass: `DEV_DASHBOARD=1 npm run dev` opens /dashboard as the guest
// "Workspace" user even with auth configured - for eyeballing dashboard pages
// without a session. Double-gated on NODE_ENV, so a stray DEV_DASHBOARD=1 in
// production env is inert (`next build` always runs as production).
export function devDashboardBypass(): boolean {
  return process.env.NODE_ENV === "development" && process.env.DEV_DASHBOARD === "1";
}

/**
 * Whether this browser is carrying a Supabase auth cookie at all.
 *
 * @supabase/ssr's browser client stores the session in `sb-<ref>-auth-token`
 * (chunked into `.0`, `.1`… when it is large), with `httpOnly: false` in its
 * DEFAULT_COOKIE_OPTIONS, so the presence of a session is readable without
 * loading the SDK. That matters: @supabase/supabase-js is a ~240 kB chunk, and
 * SiteHeader used to pull it on every marketing page just to decide whether the
 * header says "Sign in" or "Dashboard". Anonymous visitors - which is everyone
 * arriving from search - now never download it.
 *
 * Presence is not proof of a valid session (the token can be expired), so a hit
 * still loads the client and resolves it properly. A miss is conclusive.
 */
export function hasSupabaseAuthCookie(): boolean {
  if (typeof document === "undefined") return false;
  return /(?:^|;\s*)sb-[^=;]*-auth-token(?:\.\d+)?=/.test(document.cookie);
}
