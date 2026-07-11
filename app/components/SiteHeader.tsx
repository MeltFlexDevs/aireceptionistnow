"use client";

import { useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";

import { useAuthDialog } from "./AuthDialog";
import { createClient } from "@/lib/supabase/client";
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

export default function SiteHeader() {
  const { open } = useAuthDialog();
  const [isScrolled, setIsScrolled] = useState(false);
  // null until checked, then true/false - avoids flashing the wrong buttons.
  // With no Supabase env there's nothing to check, so start at false directly.
  const [signedIn, setSignedIn] = useState<boolean | null>(() =>
    publicSupabaseEnv() ? null : false,
  );

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return; // signedIn already initialized to false
    let active = true;
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
    return () => {
      active = false;
      sub.subscription.unsubscribe();
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
          .site-header-industries { display: none !important; }
          .site-header-signin { display: none !important; }
        }
      `}</style>
      <div className="site-header-left" style={{ display: "flex", alignItems: "center" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#1D1D1D" }}>
          <PauseLogo color="#1D1D1D" />
          <span className="site-header-logo" style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 500, fontSize: "18px", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            AI RECEPTIONIST
          </span>
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link
          href="/industries"
          className="site-header-industries"
          style={{
            color: "#1D1D1D", fontSize: "12px", fontWeight: 400,
            letterSpacing: "0.06em", textDecoration: "none",
            fontFamily: "var(--font-inter), Inter, sans-serif",
          }}
        >
          INDUSTRIES
        </Link>
        <Link
          href="/pricing"
          className="site-header-pricing"
          style={{
            color: "#1D1D1D", fontSize: "12px", fontWeight: 400,
            letterSpacing: "0.06em", textDecoration: "none",
            fontFamily: "var(--font-inter), Inter, sans-serif",
          }}
        >
          PRICING
        </Link>
        {signedIn === null ? null : signedIn ? (
          <Link href="/dashboard" className="site-header-cta" style={ctaStyle}>
            DASHBOARD
          </Link>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => open("login")}
              className="site-header-signin"
              style={{
                height: "36px", padding: "0 14px", background: "transparent",
                border: "none", color: "#1D1D1D", fontSize: "12px", fontWeight: 400,
                letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap",
                fontFamily: "var(--font-inter), Inter, sans-serif",
              }}
            >
              SIGN IN
            </button>
            <button type="button" onClick={() => open("signup")} className="site-header-cta" style={ctaStyle}>
              START NOW
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
