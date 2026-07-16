import { checkAvailabilityAction } from "@/lib/call-engine/actions";
import { handleTool } from "@/lib/call-engine/agent/handler";

export const dynamic = "force-dynamic";

export function POST(req: Request): Promise<Response> {
  return handleTool(req, (ctx, body) => checkAvailabilityAction(ctx, body));
}
