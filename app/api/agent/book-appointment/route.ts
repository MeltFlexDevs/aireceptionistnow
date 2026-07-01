import { bookAppointmentAction } from "@/lib/call-engine/actions";
import { handleTool } from "@/lib/call-engine/agent/handler";
import { getRepository } from "@/lib/call-engine/persistence/supabase";

// Tier-A server tool: book_appointment. Books on the assistant's write calendar
// (or saves a pending request) and records the action — identical to tier B.

export const dynamic = "force-dynamic";

export function POST(req: Request): Promise<Response> {
  return handleTool(req, (ctx, body) =>
    bookAppointmentAction(ctx, getRepository(), body),
  );
}
