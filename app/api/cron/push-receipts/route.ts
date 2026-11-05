import { sweepPushReceipts } from "@/lib/mobile/push-receipts";

export const dynamic = "force-dynamic";

/**
 * Expo reports most dead push tokens only in receipts, about 15 minutes after
 * a send. Each run reads the receipts of the stored tickets and deletes the
 * dead devices (lib/mobile/push-receipts.ts).
 */
export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET || process.env.AGENT_WEBHOOK_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  try {
    const result = await sweepPushReceipts();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[push-receipts] sweep failed", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
