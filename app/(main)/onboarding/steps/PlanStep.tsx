"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { PLANS, annualAmountCents, type BillingCycle } from "@/lib/plans";
import { NUMBER_COUNTRIES } from "@/lib/number-pricing";
import { useT } from "@/lib/i18n/client";
import { Check, Spinner } from "@/app/(main)/dashboard/icons";
import { setNumberCountryAction } from "../actions";

const eur = (cents: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export function PlanStep({
  country: initialCountry,
  assistantName,
  companyName,
}: {
  country: string;
  assistantName: string;
  companyName: string;
}) {
  const t = useT();
  const o = t.onboarding;
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState(initialCountry || NUMBER_COUNTRIES[0].code);
  // Unticked by default: a pre-ticked box is not valid consent, and /api/checkout
  // rejects the request without it anyway.
  const [accepted, setAccepted] = useState(false);
  const termsId = useId();

  const name = assistantName.trim();
  const company = companyName.trim();

  function changeCountry(next: string) {
    setCountry(next);
    // Persist optimistically so the choice sticks across a return trip; checkout
    // re-persists it as the authoritative write right before payment.
    void setNumberCountryAction(next);
  }

  async function choose(planId: string) {
    if (!accepted) {
      setError(o.termsRequired);
      return;
    }
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          cycle,
          country,
          context: "onboarding",
          acceptedTerms: true,
        }),
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
      {/* Review before you pay: everything they configured, with the number
          country editable right here (the number is generated from it). */}
      <div className="shape-card glass mb-4 p-4 sm:p-5">
        <h2 className="text-sm font-medium text-neutral-700">{o.setupSummaryTitle}</h2>
        {(company || name) && (
          <dl className="mt-3 space-y-2.5 text-sm">
            {company && (
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-neutral-500">{o.summaryCompany}</dt>
                <dd className="truncate font-medium text-neutral-900">{company}</dd>
              </div>
            )}
            {name && (
              <div className="flex items-center justify-between gap-3">
                <dt className="shrink-0 text-neutral-500">{o.summaryAssistant}</dt>
                <dd className="truncate font-medium text-neutral-900">{name}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="mt-4">
          <label htmlFor="onb-number-country" className="mb-1.5 block text-sm text-neutral-500">
            {o.summaryNumberCountry}
          </label>
          <div className="relative">
            <select
              id="onb-number-country"
              value={country}
              onChange={(e) => changeCountry(e.target.value)}
              className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-2.5 pl-3.5 pr-9 text-base text-neutral-900 outline-none transition-colors hover:border-neutral-300 focus:border-neutral-900 sm:text-sm"
            >
              {NUMBER_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag}  {c.name}
                </option>
              ))}
            </select>
            <Chevron className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          </div>
          <p className="mt-1.5 text-xs text-neutral-400">{o.numberChangeHint}</p>
        </div>
      </div>

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

      {/* Consent sits above the plan cards, not under them: it has to be read
          before the commitment, and on mobile anything below the second card is
          off-screen. */}
      <div className="mt-4">
        <label
          htmlFor={termsId}
          className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-neutral-600"
        >
          <input
            id={termsId}
            type="checkbox"
            checked={accepted}
            onChange={(e) => {
              setAccepted(e.target.checked);
              if (e.target.checked) setError(null);
            }}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-300 accent-neutral-900"
          />
          <span>
            {o.termsAgreePrefix}{" "}
            <Link
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
            >
              {o.termsLink}
            </Link>{" "}
            {o.termsAnd}{" "}
            <Link
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
            >
              {o.privacyLink}
            </Link>
            {o.termsAgreeSuffix}
          </span>
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
              className={`shape-card glass flex flex-col p-5 ${plan.highlight ? "ring-1 ring-neutral-900" : ""}`}
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
                disabled={loading !== null || !accepted}
                aria-busy={loading === plan.id}
                title={!accepted ? o.termsRequired : undefined}
                className="press mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
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

function Chevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
