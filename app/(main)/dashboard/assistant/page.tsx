import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { listAssistants } from "@/lib/dashboard/db";
import { PageHeader } from "../components/PageHeader";
import { ListSkeleton } from "../components/ListSkeleton";
import { CreateAssistantForm } from "./CreateAssistantForm";
import { AssistantsList } from "./AssistantsList";
import { getDictionary } from "@/lib/i18n/server";
import { AiAvatar } from "@/app/(main)/onboarding/AiAvatar";

export const dynamic = "force-dynamic";

export default async function AssistantsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; add?: string }>;
}) {
  const [{ error, notice, add }, t, ownerId] = await Promise.all([
    searchParams,
    getDictionary(),
    currentUserId(),
  ]);
  const assistants = await listAssistants(ownerId ?? undefined).catch(() => []);

  // Exactly one receptionist is the normal case, and a list of one is just a
  // click in the way - go straight to it. The redirect fires ONLY at exactly 1:
  // deleteAssistantAction sends you back here, so the zero case must RENDER,
  // never redirect, or deleting the last receptionist would loop. ?add=1 is the
  // deliberate escape hatch, otherwise "Add another" would bounce right back.
  if (assistants.length === 1 && !add) {
    const qs = new URLSearchParams();
    if (error) qs.set("error", error);
    if (notice) qs.set("notice", notice);
    const suffix = qs.toString() ? `?${qs}` : "";
    redirect(`/dashboard/assistant/${assistants[0].id}${suffix}`);
  }

  return (
    <div className="rise space-y-6">
      <PageHeader title={t.assistants.title} />

      {error && (
        <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="shape-pill flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <span>{notice}</span>
          <Link href="/pricing" className="font-medium underline underline-offset-2">
            {t.common.viewPlans}
          </Link>
        </div>
      )}

      {assistants.length === 0 ? (
        // The shared empty-state pattern: the avatar narrates, one primary action.
        <section className="shape-card glass flex flex-col items-center p-6 text-center sm:p-10">
          <AiAvatar mood="greeting" className="h-24 w-24" />
          <h2 className="mt-4 text-base font-semibold text-neutral-900">
            {t.assistants.createTitle}
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-neutral-500">
            {t.assistants.createBody}
          </p>
          <div className="mt-5 w-full max-w-sm text-left">
            <CreateAssistantForm />
          </div>
        </section>
      ) : (
        // More than one receptionist, or ?add=1 on a singleton account.
        <>
          <section className="shape-card glass p-5">
            <CreateAssistantForm />
          </section>
          <Suspense fallback={<ListSkeleton />}>
            <AssistantsList />
          </Suspense>
        </>
      )}
    </div>
  );
}
