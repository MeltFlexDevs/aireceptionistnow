import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { listAssistants, type Assistant } from "@/lib/dashboard/db";
import { getOrganization } from "@/lib/dashboard/organizations";
import { readKnowledge } from "@/lib/knowledge/sources";
import { SectionCard } from "../../components/SectionCard";
import { PageHeader } from "../../components/PageHeader";
import { Hint } from "../../components/Hint";
import { Bot } from "../../icons";
import {
  addOrgPdfKnowledgeAction,
  addOrgWebsiteKnowledgeAction,
  removeOrgKnowledgeSourceAction,
  toggleAssistantOrganizationAction,
  updateOrganizationAction,
  updateOrganizationNotesAction,
} from "../actions";
import { DeleteOrganization } from "../DeleteOrganization";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900";
const labelCls = "mb-1.5 block text-sm font-medium text-neutral-700";

export default async function OrganizationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  const org = await getOrganization(id).catch(() => null);
  if (!org) notFound();

  const ownerId = await currentUserId();
  if (ownerId && org.owner_id && org.owner_id !== ownerId) notFound();

  const knowledge = readKnowledge(org.knowledge);
  const notes = knowledge.notes ?? "";
  const sources = knowledge.sources ?? [];

  let assistants: Assistant[] = [];
  try {
    assistants = await listAssistants(ownerId);
  } catch {
    assistants = [];
  }
  const assigned = assistants.filter((a) => a.organization_id === id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={org.name}
        description="Manage this organization's shared knowledge and which assistants belong to it."
        back={{ href: "/dashboard/organizations", label: "Organizations" }}
      />

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <Hint title="Shared knowledge = facts every assistant should know">
        Add things like your hours, services, pricing, and address once below. Every assistant you
        assign here will use them on calls. No need to repeat yourself for each assistant.
      </Hint>

      <form action={updateOrganizationAction}>
        <input type="hidden" name="id" value={org.id} />
        <SectionCard title="Details" subtitle="The corporation this group of assistants belongs to.">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className={labelCls}>Name</label>
              <input id="name" name="name" defaultValue={org.name} placeholder="e.g. Acme Corp" className={field} />
            </div>
            <div>
              <label htmlFor="description" className={labelCls}>Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={org.description}
                rows={2}
                placeholder="What this organization does."
                className={`${field} resize-y`}
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Save details
            </button>
          </div>
        </SectionCard>
      </form>

      <SectionCard
        title="Assistants"
        subtitle="Assign assistants to this organization. Each assigned assistant reads the shared knowledge below on every call."
      >
        {assistants.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No assistants yet.{" "}
            <Link href="/dashboard/assistant" className="text-neutral-900 hover:text-neutral-900">
              Create one →
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {assistants.map((a) => {
              const isAssigned = a.organization_id === id;
              const otherOrg = a.organization_id && a.organization_id !== id;
              return (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-900 text-white">
                      <Bot className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-neutral-800">{a.name}</div>
                      {otherOrg && (
                        <div className="truncate text-xs text-neutral-700">Assigned to another organization</div>
                      )}
                    </div>
                  </div>
                  <form action={toggleAssistantOrganizationAction}>
                    <input type="hidden" name="id" value={org.id} />
                    <input type="hidden" name="assistant_id" value={a.id} />
                    <input type="hidden" name="assign" value={isAssigned ? "0" : "1"} />
                    <button
                      type="submit"
                      className={
                        isAssigned
                          ? "inline-flex h-8 shrink-0 items-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                          : "inline-flex h-8 shrink-0 items-center rounded-lg bg-neutral-900 px-3 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
                      }
                    >
                      {isAssigned ? "Remove" : otherOrg ? "Reassign here" : "Assign"}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
        {assigned.length > 0 && (
          <p className="mt-3 text-xs text-neutral-400">
            {assigned.length} {assigned.length === 1 ? "assistant" : "assistants"} in this organization.
          </p>
        )}
      </SectionCard>

      <SectionCard
        title="Shared knowledge"
        subtitle="Websites, PDFs, and notes every assigned assistant reads on calls."
      >
        <div className="space-y-4">
          {sources.length > 0 && (
            <ul className="space-y-2">
              {sources.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-neutral-800">
                      {s.kind === "website" ? "🌐" : "📄"} {s.title}
                    </div>
                    <div className="truncate text-xs text-neutral-400">
                      {s.url ?? s.kind} · {(s.charCount / 1000).toFixed(1)}k chars
                    </div>
                  </div>
                  <form action={removeOrgKnowledgeSourceAction}>
                    <input type="hidden" name="id" value={org.id} />
                    <input type="hidden" name="source_id" value={s.id} />
                    <button
                      type="submit"
                      className="inline-flex h-8 shrink-0 items-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form action={addOrgWebsiteKnowledgeAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input type="hidden" name="id" value={org.id} />
            <div className="flex-1">
              <label htmlFor="kn_url" className={labelCls}>Import from website</label>
              <input id="kn_url" name="url" type="url" required placeholder="https://yourcompany.com/about" className={field} />
            </div>
            <button
              type="submit"
              className="inline-flex h-[38px] shrink-0 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Import
            </button>
          </form>

          <form action={addOrgPdfKnowledgeAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input type="hidden" name="id" value={org.id} />
            <div className="flex-1">
              <label htmlFor="kn_pdf" className={labelCls}>Upload a PDF</label>
              <input
                id="kn_pdf"
                name="pdf"
                type="file"
                accept="application/pdf"
                required
                className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1 file:text-sm file:text-neutral-700`}
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-[38px] shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Upload
            </button>
          </form>

          <form action={updateOrganizationNotesAction}>
            <input type="hidden" name="id" value={org.id} />
            <label htmlFor="knowledge_notes" className={labelCls}>Notes & FAQs</label>
            <textarea
              id="knowledge_notes"
              name="knowledge_notes"
              defaultValue={notes}
              rows={4}
              placeholder="Hours, policies, locations, pricing. Anything every assistant should know."
              className={`${field} resize-y`}
            />
            <button
              type="submit"
              className="mt-3 inline-flex h-9 items-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Save notes
            </button>
          </form>
        </div>
      </SectionCard>

      <SectionCard title="Danger zone">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">Delete this organization. Its assistants are kept but detached.</p>
          <DeleteOrganization id={org.id} name={org.name} />
        </div>
      </SectionCard>
    </div>
  );
}
