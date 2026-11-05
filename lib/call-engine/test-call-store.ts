import { createAdminClient } from "@/lib/supabase/admin";
import type { ReserveReply, TestCallStore } from "./test-call-limit";

/** reserve_test_call / release_test_call (0017_test_calls.sql), service role only. */
export const supabaseTestCallStore: TestCallStore = {
  async reserve(input) {
    const { data, error } = await createAdminClient().rpc("reserve_test_call", {
      p_owner: input.owner,
      p_assistant: input.assistant,
      p_free: input.free,
      p_country: input.country,
      p_owner_cap: input.ownerCap,
      p_free_cap: input.freeCap,
    });
    if (error) throw error;
    if (data === "owner_limit" || data === "free_limit") {
      return { refused: data } satisfies ReserveReply;
    }
    if (typeof data === "string" && data) return { id: data } satisfies ReserveReply;
    throw new Error(`reserve_test_call returned ${String(data)}`);
  },
  async release(id) {
    const { error } = await createAdminClient().rpc("release_test_call", { p_id: id });
    if (error) throw error;
  },
};
