import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import {
  Bot,
  Building,
  Calendar,
  ChartBar,
  Gear,
  Grid,
  Hash,
  Phone,
  Plug,
  Sparkle,
} from "../icons";
import { QUICK_START_HREFS, SECTIONS, whereOf, type IconKey } from "./guide";

// The full tutorial: what every screen is for, what you can do on it, and the
// thing that catches people out. Reached from the profile menu. Structure lives
// in guide.ts, copy in the `tutorial` dictionary group - this file only renders.

export const dynamic = "force-dynamic";

const ICONS: Record<IconKey, (p: { className?: string }) => React.ReactElement> = {
  grid: Grid,
  phone: Phone,
  calendar: Calendar,
  chart: ChartBar,
  building: Building,
  bot: Bot,
  hash: Hash,
  plug: Plug,
  sparkle: Sparkle,
  gear: Gear,
};

export default async function TutorialPage() {
  const t = await getDictionary();
  const g = t.tutorial;

  return (
    <div className="space-y-6 rise">
      <PageHeader title={g.title} description={g.description} />

      {/* ── Start here ──────────────────────────────────────────────────── */}
      <SectionCard title={g.startHere} subtitle={g.startHereSub}>
        <ol className="space-y-3">
          {g.quickStart.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={QUICK_START_HREFS[i] ?? "/dashboard"}
                  className="text-sm font-medium text-neutral-900 underline-offset-2 hover:underline"
                >
                  {step.title}
                </Link>
                <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>

      {/* ── Jump to a screen ────────────────────────────────────────────── */}
      <SectionCard title={g.everyScreen} subtitle={g.everyScreenSub}>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => {
            const Icon = ICONS[s.icon];
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="press inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <Icon className="h-3.5 w-3.5 text-neutral-400" />
                {t.nav[s.navKey]}
              </a>
            );
          })}
        </div>
      </SectionCard>

      {/* ── One card per screen ─────────────────────────────────────────── */}
      {SECTIONS.map((s) => {
        const Icon = ICONS[s.icon];
        const copy = g.sections[s.id];
        return (
          // scroll-mt keeps the anchored heading clear of the sticky topbar.
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <SectionCard>
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-medium text-neutral-900">{t.nav[s.navKey]}</h2>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                      {whereOf(s, t)}
                    </span>
                    {s.readOnly && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                        {g.readOnly}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{copy.purpose}</p>
                </div>
                <Link
                  href={s.href}
                  className="press hidden h-8 shrink-0 items-center rounded-lg border border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 sm:inline-flex"
                >
                  {g.open}
                </Link>
              </div>

              <div className="mt-4 space-y-4 sm:pl-12">
                <div>
                  <h3 className="mb-1.5 text-xs font-medium text-neutral-500">{g.whatYouCanDo}</h3>
                  <ul className="space-y-1.5">
                    {copy.can.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-neutral-700">
                        <span
                          aria-hidden
                          className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-neutral-300"
                        />
                        <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {copy.gotcha && (
                  <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-3.5 py-3">
                    <h3 className="text-xs font-medium text-amber-900">{g.goodToKnow}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-800">{copy.gotcha}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </section>
        );
      })}

      <p className="px-1 pb-2 text-center text-xs text-neutral-400">
        {g.footer}{" "}
        <Link href="/dashboard/calls" className="font-medium text-neutral-500 underline underline-offset-2">
          {g.footerLink}
        </Link>{" "}
        {g.footerEnd}
      </p>
    </div>
  );
}
