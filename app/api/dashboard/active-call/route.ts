import { NextResponse } from "next/server";

import { currentUserId } from "@/lib/auth";
import { hasActiveCall } from "@/lib/dashboard/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight poll target for the sidebar avatar's live-call dot. Returns
// { active } for the signed-in owner; no session (or a guest) is simply "not in
// a call".
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ active: false });
  const active = await hasActiveCall(userId).catch(() => false);
  return NextResponse.json({ active });
}
