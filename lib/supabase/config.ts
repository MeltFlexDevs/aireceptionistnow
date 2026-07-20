export function publicSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export function authConfigured(): boolean {
  return publicSupabaseEnv() !== null;
}

// Dev-only bypass: `DEV_DASHBOARD=1 npm run dev` opens /dashboard as the guest
// "Workspace" user even with auth configured - for eyeballing dashboard pages
// without a session. Double-gated on NODE_ENV, so a stray DEV_DASHBOARD=1 in
// production env is inert (`next build` always runs as production).
export function devDashboardBypass(): boolean {
  return process.env.NODE_ENV === "development" && process.env.DEV_DASHBOARD === "1";
}
