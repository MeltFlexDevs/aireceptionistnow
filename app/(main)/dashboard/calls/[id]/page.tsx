import { notFound } from "next/navigation";
import { getCallDetail } from "@/lib/dashboard/calls";
import { currentUserId } from "@/lib/auth";
import { listAssistants } from "@/lib/dashboard/db";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { BackLink } from "../../components/BackLink";
import { CallDetailBody } from "../CallDetailBody";
import { LiveRefresh } from "./LiveRefresh";

export const dynamic = "force-dynamic";

/**
 * The standalone call route. It survives the split-view rebuild because deep
 * links point at it (the notifications bell, calendar View-call links) and
 * because it is the mobile detail surface - below md the list has no pane.
 */
export default async function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, t, locale] = await Promise.all([params, getDictionary(), getLocale()]);
  const ownerId = await currentUserId();

  let call: Awaited<ReturnType<typeof getCallDetail>> | null = null;
  try {
    call = await getCallDetail(id, ownerId, locale);
  } catch {
    call = null;
  }
  if (!call) notFound();

  const assistants = await listAssistants(ownerId ?? undefined).catch(() => []);

  return (
    <div className="rise space-y-6">
      {call.isLive && <LiveRefresh />}
      <BackLink href="/dashboard/calls" label={t.calls.title} />
      <CallDetailBody call={call} variant="page" assistantCount={assistants.length} />
    </div>
  );
}
