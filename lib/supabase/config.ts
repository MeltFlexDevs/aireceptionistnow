// Public (browser) Supabase env. Auth is only wired up once both are present;
// until then the app runs ungated so it still builds and serves.
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
