"use client";

import { useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthDialog } from "./AuthDialog";
import LocaleSwitcher from "./LocaleSwitcher";
import type { LocaleOption } from "@/lib/i18n/marketing/switcher";
import { EN_NAV_HREFS, type NavHrefs } from "@/lib/i18n/marketing/nav";
import type { UiCopy } from "@/content/i18n/_ui-copy";
import { enUi } from "@/content/i18n/en/ui";
import { publicSupabaseEnv } from "@/lib/supabase/config";

const PauseLogo = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="2.5" height="15" rx="1" fill={color} />
    <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill={color} />
  </svg>
);

const ctaStyle: CSSProperties = {
  display: "inline-flex", alignItems: "center", height: "44px", padding: "0 20px",
  background: "#1D1D1D", color: "#fff", border: "1.5px solid #1D1D1D",
  borderRadius: "20px", fontSize: "12px", fontWeight: 400, textDecoration: "none",
  letterSpacing: "0.06em", transition: "all 0.25s", cursor: "pointer",
  fontFamily: "var(--font-inter), Inter, sans-serif", whiteSpace: "nowrap",
};

// Text-only secondary action, shared by Sign in and Log out.
const ghostBtnStyle: CSSProperties = {
  height: "36px", padding: "0 14px", background: "transparent",
  border: "none", color: "#1D1D1D", fontSize: "12px", fontWeight: 400,
  letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap",
  fontFamily: "var(--font-inter), Inter, sans-serif",
};

// localeOptions and nav are computed on the server by the page (both read the
// review manifest) and passed down, so this client component never imports the
// gate. `ui` defaults to English, so every page that has not been localized yet
// keeps rendering exactly as before.
export default function SiteHeader({
  localeOptions = [],
  ui = enUi,
  nav = EN_NAV_HREFS,
}: {
  localeOptions?: LocaleOption[];
  ui?: UiCopy;
  nav?: NavHrefs;
} = {}) {
  const { open } = useAuthDialog();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(() =>
    publicSupabaseEnv() ? null : false,
  );

  async function signOut() {
    setSigningOut(true);
    try {
      // Lazy import keeps Supabase out of the marketing bundle (see the auth
      // effect above); onAuthStateChange flips signedIn back to false.
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (supabase) await supabase.auth.signOut();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // signedIn is already initialized to false when auth is unconfigured; skip
    // loading the Supabase client entirely in that case.
    if (!publicSupabaseEnv()) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    // The Supabase browser client is imported lazily so @supabase/supabase-js
    // never ships in the marketing bundle - only signed-in-state resolution
    // pulls it, after first paint.
    import("@/lib/supabase/client").then(({ createClient }) => {
      if (!active) return; // unmounted before the import resolved
      const supabase = createClient();
      if (!supabase) return;
      // getSession reads from local storage (no network call).
      supabase.auth
        .getSession()
        .then(({ data }) => {
          if (active) setSignedIn(Boolean(data.session));
        })
        .catch(() => {
          if (active) setSignedIn(false);
        });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setSignedIn(Boolean(session?.user));
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return (
    <header className="site-header" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 60,
      height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px",
      background: isScrolled ? "#fff" : "transparent",
      boxShadow: "none",
      transition: "background 0.3s, box-shadow 0.3s",
    }}>
      <style>{`
        @media (max-width: 600px) {
          .site-header { padding-left: 14px !important; padding-right: 14px !important; }
          .site-header-left { gap: 14px !important; }
          .site-header-logo { font-size: 15px !important; }
          .site-header-cta { padding: 0 13px !important; letter-spacing: 0.02em !important; }
          /* Mobile: show only the logo + the CTA so the header always fits. */
          .site-header-pricing { display: none !important; }
          .site-header-signin { display: none !important; }
        }
      `}</style>
      <div className="site-header-left" style={{ display: "flex", alignItems: "center", gap: "22px" }}>
        <Link href={nav.home} style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#1D1D1D" }}>
          <PauseLogo color="#1D1D1D" />
          <span className="site-header-logo" style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 500, fontSize: "18px", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            AI RECEPTIONIST
          </span>
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <LocaleSwitcher options={localeOptions} label={ui.footer.language} />
        <Link
          href={nav.pricing}
          className="site-header-pricing"
          style={{
            color: "#1D1D1D", fontSize: "12px", fontWeight: 400,
            letterSpacing: "0.06em", textDecoration: "none",
            fontFamily: "var(--font-inter), Inter, sans-serif",
          }}
        >
          {ui.nav.pricing}
        </Link>
        {signedIn === null ? null : signedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="site-header-signin"
              style={ghostBtnStyle}
            >
              {ui.nav.logout}
            </button>
            <Link href="/dashboard" className="site-header-cta" style={ctaStyle}>
              {ui.nav.dashboard}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => open("login")}
              className="site-header-signin"
              style={ghostBtnStyle}
            >
              {ui.nav.signIn}
            </button>
            <button
              type="button"
              onClick={() => open("signup", { next: "/onboarding" })}
              className="site-header-cta"
              style={ctaStyle}
            >
              {ui.nav.startNow}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
