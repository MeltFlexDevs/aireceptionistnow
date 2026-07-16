import { Suspense } from "react";
import { PageHeader } from "../components/PageHeader";
import { ListSkeleton } from "../components/ListSkeleton";
import { CreateOrganizationForm } from "./CreateOrganizationForm";
import { OrganizationsList } from "./OrganizationsList";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, t] = await Promise.all([searchParams, getDictionary()]);

  return (
    <div className="space-y-6">
      <PageHeader title={t.organizations.title} />

      {error && (
        <div className="rise shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rise shape-card glass p-5">
        <CreateOrganizationForm />
      </section>

      <Suspense fallback={<ListSkeleton />}>
        <OrganizationsList />
      </Suspense>
    </div>
  );
}
