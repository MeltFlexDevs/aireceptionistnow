import Link from "next/link";
import type { PlanContext } from "@/lib/dashboard/plan";
import { getDictionary } from "@/lib/i18n/server";

interface Props {
  ctx: PlanContext;
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
          <span className="text-neutral-400"> / {fmtLimit(limit)}</span>
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

export async function PlanUsage({ ctx }: Props) {
  const s = (await getDictionary()).settings;
  const showUpgrade = !ctx.active || !ctx.canAddNumber;
  const fill = (tpl: string, n: string) => tpl.replace("{n}", n);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-neutral-900">{s.plan}</h2>
            <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
              {ctx.planName}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">
            {ctx.active ? s.planActive : s.planInactive}
          </p>
        </div>
        {showUpgrade && (
          <Link
            href="/pricing"
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
        <span>{fill(s.limitConcurrent, fmtLimit(ctx.limits.concurrentCalls))}</span>
        <span>{fill(s.limitMinutes, ctx.limits.minutesIncluded.toLocaleString())}</span>
        <span>{fill(s.limitContacts, ctx.limits.contacts.toLocaleString())}</span>
        <span>
          {ctx.limits.users === 1 ? s.limitUsersOne : fill(s.limitUsers, fmtLimit(ctx.limits.users))}
        </span>
      </div>
    </div>
  );
}
