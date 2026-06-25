"use client";

import { useEffect, useState } from "react";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuthDialog } from "../components/AuthDialog";
import { createClient } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/billing-client";
import {
  PLANS,
  ANNUAL_DISCOUNT,
  annualAmountCents,
  type BillingCycle,
  type Plan,
} from "@/lib/plans";

const eur = (cents: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: Number.isInteger(cents / 100) ? 0 : 2,
  }).format(cents / 100);

const eur2 = (cents: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(cents / 100);

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PlanCard({
  plan,
  cycle,
  busy,
  onSelect,
}: {
  plan: Plan;
  cycle: BillingCycle;
  busy: boolean;
  onSelect: (plan: Plan) => void;
}) {
  const annualTotal = annualAmountCents(plan.monthlyAmountCents);
  const perMonth =
    cycle === "annual"
      ? Math.round(annualTotal / 12)
      : plan.monthlyAmountCents;

  return (
    <div
      className="flex w-full max-w-[420px] flex-col rounded-2xl border bg-white p-8 text-left"
      style={{
        borderColor: plan.highlight ? "#000" : "rgba(0,0,0,0.10)",
        boxShadow: plan.highlight ? "0 18px 50px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium tracking-tight text-neutral-900">
          {plan.name}
        </h3>
        {plan.highlight ? (
          <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white">
            Most popular
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[13px] text-neutral-500">{plan.tagline}</p>

      <div className="mt-6 flex items-end gap-1.5">
        <span className="text-4xl font-semibold tracking-tight text-neutral-900">
          {eur(perMonth)}
        </span>
        <span className="mb-1.5 text-sm text-neutral-500">/ month</span>
      </div>
      <p className="mt-1 h-4 text-[12px] text-neutral-400">
        {cycle === "annual"
          ? `${eur2(annualTotal)} billed yearly`
          : "billed monthly"}
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => onSelect(plan)}
        className="mt-6 w-full rounded-full px-4 py-3 text-[13px] font-medium uppercase tracking-[0.06em] transition disabled:opacity-60"
        style={
          plan.highlight
            ? { background: "#000", color: "#fff" }
            : {
                background: "#fff",
                color: "#000",
                border: "1.5px solid #000",
              }
        }
      >
        {busy ? "Starting…" : "Start now"}
      </button>

      <div className="mt-8">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Included
        </p>
        <ul className="flex flex-col gap-2.5">
          {plan.included.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-[13px] text-neutral-700"
            >
              <span className="mt-0.5 text-neutral-900">
                <CheckIcon />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-neutral-100 pt-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Features
        </p>
        <ul className="flex flex-col gap-2.5">
          {plan.features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-[13px] text-neutral-700"
            >
              <span className="mt-0.5 text-neutral-900">
                <CheckIcon />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PricingClient() {
  const { open } = useAuthDialog();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const beginCheckout = async (planId: string, c: BillingCycle) => {
    setError(null);
    setBusyPlan(planId);
    try {
      await startCheckout(planId, c);
      // On success the browser navigates to Stripe; this only runs on failure.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setBusyPlan(null);
    }
  };

  // If we were sent back here after signing in (?plan=&cycle=), resume checkout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planId = params.get("plan");
    const c = params.get("cycle");
    if (!planId) return;
    const resumeCycle: BillingCycle = c === "annual" ? "annual" : "monthly";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCycle(resumeCycle);
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Clean the URL so a refresh doesn't re-trigger checkout.
        window.history.replaceState({}, "", "/pricing");
        void beginCheckout(planId, resumeCycle);
      }
    });
  }, []);

  const handleSelect = async (plan: Plan) => {
    const supabase = createClient();
    const session = supabase ? (await supabase.auth.getSession()).data.session : null;
    if (session) {
      await beginCheckout(plan.id, cycle);
    } else {
      // Sign in first, then come back here and resume checkout automatically.
      open("signup", {
        description: `Create your account to start the ${plan.name} plan.`,
        next: `/pricing?plan=${plan.id}&cycle=${cycle}`,
      });
    }
  };

  const annualPct = Math.round(ANNUAL_DISCOUNT * 100);

  return (
    <>
      <SiteHeader />
      <main className="bg-white pb-24 pt-32">
        <section className="mx-auto max-w-[960px] px-6 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-[12px] text-neutral-600">
            <CheckIcon />
            30-day money-back guarantee
          </p>
          <h1 className="text-4xl font-medium tracking-tight text-neutral-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-[520px] text-[15px] text-neutral-500">
            Pick a plan and your AI receptionist is answering calls in minutes.
            Cancel anytime.
          </p>

          {/* Billing cycle toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className="rounded-full px-5 py-2 text-[13px] font-medium transition"
              style={
                cycle === "monthly"
                  ? { background: "#000", color: "#fff" }
                  : { background: "transparent", color: "#444" }
              }
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle("annual")}
              className="flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition"
              style={
                cycle === "annual"
                  ? { background: "#000", color: "#fff" }
                  : { background: "transparent", color: "#444" }
              }
            >
              Annually
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                style={
                  cycle === "annual"
                    ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                    : { background: "#000", color: "#fff" }
                }
              >
                −{annualPct}%
              </span>
            </button>
          </div>

          {error ? (
            <p className="mx-auto mt-6 max-w-[520px] rounded-lg bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
              {error}
            </p>
          ) : null}

          {/* Plans */}
          <div className="mt-12 flex flex-wrap items-stretch justify-center gap-6">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                cycle={cycle}
                busy={busyPlan === plan.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <p className="mt-10 text-[13px] text-neutral-400">
            Prices in EUR, excl. VAT. Extra minutes billed at €0.09/min.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
