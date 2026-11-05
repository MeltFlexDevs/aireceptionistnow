import { checkAvailabilityAction } from "@/lib/call-engine/actions";
import { handleTool } from "@/lib/call-engine/agent/handler";
import { unlessPaused } from "@/lib/call-engine/paused";

export const dynamic = "force-dynamic";

export function POST(req: Request): Promise<Response> {
  // Paused: refuse with a normal tool result that steers to take_message.
  return handleTool(req, unlessPaused(checkAvailabilityAction));
}
