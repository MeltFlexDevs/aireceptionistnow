import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "../components/PageHeader";
import { ListSkeleton } from "../components/ListSkeleton";
import { CreateAssistantForm } from "./CreateAssistantForm";
import { AssistantsList } from "./AssistantsList";

export const dynamic = "force-dynamic";

export default async function AssistantsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader title="Assistants" description="The voice that answers your phone numbers." />

      {error && (
        <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="shape-pill flex flex-wrap items-center justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <span>{notice}</span>
          <Link href="/pricing" className="font-medium underline underline-offset-2">
            View plans
          </Link>
        </div>
      )}

      {/* Create row paints immediately — no waiting on the list query. */}
      <section className="shape-card glass p-5">
        <CreateAssistantForm />
      </section>

      {/* List streams in the background; skeleton holds the layout meanwhile. */}
      <Suspense fallback={<ListSkeleton />}>
        <AssistantsList />
      </Suspense>
    </div>
  );
}
