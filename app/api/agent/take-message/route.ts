import { takeMessageAction } from "@/lib/call-engine/actions";
import { handleTool } from "@/lib/call-engine/agent/handler";
import { getRepository } from "@/lib/call-engine/persistence/supabase";

// Tier-A server tool: take_message. Records the message and texts the owner if
// SMS alerts are enabled — identical to tier B.

export const dynamic = "force-dynamic";

export function POST(req: Request): Promise<Response> {
  return handleTool(req, (ctx, body) =>
    takeMessageAction(ctx, getRepository(), body),
  );
}
