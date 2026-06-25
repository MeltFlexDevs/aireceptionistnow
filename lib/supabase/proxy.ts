import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicSupabaseEnv } from "./config";

// Refreshes the Supabase session on every matched request and guards /dashboard.
// Runs in the proxy so rotated auth cookies are written back to the browser.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Auth not configured yet — let everything through so the app still serves.
  const env = publicSupabaseEnv();
  if (!env) return supabaseResponse;

  // With Fluid compute, never put this client in a global. New one per request.
  const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims(). getClaims()
  // validates the JWT signature, so it is safe to trust here.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const { pathname } = request.nextUrl;

  // Guard the workspace. Everything else (marketing site, auth routes, Twilio
  // webhooks) stays public.
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "login");
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return supabaseResponse as-is so the refreshed cookies survive.
  return supabaseResponse;
}
