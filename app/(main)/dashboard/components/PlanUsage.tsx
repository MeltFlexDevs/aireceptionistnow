import Link from "next/link";
import { billingPanelMode, billingPeriodLine } from "@/lib/dashboard/billing-panel";
import type { PlanContext } from "@/lib/dashboard/plan";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { plural, type PluralForms } from "@/lib/i18n/plural";
import { localizedHref } from "@/lib/i18n/marketing/href";

interface Props {
  ctx: PlanContext;
  /** Display zone for the renewal date (displayTimezone). */
  tz: string;
}

function fmtLimit(n: number): string {
  return Number.isFinite(n) ? String(n) : "∞";
}

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const finite = Number.isFinite(limit);
  const pct = finite && limit > 0 ? Math.min((used / limit) * 100, 100) : used > 0 ? 100 : 0;
  const atLimit = finite && used >= limit;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="font-medium text-neutral-900">
          {used}
          <span className="text-neutral-500"> / {fmtLimit(limit)}</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full ${atLimit ? "bg-neutral-900" : "bg-neutral-700"}`}
          style={{ width: `${finite ? pct : 12}%` }}
        />
      </div>
    </div>
  );
}

export async function PlanUsage({ ctx, tz }: Props) {
  const s = (await getDictionary()).settings;
  const locale = await getLocale();
  const mode = billingPanelMode(ctx);
  // A store plan is changed on the phone; Stripe checkout refuses it (409).
  const store = mode === "store-apple" || mode === "store-google";
  const showUpgrade = !store && (!ctx.active || !ctx.canAddNumber);
  const period = mode === "stripe" ? billingPeriodLine(ctx.billing, s, locale, tz) : "";
  const fill = (tpl: string, n: string) => tpl.replace("{n}", n);
  // A real number picks its plural form; an unlimited limit keeps today's "∞" text.
  const count = (forms: PluralForms, n: number) =>
    Number.isFinite(n) ? plural(locale, n, forms) : fill(forms.other, "∞");

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-neutral-900">{s.plan}</h2>
            <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
              {ctx.planId ? ctx.planName : s.noPlan}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">
            {ctx.active ? s.planActive : s.planInactive}
          </p>
          {period && <p className="mt-0.5 text-xs text-neutral-500">{period}</p>}
        </div>
        {showUpgrade && (
          <Link
            href={localizedHref(locale, "pricing")}
            className="inline-flex h-8 shrink-0 items-center rounded-lg bg-neutral-900 px-3 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
          >
            {ctx.active ? s.upgrade : s.choosePlan}
          </Link>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Meter label={s.meterNumbers} used={ctx.usage.numbers} limit={ctx.limits.phoneNumbers} />
        {/* "Assistants" was the old label; the persona is one receptionist. */}
        <Meter
          label={s.meterReceptionists}
          used={ctx.usage.assistants}
          limit={ctx.limits.assistants}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span>{count(s.limitConcurrent, ctx.limits.concurrentCalls)}</span>
        <span>{fill(s.limitMinutes, ctx.limits.minutesIncluded.toLocaleString(locale))}</span>
        <span>{count(s.limitContacts, ctx.limits.contacts)}</span>
        <span>{count(s.limitUsers, ctx.limits.users)}</span>
      </div>
    </div>
  );
}
