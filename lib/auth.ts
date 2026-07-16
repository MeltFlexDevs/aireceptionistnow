import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { authConfigured } from "@/lib/supabase/config";

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

export const currentUserId = cache(async (): Promise<string | null> => {
  const sub = (await getAuthClaims())?.sub;
  return typeof sub === "string" ? sub : null;
});
