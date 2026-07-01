import { checkAvailabilityAction } from "@/lib/call-engine/actions";
import { handleTool } from "@/lib/call-engine/agent/handler";

// Tier-A server tool: check_availability. The ElevenLabs managed agent calls
// this to see whether a proposed time is free before offering/booking it. Same
// logic tier B runs — read-only, never reveals what is scheduled.

export const dynamic = "force-dynamic";

export function POST(req: Request): Promise<Response> {
  return handleTool(req, (ctx, body) => checkAvailabilityAction(ctx, body));
}
