import { takeMessageAction } from "@/lib/call-engine/actions";
import { handleTool } from "@/lib/call-engine/agent/handler";
import { getRepository } from "@/lib/call-engine/persistence/supabase";

export const dynamic = "force-dynamic";

export function POST(req: Request): Promise<Response> {
  return handleTool(req, (ctx, body) =>
    takeMessageAction(ctx, getRepository(), body),
  );
}
