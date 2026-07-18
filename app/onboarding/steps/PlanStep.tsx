"use client";

import { useState } from "react";
import { PLANS, annualAmountCents, type BillingCycle } from "@/lib/plans";
import { useT } from "@/lib/i18n/client";
import { Check, Spinner } from "@/app/dashboard/icons";

const eur = (cents: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export function PlanStep() {
  const t = useT();
  const o = t.onboarding;
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(planId: string) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: planId, cycle, context: "onboarding" }),
      });
      if (res.status === 401) {
        window.location.assign(
          `/?auth=login&next=${encodeURIComponent("/onboarding?step=plan")}`,
        );
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || o.checkoutError);
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : o.checkoutError);
      setLoading(null);
    }
  }

  return (
    <section className="rise">
      <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1">
        {(["monthly", "annual"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCycle(c)}
            className={`press rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              cycle === c ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {c === "monthly" ? o.monthly : o.annual}
            {c === "annual" && (
              <span className={`ml-1.5 text-[11px] ${cycle === c ? "text-neutral-300" : "text-emerald-600"}`}>
                {o.save15}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => {
          const monthlyShown =
            cycle === "annual"
              ? Math.round(annualAmountCents(plan.monthlyAmountCents) / 12)
              : plan.monthlyAmountCents;
          const feats = [
            `${plan.limits.minutesIncluded.toLocaleString()} ${o.featMinutes}`,
            `${plan.limits.phoneNumbers} ${o.featNumbers}`,
            `${plan.limits.concurrentCalls} ${o.featConcurrent}`,
            ...plan.features,
          ];
          return (
            <div
              key={plan.id}
              className={`shape-card glass flex flex-col p-6 ${plan.highlight ? "ring-1 ring-neutral-900" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-medium text-neutral-900">{plan.name}</h2>
                <span className="text-xs text-neutral-500">{plan.tagline}</span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-medium tracking-tight text-neutral-900">
                  {eur(monthlyShown)}
                </span>
                <span className="ml-1 text-sm text-neutral-500">{o.perMonth}</span>
                {cycle === "annual" && (
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {eur(annualAmountCents(plan.monthlyAmountCents))} {o.billedAnnually}
                  </p>
                )}
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {feats.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => choose(plan.id)}
                disabled={loading !== null}
                aria-busy={loading === plan.id}
                className="press mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-70"
              >
                {loading === plan.id && <Spinner className="h-4 w-4 animate-spin" />}
                {o.goLive}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-neutral-500">{o.goLiveHint}</p>
    </section>
  );
}
