import { Suspense } from "react";
import Link from "next/link";
import { currentUserId } from "@/lib/auth";
import {
  connectedCalendarCount,
  getAiKnowledge,
  summarizeOrgKnowledgeCached,
  type OrgKnowledge,
} from "@/lib/dashboard/ai-knowledge";
import { readKnowledge } from "@/lib/knowledge/sources";
import { relTimeOf } from "@/lib/dashboard/rel-time";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { PageHeader } from "../components/PageHeader";
import { Skeleton } from "../components/Skeleton";
import { Calendar, Sparkle } from "../icons";
import { TeachBar } from "./TeachBar";
import { SourceList, type SourceRow } from "./SourceList";
import { AiAvatar } from "@/app/(main)/onboarding/AiAvatar";

export const dynamic = "force-dynamic";

const CAP = "md:h-[calc(100dvh-7rem)] md:overflow-hidden lg:h-[calc(100dvh-8rem)]";

// The digest is an LLM call behind a content-keyed cache, so it streams in
// rather than blocking the page.
async function Digest({ entry }: { entry: OrgKnowledge }) {
  const [t, summary] = await Promise.all([getDictionary(), summarizeOrgKnowledgeCached(entry)]);
  return (
    <p className="text-sm leading-relaxed text-neutral-700">{summary || t.knowledge.digestEmpty}</p>
  );
}

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const [{ business }, t, locale] = await Promise.all([searchParams, getDictionary(), getLocale()]);
  const k = t.knowledge;

  const ownerId = await currentUserId();
  const [knowledge, calendars] = await Promise.all([
    getAiKnowledge(ownerId ?? null),
    connectedCalendarCount(ownerId ?? null),
  ]);

  const orgs = knowledge.organizations;
  const active = orgs.find((o) => o.org.id === business) ?? orgs[0] ?? null;
  // "" is a legitimate value: a brand-new account has no business row, and the
  // first teach action creates one rather than asking the user to.
  const orgId = active?.org.id ?? "";
  const stored = readKnowledge(active?.org.knowledge);
  const notes = stored.notes ?? "";
  const rows: SourceRow[] = (stored.sources ?? []).map((s) => ({
    id: s.id,
    kind: s.kind,
    title: s.title,
    added: s.addedAt ? k.sourceAdded.replace("{when}", relTimeOf(s.addedAt, locale)) : "",
    summary: s.summary ?? "",
  }));

  const isEmpty = rows.length === 0 && !notes;

  return (
    <div className={`rise flex flex-col gap-3 ${CAP}`}>
      {/* A: heading, plus the business switcher only when there is more than one */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <PageHeader title={k.title} />
        {orgs.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5" aria-label={k.businessSwitch}>
            {orgs.map((o) => (
              <Link
                key={o.org.id}
                href={`/dashboard/knowledge?business=${o.org.id}`}
                aria-current={o.org.id === orgId ? "true" : undefined}
                className={`press shape-pill border px-3 py-1 text-xs font-medium transition-colors ${
                  o.org.id === orgId
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {o.org.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* B: what it can answer */}
      <div className="shape-card glass shrink-0 p-4">
        <div className="flex items-start gap-3">
          <AiAvatar mood="studying" className="h-10 w-10 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900">{k.digestTitle}</p>
            <div className="mt-1">
              {active ? (
                <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                  <Digest entry={active} />
                </Suspense>
              ) : (
                <p className="text-sm leading-relaxed text-neutral-700">{k.digestEmpty}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* C: teach bar */}
      <TeachBar orgId={orgId} notes={notes} />

      {/* D: the page's only scroll region */}
      {isEmpty ? (
        <div className="shape-card glass flex min-h-0 flex-1 flex-col items-center justify-center p-10 text-center">
          <AiAvatar mood="studying" className="h-20 w-20" />
          <h2 className="mt-4 text-base font-semibold text-neutral-900">{k.emptyTitle}</h2>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-neutral-500">{k.emptyBody}</p>
        </div>
      ) : (
        <section className="shape-card glass flex min-h-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-neutral-200/70 px-5 py-3">
            <h2 className="text-sm font-medium text-neutral-900">{k.sources}</h2>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5">
            <SourceList orgId={orgId} notes={notes} rows={rows} />
          </div>
        </section>
      )}

      {/* E: one-line footer strip */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 px-1 text-xs text-neutral-500">
        <span className="flex items-center gap-2">
          <Sparkle className="h-3.5 w-3.5 text-neutral-400" />
          {knowledge.ownerNotes ? k.aboutYouShared : k.aboutYouNotShared}
          <Link
            href="/dashboard/settings"
            className="font-medium text-neutral-900 underline underline-offset-2"
          >
            {t.common.edit}
          </Link>
        </span>
        <span className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
          {calendars > 0 ? k.bookingOn : k.bookingOff}
          <Link
            href="/dashboard/calendar"
            className="font-medium text-neutral-900 underline underline-offset-2"
          >
            {calendars > 0 ? t.common.manage : t.common.connect}
          </Link>
        </span>
      </div>
    </div>
  );
}
