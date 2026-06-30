import Link from "next/link";
import { currentUserId } from "@/lib/auth";
import { listAssistants, type Assistant } from "@/lib/dashboard/db";
import { listOrganizations, type Organization } from "@/lib/dashboard/organizations";
import { readKnowledge } from "@/lib/knowledge/sources";
import { Building, Bot, ChevronDown, Plus } from "../icons";
import { PageHeader } from "../components/PageHeader";
import { Hint } from "../components/Hint";
import { CreateOrganizationForm } from "./CreateOrganizationForm";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const ownerId = await currentUserId();

  let organizations: Organization[] = [];
  let assistants: Assistant[] = [];
  let loadError = "";
  try {
    [organizations, assistants] = await Promise.all([
      listOrganizations(ownerId),
      listAssistants(ownerId),
    ]);
  } catch (err) {
    loadError = (err as Error).message;
  }

  const assistantCount = new Map<string, number>();
  for (const a of assistants) {
    if (a.organization_id) {
      assistantCount.set(a.organization_id, (assistantCount.get(a.organization_id) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="An organization is your company. Add facts once here, and every assistant you put in it will know them on calls."
      />

      <Hint tone="tip" title="How this works">
        1. Create your organization. &nbsp;2. Add shared knowledge (your website, a PDF, or notes).
        &nbsp;3. Assign assistants to it. They read that knowledge on their own.
      </Hint>

      {(error || loadError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error ?? loadError}
        </div>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-sm shadow-neutral-200">
            <Plus className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-medium text-neutral-900">Create an organization</h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              Name your corporation, then add shared knowledge and assign assistants.
            </p>
          </div>
        </div>
        <div className="mt-5">
          <CreateOrganizationForm />
        </div>
      </section>

      {organizations.length === 0 && !loadError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <Building className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-medium text-neutral-900">No organizations yet</h2>
          <p className="mt-1 text-sm text-neutral-500">Create your first organization above.</p>
        </div>
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-900">Your organizations</h2>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
              {organizations.length}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {organizations.map((o) => {
              const sources = readKnowledge(o.knowledge).sources?.length ?? 0;
              const count = assistantCount.get(o.id) ?? 0;
              return (
                <Link
                  key={o.id}
                  href={`/dashboard/organizations/${o.id}`}
                  className="group relative flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-sm">
                      <Building className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-neutral-900">{o.name}</div>
                      <div className="mt-0.5 truncate text-xs text-neutral-500">
                        {o.description || "No description"}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900" />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 pt-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-700">
                      <Bot className="h-3.5 w-3.5 text-neutral-400" />
                      {count} {count === 1 ? "assistant" : "assistants"}
                    </span>
                    <span className="text-neutral-400">
                      {sources} {sources === 1 ? "source" : "sources"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
