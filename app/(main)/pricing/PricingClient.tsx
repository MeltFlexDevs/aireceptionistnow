"use client";

import { useEffect, useState } from "react";

import SiteHeader from "@/app/components/SiteHeader";
import type { LocaleOption } from "@/lib/i18n/marketing/switcher";
import { EN_NAV_HREFS, type NavHrefs } from "@/lib/i18n/marketing/nav";
import type { PricingCopy } from "@/content/i18n/_pricing-copy";
import type { UiCopy } from "@/content/i18n/_ui-copy";
import { enPricing } from "@/content/i18n/en/pages/pricing";
import { enUi } from "@/content/i18n/en/ui";
import SiteFooter from "@/app/components/SiteFooter";
import { useAuthDialog } from "@/app/components/AuthDialog";
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
        fontSize: "14px",
        fontWeight: 300,
        color: "#555",
        lineHeight: 1.5,
      }}
    >
      <span style={{ marginTop: "2px", color: "#1D1D1D", flexShrink: 0 }}>
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
  copy,
}: {
  plan: Plan;
  cycle: BillingCycle;
  busy: boolean;
  onSelect: (plan: Plan) => void;
  copy: PricingCopy;
}) {
  // Display text per plan comes from the copy object; prices and ids stay
  // in lib/plans.ts. Falls back to the English plan data if a translation
  // is missing a plan, so a new plan never renders blank.
  const planCopy = copy.plans[plan.id] ?? {
    name: plan.name,
    tagline: plan.tagline,
    included: plan.included,
    features: plan.features,
  };
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
        border: `1px solid ${plan.highlight ? "#1D1D1D" : "#e8e8e8"}`,
        borderRadius: "16px",
        padding: "32px",
        textAlign: "left",
        boxShadow: plan.highlight ? "0 18px 50px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 500, letterSpacing: "-0.01em", color: "#1D1D1D", margin: 0 }}>
          {planCopy.name}
        </h2>
        {plan.highlight ? (
          <span
            style={{
              background: "#1D1D1D",
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
      <p style={{ marginTop: "6px", fontSize: "14px", fontWeight: 300, color: "#888" }}>{planCopy.tagline}</p>

      <div style={{ marginTop: "24px", display: "flex", alignItems: "flex-end", gap: "6px" }}>
        <span style={{ fontSize: "46px", fontWeight: 300, letterSpacing: "-0.03em", color: "#1D1D1D", lineHeight: 1 }}>
          {eur(perMonth)}
        </span>
        <span style={{ marginBottom: "5px", fontSize: "14px", fontWeight: 300, color: "#888" }}>{copy.perMonth}</span>
      </div>
      <p style={{ marginTop: "8px", height: "16px", fontSize: "12px", fontWeight: 300, color: "#aaa" }}>
        {cycle === "annual"
          ? copy.billedYearlyTemplate.replace("{total}", eur2(annualTotal))
          : copy.billedMonthly}
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
            ? { background: "#1D1D1D", color: "#fff", border: "1px solid #1D1D1D" }
            : { background: "#fff", color: "#1D1D1D", border: "1px solid #1D1D1D" }),
        }}
        onMouseOver={(e) => { if (!busy) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
        onMouseOut={(e) => { if (!busy) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      >
        {busy ? copy.ctaBusy : copy.cta}
      </button>

      <div style={{ marginTop: "32px" }}>
        <p style={sectionLabel}>{copy.includedLabel}</p>
        <ul style={{ display: "flex", flexDirection: "column", gap: "10px", margin: 0, padding: 0, listStyle: "none" }}>
          {planCopy.included.map((f) => (
            <FeatureItem key={f}>{f}</FeatureItem>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "24px", borderTop: "1px solid #f0f0f0", paddingTop: "24px" }}>
        <p style={sectionLabel}>{copy.featuresLabel}</p>
        <ul style={{ display: "flex", flexDirection: "column", gap: "10px", margin: 0, padding: 0, listStyle: "none" }}>
          {planCopy.features.map((f) => (
            <FeatureItem key={f}>{f}</FeatureItem>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PricingClient({ localeOptions = [], copy = enPricing, ui = enUi, nav = EN_NAV_HREFS }: { localeOptions?: LocaleOption[]; copy?: PricingCopy; ui?: UiCopy; nav?: NavHrefs } = {}) {
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
      setError(err instanceof Error ? err.message : copy.checkoutError);
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
    // Only visitors returning from auth with a ?plan= param reach here, so the
    // Supabase client is loaded lazily rather than shipped on every pricing view.
    void import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      if (!supabase) return;
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          // Clean the URL so a refresh doesn't re-trigger checkout.
          window.history.replaceState({}, "", "/pricing");
          void beginCheckout(planId, resumeCycle);
        }
      });
    });
  }, []);

  const handleSelect = async (plan: Plan) => {
    const { createClient } = await import("@/lib/supabase/client");
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
      <SiteHeader localeOptions={localeOptions} ui={ui} nav={nav} />
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
            <span style={{ color: "#1D1D1D", display: "flex" }}><CheckIcon /></span>
            {copy.guarantee}
          </p>
          <h1
            style={{
              fontFamily: FONT,
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 300,
              letterSpacing: "-0.025em",
              textTransform: "uppercase",
              lineHeight: 1.08,
              color: "#1D1D1D",
              margin: 0,
            }}
          >
            {copy.h1}
          </h1>
          <p style={{ maxWidth: "520px", margin: "16px auto 0", fontSize: "15px", fontWeight: 300, color: "#888", lineHeight: 1.6 }}>
            {copy.sub}
          </p>

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
                minHeight: 44,
                fontFamily: FONT,
                fontSize: "13px",
                fontWeight: 400,
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                ...(cycle === "monthly"
                  ? { background: "#1D1D1D", color: "#fff" }
                  : { background: "transparent", color: "#555" }),
              }}
            >
              {copy.monthly}
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
                minHeight: 44,
                fontFamily: FONT,
                fontSize: "13px",
                fontWeight: 400,
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                ...(cycle === "annual"
                  ? { background: "#1D1D1D", color: "#fff" }
                  : { background: "transparent", color: "#555" }),
              }}
            >
              {copy.annually}
              <span
                style={{
                  borderRadius: "20px",
                  padding: "2px 7px",
                  fontSize: "10px",
                  fontWeight: 500,
                  ...(cycle === "annual"
                    ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                    : { background: "#1D1D1D", color: "#fff" }),
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

          <div style={{ marginTop: "48px", display: "flex", flexWrap: "wrap", alignItems: "stretch", justifyContent: "center", gap: "24px" }}>
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                cycle={cycle}
                busy={busyPlan === plan.id}
                onSelect={handleSelect}
                copy={copy}
              />
            ))}
          </div>

          <p style={{ marginTop: "40px", fontSize: "13px", fontWeight: 300, color: "#aaa" }}>
            {copy.vatNote}
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
