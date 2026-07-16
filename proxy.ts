import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

// `proxy` is the Next.js 16 replacement for the old `middleware` convention.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
