import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Auth is only enforced (and consumed) under /dashboard - marketing pages
  // shouldn't pay a Supabase session check per request.
  matcher: ["/dashboard/:path*"],
};
