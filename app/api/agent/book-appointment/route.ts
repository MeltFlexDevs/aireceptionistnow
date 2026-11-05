import { bookAppointmentAction } from "@/lib/call-engine/actions";
import { handleTool } from "@/lib/call-engine/agent/handler";
import { getRepository } from "@/lib/call-engine/persistence/supabase";
import { unlessPaused } from "@/lib/call-engine/paused";

export const dynamic = "force-dynamic";

// Paused: refuse with a normal tool result that steers to take_message.
export function POST(req: Request): Promise<Response> {
  return handleTool(
    req,
    unlessPaused((ctx, body) => bookAppointmentAction(ctx, getRepository(), body)),
  );
}
