import Link from "next/link";
import { Suspense } from "react";
import { currentUserId } from "@/lib/auth";
import {
  connectedCalendarCount,
  getAiKnowledge,
  summarizeOrgKnowledgeCached,
  type OrgKnowledge,
} from "@/lib/dashboard/ai-knowledge";
import { languageName } from "@/lib/call-engine/voice/phone-language";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { Skeleton } from "../components/Skeleton";
import { StatusDot } from "../components/StatusBadge";
import { Bot, Building, Calendar, ChevronDown, Sparkle } from "../icons";

export const dynamic = "force-dynamic";

function Row({ label, value, href, cta }: { label: string; value: string; href?: string; cta?: string }) {
  const empty = !value.trim();
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-200/60 py-2.5 last:border-0">
      <span className="w-32 shrink-0 text-xs font-medium text-neutral-500">{label}</span>
      <span className={`min-w-0 flex-1 text-sm ${empty ? "text-neutral-400" : "text-neutral-900"}`}>
        {empty ? "Not set" : value}
      </span>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-xs font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
        >
          {cta ?? "Edit"}
        </Link>
      )}
    </div>
  );
}

async function OrgSummary({ entry }: { entry: OrgKnowledge }) {
  const summary = await summarizeOrgKnowledgeCached(entry);
  if (!summary) {
    return (
      <p className="text-sm text-neutral-400">
        {entry.charCount > 0
          ? "Couldn't generate a summary right now - the sources below are still what the AI reads."
          : "Nothing to summarize yet. Add knowledge below and the AI can answer from it."}
      </p>
    );
  }
  return <p className="text-sm leading-relaxed text-neutral-700">{summary}</p>;
}

export default async function KnowledgePage() {
  const ownerId = await currentUserId();
  const [k, calendars] = await Promise.all([
    getAiKnowledge(ownerId ?? null),
    connectedCalendarCount(ownerId ?? null),
  ]);
  const acct = k.account;

  return (
    <div className="space-y-6 rise">
      <PageHeader
        title="What your AI knows about you"
      />

      <SectionCard
        title="About you"
        subtitle="From your account profile. Shared with your assistants so callers can be told who they've reached."
        action={
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              k.ownerNotes ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            <StatusDot tone={k.ownerNotes ? "ok" : "warn"} />
            {k.ownerNotes ? "Shared with assistants" : "Not shared"}
          </span>
        }
      >
        <Row label="Name" value={acct?.full_name ?? ""} href="/dashboard/settings" />
        <Row label="Company" value={acct?.company ?? ""} href="/dashboard/settings" />
        <Row label="Role" value={acct?.role ?? ""} href="/dashboard/settings" />
        <Row label="About" value={acct?.about ?? ""} href="/dashboard/settings" />
        {!k.ownerNotes && (
          <p className="mt-3 text-xs text-neutral-400">
            Sharing is off, so none of this reaches your callers.{" "}
            <Link href="/dashboard/settings" className="font-medium text-neutral-900 underline underline-offset-2">
              Turn it on in Settings
            </Link>
            .
          </p>
        )}
      </SectionCard>

      {k.organizations.length === 0 ? (
        <SectionCard title="Your business knowledge">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white">
              <Building className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-medium text-neutral-900">No organization yet</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
                An organization holds the knowledge your assistants answer from - your services, hours,
                pricing, and any documents or pages you upload.
              </p>
            </div>
            <Link
              href="/dashboard/organizations"
              className="press mt-1 inline-flex h-9 items-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Create an organization
            </Link>
          </div>
        </SectionCard>
      ) : (
        k.organizations.map((entry) => (
          <SectionCard
            key={entry.org.id}
            title={entry.org.name}
            subtitle={entry.org.description || "No description yet."}
            action={
              <Link
                href={`/dashboard/organizations/${entry.org.id}`}
                className="shrink-0 text-xs font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
              >
                Manage
              </Link>
            }
          >
            <div className="space-y-5">
              <div className="rounded-xl border border-neutral-200/70 bg-neutral-50/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-neutral-900 text-white">
                    <Sparkle className="h-3 w-3" />
                  </span>
                  <h3 className="text-xs font-medium text-neutral-900">What it can answer</h3>
                </div>
                <Suspense fallback={<Skeleton className="h-12 w-full" />}>
                  <OrgSummary entry={entry} />
                </Suspense>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-medium text-neutral-500">
                  Knowledge it reads ({entry.charCount.toLocaleString()} characters)
                </h3>
                {entry.sources.length === 0 && !entry.notes ? (
                  <p className="text-sm text-neutral-400">
                    Nothing uploaded yet.{" "}
                    <Link
                      href={`/dashboard/organizations/${entry.org.id}`}
                      className="font-medium text-neutral-900 underline underline-offset-2"
                    >
                      Add a website or PDF
                    </Link>
                    .
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {entry.notes && (
                      <li className="rounded-lg border border-neutral-200/70 bg-white/60 px-3 py-2.5">
                        <div className="text-sm font-medium text-neutral-800">Notes</div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{entry.notes}</p>
                      </li>
                    )}
                    {entry.sources.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-lg border border-neutral-200/70 bg-white/60"
                      >
                        <details className="group">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-neutral-800">
                                {s.title}
                              </span>
                              <span className="block truncate text-xs text-neutral-500">
                                {s.url ?? `${s.kind} · ${(s.charCount || 0).toLocaleString()} characters`}
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                                {s.kind}
                              </span>
                              <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180" />
                            </span>
                          </summary>
                          <div className="border-t border-neutral-200/70 px-3 py-2.5">
                            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                              <Sparkle className="h-3 w-3" />
                              AI summary
                            </div>
                            {s.summary ? (
                              <p className="text-sm leading-relaxed text-neutral-700">{s.summary}</p>
                            ) : (
                              <p className="text-xs text-neutral-400">
                                No summary yet - re-upload this document to generate one.
                              </p>
                            )}
                          </div>
                        </details>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-xs font-medium text-neutral-500">
                  Assistants answering from this
                </h3>
                {entry.assistants.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    None yet - this knowledge isn&apos;t reaching any caller.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {entry.assistants.map((a) => (
                      <Link
                        key={a.id}
                        href={`/dashboard/assistant/${a.id}`}
                        className="press inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
                      >
                        <Bot className="h-3.5 w-3.5 text-neutral-400" />
                        {a.name}
                        <span className="text-xs text-neutral-400">{languageName(a.language)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        ))
      )}

      {k.unaffiliated.length > 0 && (
        <SectionCard
          title="Assistants without an organization"
          subtitle="These answer only from their own knowledge - they can't see any shared business knowledge."
        >
          <div className="flex flex-wrap gap-2">
            {k.unaffiliated.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard/assistant/${a.id}`}
                className="press inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                <Bot className="h-3.5 w-3.5 text-neutral-400" />
                {a.name}
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="What it can do on a call"
        subtitle="Beyond answering questions, this is what your assistants are wired up to do."
      >
        <div className="flex items-center gap-2 py-1">
          <Calendar className="h-4 w-4 text-neutral-400" />
          <span className="text-sm text-neutral-700">
            {calendars > 0
              ? `Book appointments - ${calendars} calendar${calendars === 1 ? "" : "s"} connected.`
              : "Booking is off - no calendar connected yet."}
          </span>
          <Link
            href="/dashboard/integrations"
            className="ml-auto shrink-0 text-xs font-medium text-neutral-900 underline underline-offset-2"
          >
            {calendars > 0 ? "Manage" : "Connect one"}
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
