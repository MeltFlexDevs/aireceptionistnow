import { createClient } from "@/lib/supabase/server";
import { authConfigured } from "@/lib/supabase/config";

// The signed-in user's id (auth.users.id), or null when auth isn't configured or
// there's no valid session. Used to stamp ownership and scope dashboard queries.
export async function currentUserId(): Promise<string | null> {
  if (!authConfigured()) return null;
  try {
    const supabase = await createClient();
    const sub = (await supabase.auth.getClaims()).data?.claims?.sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}
