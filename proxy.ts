import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// `proxy` is the Next.js 16 replacement for the old `middleware` convention.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (Twilio webhooks, integration callbacks — never gated)
     * - _next/static, _next/image (build assets)
     * - favicon / icon / image assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
