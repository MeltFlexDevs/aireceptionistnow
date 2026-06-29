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

const FONT = "var(--font-inter), Inter, sans-serif";

const sectionLabel: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: "11px",
  fontWeight: 400,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#aaa",
  margin: "0 0 14px",
};

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        fontSize: "13px",
        fontWeight: 300,
        color: "#555",
        lineHeight: 1.5,
      }}
    >
      <span style={{ marginTop: "2px", color: "#111", flexShrink: 0 }}>
        <CheckIcon />
      </span>
      {children}
    </li>
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
      style={{
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "420px",
        background: "#fff",
        border: `1px solid ${plan.highlight ? "#111" : "#e8e8e8"}`,
        borderRadius: "16px",
        padding: "32px",
        textAlign: "left",
        boxShadow: plan.highlight ? "0 18px 50px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 500, letterSpacing: "-0.01em", color: "#111", margin: 0 }}>
          {plan.name}
        </h3>
        {plan.highlight ? (
          <span
            style={{
              background: "#000",
              color: "#fff",
              borderRadius: "20px",
              padding: "4px 11px",
              fontSize: "10px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Most popular
          </span>
        ) : null}
      </div>
      <p style={{ marginTop: "6px", fontSize: "13px", fontWeight: 300, color: "#888" }}>{plan.tagline}</p>

      <div style={{ marginTop: "24px", display: "flex", alignItems: "flex-end", gap: "6px" }}>
        <span style={{ fontSize: "46px", fontWeight: 300, letterSpacing: "-0.03em", color: "#111", lineHeight: 1 }}>
          {eur(perMonth)}
        </span>
        <span style={{ marginBottom: "5px", fontSize: "14px", fontWeight: 300, color: "#888" }}>/ month</span>
      </div>
      <p style={{ marginTop: "8px", height: "16px", fontSize: "12px", fontWeight: 300, color: "#aaa" }}>
        {cycle === "annual"
          ? `${eur2(annualTotal)} billed yearly`
          : "billed monthly"}
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => onSelect(plan)}
        style={{
          marginTop: "24px",
          width: "100%",
          borderRadius: "23px",
          padding: "13px 20px",
          fontFamily: FONT,
          fontSize: "14px",
          fontWeight: 400,
          letterSpacing: "0.01em",
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.6 : 1,
          transition: "opacity 0.2s",
          ...(plan.highlight
            ? { background: "#000", color: "#fff", border: "1px solid #000" }
            : { background: "#fff", color: "#111", border: "1px solid #111" }),
        }}
        onMouseOver={(e) => { if (!busy) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
        onMouseOut={(e) => { if (!busy) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      >
        {busy ? "Starting…" : "Start now"}
      </button>

      <div style={{ marginTop: "32px" }}>
        <p style={sectionLabel}>Included</p>
        <ul style={{ display: "flex", flexDirection: "column", gap: "10px", margin: 0, padding: 0, listStyle: "none" }}>
          {plan.included.map((f) => (
            <FeatureItem key={f}>{f}</FeatureItem>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "24px", borderTop: "1px solid #f0f0f0", paddingTop: "24px" }}>
        <p style={sectionLabel}>Features</p>
        <ul style={{ display: "flex", flexDirection: "column", gap: "10px", margin: 0, padding: 0, listStyle: "none" }}>
          {plan.features.map((f) => (
            <FeatureItem key={f}>{f}</FeatureItem>
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
      <main style={{ fontFamily: FONT, fontWeight: 300, background: "#fff", color: "#333", paddingTop: "150px", paddingBottom: "100px" }}>
        <section style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
              borderRadius: "20px",
              border: "1px solid #e8e8e8",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 300,
              color: "#888",
            }}
          >
            <span style={{ color: "#111", display: "flex" }}><CheckIcon /></span>
            30-day money-back guarantee
          </p>
          <h1
            style={{
              fontFamily: FONT,
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 300,
              letterSpacing: "-0.025em",
              textTransform: "uppercase",
              lineHeight: 1.08,
              color: "#111",
              margin: 0,
            }}
          >
            Simple, transparent pricing
          </h1>
          <p style={{ maxWidth: "520px", margin: "16px auto 0", fontSize: "15px", fontWeight: 300, color: "#888", lineHeight: 1.6 }}>
            Pick a plan and your AI receptionist is answering calls in minutes.
            Cancel anytime.
          </p>

          {/* Billing cycle toggle */}
          <div
            style={{
              marginTop: "32px",
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "23px",
              border: "1px solid #e8e8e8",
              background: "#f8f8f8",
              padding: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              style={{
                borderRadius: "20px",
                border: "none",
                padding: "9px 20px",
                fontFamily: FONT,
                fontSize: "13px",
                fontWeight: 400,
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                ...(cycle === "monthly"
                  ? { background: "#000", color: "#fff" }
                  : { background: "transparent", color: "#555" }),
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setCycle("annual")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "20px",
                border: "none",
                padding: "9px 20px",
                fontFamily: FONT,
                fontSize: "13px",
                fontWeight: 400,
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                ...(cycle === "annual"
                  ? { background: "#000", color: "#fff" }
                  : { background: "transparent", color: "#555" }),
              }}
            >
              Annually
              <span
                style={{
                  borderRadius: "20px",
                  padding: "2px 7px",
                  fontSize: "10px",
                  fontWeight: 500,
                  ...(cycle === "annual"
                    ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                    : { background: "#000", color: "#fff" }),
                }}
              >
                −{annualPct}%
              </span>
            </button>
          </div>

          {error ? (
            <p
              style={{
                maxWidth: "520px",
                margin: "24px auto 0",
                borderRadius: "10px",
                background: "#fef2f2",
                padding: "10px 16px",
                fontSize: "13px",
                fontWeight: 300,
                color: "#dc2626",
              }}
            >
              {error}
            </p>
          ) : null}

          {/* Plans */}
          <div style={{ marginTop: "48px", display: "flex", flexWrap: "wrap", alignItems: "stretch", justifyContent: "center", gap: "24px" }}>
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

          <p style={{ marginTop: "40px", fontSize: "13px", fontWeight: 300, color: "#aaa" }}>
            Prices in EUR, excl. VAT. Extra minutes billed at €0.09/min.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
