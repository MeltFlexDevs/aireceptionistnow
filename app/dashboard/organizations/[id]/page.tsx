import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { listAssistants, type Assistant } from "@/lib/dashboard/db";
import { getOrganization } from "@/lib/dashboard/organizations";
import { readKnowledge } from "@/lib/knowledge/sources";
import { SectionCard } from "../../components/SectionCard";
import { PageHeader } from "../../components/PageHeader";
import { SubmitButton } from "../../components/SubmitButton";
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
const rowCls =
  "flex items-center justify-between gap-3 rounded-lg border border-neutral-200/70 bg-white/60 px-3 py-2.5";

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
        description="Shared knowledge and the assistants that use it."
        back={{ href: "/dashboard/organizations", label: "Organizations" }}
      />

      {saved && (
        <div className="shape-pill border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          Saved.
        </div>
      )}
      {error && (
        <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ── Details ─────────────────────────────────────────────────────── */}
      <form action={updateOrganizationAction}>
        <input type="hidden" name="id" value={org.id} />
        <SectionCard title="Details" subtitle="Name and describe this organization.">
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
            <SubmitButton pendingText="Saving…">Save details</SubmitButton>
          </div>
        </SectionCard>
      </form>

      {/* ── Assistants ──────────────────────────────────────────────────── */}
      <SectionCard
        title="Assistants"
        subtitle={
          assigned.length > 0
            ? `${assigned.length} assigned. Each uses the shared knowledge below.`
            : "Assign assistants. Each one uses the shared knowledge below on calls."
        }
      >
        {assistants.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No assistants yet.{" "}
            <Link href="/dashboard/assistant" className="font-medium text-neutral-900 underline underline-offset-2">
              Create one
            </Link>
          </p>
        ) : (
          <ul className="space-y-2">
            {assistants.map((a) => {
              const isAssigned = a.organization_id === id;
              const otherOrg = Boolean(a.organization_id && a.organization_id !== id);
              return (
                <li key={a.id} className={rowCls}>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
                      <Bot className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-neutral-800">{a.name}</div>
                      {otherOrg && (
                        <div className="truncate text-xs text-amber-600">In another organization</div>
                      )}
                    </div>
                  </div>
                  <form action={toggleAssistantOrganizationAction}>
                    <input type="hidden" name="id" value={org.id} />
                    <input type="hidden" name="assistant_id" value={a.id} />
                    <input type="hidden" name="assign" value={isAssigned ? "0" : "1"} />
                    <SubmitButton
                      variant={isAssigned ? "danger" : "primary"}
                      pendingText="…"
                      className="h-8 px-3 text-xs"
                    >
                      {isAssigned ? "Remove" : otherOrg ? "Reassign here" : "Assign"}
                    </SubmitButton>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* ── Shared knowledge ────────────────────────────────────────────── */}
      <SectionCard
        title="Shared knowledge"
        subtitle="Add websites, PDFs, or notes. Every assigned assistant reads them on calls."
      >
        <div className="space-y-4">
          {sources.length > 0 && (
            <ul className="space-y-2">
              {sources.map((s) => (
                <li key={s.id} className={rowCls}>
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
                    <SubmitButton variant="danger" pendingText="…" className="h-8 px-3 text-xs">
                      Remove
                    </SubmitButton>
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
            <SubmitButton pendingText="Importing…" className="h-[38px]">Import</SubmitButton>
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
                className={`${field} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white file:transition-all hover:file:-translate-y-px hover:file:bg-neutral-700 active:file:translate-y-0`}
              />
            </div>
            <SubmitButton variant="secondary" pendingText="Uploading…" className="h-[38px]">
              Upload
            </SubmitButton>
          </form>

          <form action={updateOrganizationNotesAction}>
            <input type="hidden" name="id" value={org.id} />
            <label htmlFor="knowledge_notes" className={labelCls}>Notes and FAQs</label>
            <textarea
              id="knowledge_notes"
              name="knowledge_notes"
              defaultValue={notes}
              rows={4}
              placeholder="Hours, policies, locations, pricing. Anything every assistant should know."
              className={`${field} resize-y`}
            />
            <div className="mt-3">
              <SubmitButton pendingText="Saving…">Save notes</SubmitButton>
            </div>
          </form>
        </div>
      </SectionCard>

      {/* ── Danger zone ─────────────────────────────────────────────────── */}
      <SectionCard title="Danger zone">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            Delete this organization. Its assistants stay, just detached.
          </p>
          <DeleteOrganization id={org.id} name={org.name} />
        </div>
      </SectionCard>
    </div>
  );
}
