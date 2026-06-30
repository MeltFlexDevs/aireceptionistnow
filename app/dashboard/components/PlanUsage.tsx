import Link from "next/link";
import type { PlanContext } from "@/lib/dashboard/plan";

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
        <span className={`font-medium ${atLimit ? "text-neutral-900" : "text-neutral-900"}`}>
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

export function PlanUsage({ ctx }: Props) {
  const showUpgrade = !ctx.active || !ctx.canAddNumber;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-neutral-900">Plan</h2>
            <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white">
              {ctx.planName}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">
            {ctx.active
              ? "Active subscription"
              : "No active subscription. Entry tier limits apply."}
          </p>
        </div>
        {showUpgrade && (
          <Link
            href="/pricing"
            className="inline-flex h-8 shrink-0 items-center rounded-lg bg-neutral-900 px-3 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
          >
            {ctx.active ? "Upgrade" : "Choose a plan"}
          </Link>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Meter label="Phone numbers" used={ctx.usage.numbers} limit={ctx.limits.phoneNumbers} />
        <Meter label="Assistants" used={ctx.usage.assistants} limit={ctx.limits.assistants} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span>{fmtLimit(ctx.limits.concurrentCalls)} concurrent calls</span>
        <span>{ctx.limits.minutesIncluded.toLocaleString()} min included</span>
        <span>{ctx.limits.contacts.toLocaleString()} contacts</span>
        <span>{fmtLimit(ctx.limits.users)} user{ctx.limits.users === 1 ? "" : "s"}</span>
      </div>
    </section>
  );
}
