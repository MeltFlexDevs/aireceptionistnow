import { Suspense } from "react";
import Link from "next/link";
import { currentUserId } from "@/lib/auth";
import {
  connectedCalendarCount,
  getAiKnowledge,
  summarizeOrgKnowledgeCached,
  type OrgKnowledge,
} from "@/lib/dashboard/ai-knowledge";
import { formatVerifiedLines, readKnowledge } from "@/lib/knowledge/sources";
import { relTimeOf } from "@/lib/dashboard/rel-time";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { PageHeader } from "../components/PageHeader";
import { Skeleton } from "../components/Skeleton";
import { Calendar, Sparkle } from "../icons";
import { CARD, CARD_INTERACTIVE, SECTION_HEADING } from "../components/card";
import { SetupBadge } from "../components/StatusBadge";
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
  const verified = formatVerifiedLines(stored.verified ?? []);
  const rows: SourceRow[] = (stored.sources ?? []).map((s) => ({
    id: s.id,
    kind: s.kind,
    title: s.title,
    added: s.addedAt ? k.sourceAdded.replace("{when}", relTimeOf(s.addedAt, locale)) : "",
    summary: s.summary ?? "",
  }));

  const isEmpty = rows.length === 0 && !notes && !verified;

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

      <h2 className={`${SECTION_HEADING} shrink-0`}>{k.groupKnows}</h2>

      {/* B: what it can answer */}
      <div className={`${CARD} shrink-0 p-5`}>
        <div className="flex items-start gap-4">
          <AiAvatar mood="studying" className="h-12 w-12 shrink-0" />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-neutral-900">{k.digestTitle}</p>
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
      <TeachBar orgId={orgId} notes={notes} verified={verified} />

      {/* D: the page's only scroll region */}
      {isEmpty ? (
        <div className={`${CARD} flex min-h-0 flex-1 flex-col items-center justify-center p-10 text-center`}>
          <AiAvatar mood="studying" className="h-20 w-20" />
          <h2 className="mt-4 text-base font-semibold text-neutral-900">{k.emptyTitle}</h2>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-neutral-500">{k.emptyBody}</p>
        </div>
      ) : (
        <section className={`${CARD} flex min-h-0 flex-1 flex-col`}>
          <header className="shrink-0 border-b border-neutral-200/70 px-5 py-3">
            <h2 className="text-sm font-medium text-neutral-900">{k.sources}</h2>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5">
            <SourceList orgId={orgId} notes={notes} verified={verified} rows={rows} />
          </div>
        </section>
      )}

      {/* E: the two things feeding the receptionist from OUTSIDE this page.
          These were a 12px footer strip, which is where information goes to be
          ignored - both are configuration state, so they now read the same way
          as the assistant page's setup cards. Kept at p-4 and shrink-0: this
          page is height-capped and the source list above is the only thing
          allowed to grow. */}
      <div className="shrink-0">
        <h2 className={SECTION_HEADING}>{k.groupUses}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/dashboard/settings" className={`${CARD_INTERACTIVE} group flex items-center gap-4 p-4`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-neutral-200">
              <Sparkle className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-neutral-900">{k.aboutYouTitle}</span>
              <span className="mt-0.5 block truncate text-[13px] text-neutral-500">
                {knowledge.ownerNotes ? k.aboutYouShared : k.aboutYouNotShared}
              </span>
            </span>
            <SetupBadge
              done={Boolean(knowledge.ownerNotes)}
              label={knowledge.ownerNotes ? t.common.connected : t.common.edit}
            />
          </Link>

          <Link href="/dashboard/calendar" className={`${CARD_INTERACTIVE} group flex items-center gap-4 p-4`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 transition-colors group-hover:bg-neutral-200">
              <Calendar className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-neutral-900">{k.bookingTitle}</span>
              <span className="mt-0.5 block truncate text-[13px] text-neutral-500">
                {calendars > 0 ? k.bookingOn : k.bookingOff}
              </span>
            </span>
            <SetupBadge
              done={calendars > 0}
              label={calendars > 0 ? t.common.connected : t.common.connect}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
