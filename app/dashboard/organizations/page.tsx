import { Suspense } from "react";
import { PageHeader } from "../components/PageHeader";
import { ListSkeleton } from "../components/ListSkeleton";
import { CreateOrganizationForm } from "./CreateOrganizationForm";
import { OrganizationsList } from "./OrganizationsList";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Group your assistants under one company and share knowledge across them."
      />

      {error && (
        <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Create row paints immediately — no waiting on the list query. */}
      <section className="shape-card glass p-5">
        <CreateOrganizationForm />
      </section>

      {/* List streams in the background; skeleton holds the layout meanwhile. */}
      <Suspense fallback={<ListSkeleton />}>
        <OrganizationsList />
      </Suspense>
    </div>
  );
}
