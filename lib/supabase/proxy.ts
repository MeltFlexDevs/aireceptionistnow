import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authOff, devDashboardBypass, publicSupabaseEnv } from "./config";
import { LOCALE_COOKIE } from "@/lib/i18n/config";
import { loginHomePath } from "@/lib/i18n/marketing/login-redirect";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // No public Supabase env: auth-off mode lets everything through, but only in
  // local development. Anywhere else it is a broken deploy, so answer 503
  // instead of serving a dashboard with no sign-in (prod-web-03).
  const env = publicSupabaseEnv();
  if (!env) {
    if (authOff()) return supabaseResponse;
    return new NextResponse("Sign-in is unavailable right now. Please try again later.", {
      status: 503,
    });
  }

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

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith("/dashboard") && !devDashboardBypass()) {
    const url = request.nextUrl.clone();
    // The localized home, so the sign-in dialog opens in the visitor's language.
    url.pathname = loginHomePath({
      cookieLocale: request.cookies.get(LOCALE_COOKIE)?.value,
      acceptLanguage: request.headers.get("accept-language"),
    });
    url.searchParams.set("auth", "login");
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return supabaseResponse as-is so the refreshed cookies survive.
  return supabaseResponse;
}
