import Link from "next/link";
import { currentUserId } from "@/lib/auth";
import { listAssistants, type Assistant } from "@/lib/dashboard/db";
import { listOrganizations, type Organization } from "@/lib/dashboard/organizations";
import { readKnowledge } from "@/lib/knowledge/sources";
import { Building, Bot, ChevronDown } from "../icons";

const STEPS = [
  { n: 1, title: "Name it", body: "Give your organization your company name." },
  { n: 2, title: "Add knowledge", body: "Drop in your website, a PDF, or notes." },
  { n: 3, title: "Assign assistants", body: "They answer calls using that knowledge." },
];

// Async server component: streams below the (instantly drawn) page header and
// create form. Its data fetch is what the parent <Suspense> waits on, so the
// rest of the page paints immediately while these rows load in the background.
export async function OrganizationsList() {
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

  if (loadError) {
    return (
      <div className="shape-pill border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
        {loadError}
      </div>
    );
  }

  // Empty: guide the user to the create form already shown above.
  if (organizations.length === 0) {
    return (
      <section className="shape-card glass p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Building className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
              Set up your first organization
            </h2>
            <p className="mt-1 max-w-lg text-sm text-neutral-500">
              Your organization is your company. Add your facts once, and every assistant you create
              uses them on calls. Name it in the form above to get started.
            </p>
          </div>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-xl border border-neutral-200/70 bg-white/60 p-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                {s.n}
              </span>
              <p className="mt-2 text-sm font-medium text-neutral-900">{s.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const assistantCount = new Map<string, number>();
  for (const a of assistants) {
    if (a.organization_id) {
      assistantCount.set(a.organization_id, (assistantCount.get(a.organization_id) ?? 0) + 1);
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Your organizations
        </h2>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
          {organizations.length}
        </span>
      </div>

      <div className="shape-card glass divide-y divide-neutral-200/60 overflow-hidden">
        {organizations.map((o) => {
          const sources = readKnowledge(o.knowledge).sources?.length ?? 0;
          const count = assistantCount.get(o.id) ?? 0;
          const initial = (o.name?.trim()?.[0] ?? "O").toUpperCase();
          return (
            <Link
              key={o.id}
              href={`/dashboard/organizations/${o.id}`}
              className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-white/70 sm:px-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-base font-semibold text-white">
                {initial}
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-neutral-900">{o.name}</div>
                <div className="truncate text-xs text-neutral-500">
                  {o.description || "No description yet"}
                </div>
              </div>

              <div className="hidden items-center gap-5 text-xs text-neutral-500 sm:flex">
                <span className="inline-flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="font-medium text-neutral-700">{count}</span>
                  {count === 1 ? "assistant" : "assistants"}
                </span>
                <span>
                  <span className="font-medium text-neutral-700">{sources}</span>{" "}
                  {sources === 1 ? "source" : "sources"}
                </span>
              </div>

              <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-900" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
