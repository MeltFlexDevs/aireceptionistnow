import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { authConfigured } from "@/lib/supabase/config";

// Validated JWT claims for the signed-in user, or null when auth isn't
// configured / there's no valid session. cache() memoizes per request so the
// layout, the page, and every data loader share ONE getClaims() round-trip
// instead of each firing their own (this ran 2-3x per dashboard render).
export const getAuthClaims = cache(
  async (): Promise<Record<string, unknown> | null> => {
    if (!authConfigured()) return null;
    try {
      const supabase = await createClient();
      return ((await supabase.auth.getClaims()).data?.claims ?? null) as Record<
        string,
        unknown
      > | null;
    } catch {
      return null;
    }
  },
);

// The signed-in user's id (auth.users.id). Used to stamp ownership and scope
// dashboard queries. Cached (derives from the cached claims above).
export const currentUserId = cache(async (): Promise<string | null> => {
  const sub = (await getAuthClaims())?.sub;
  return typeof sub === "string" ? sub : null;
});
