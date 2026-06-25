"use client";

import { useState, useEffect, type CSSProperties } from "react";

import { useAuthDialog } from "./AuthDialog";
import { createClient } from "@/lib/supabase/client";

const PauseLogo = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="2.5" height="15" rx="1" fill={color} />
    <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill={color} />
  </svg>
);

const ctaStyle: CSSProperties = {
  display: "inline-flex", alignItems: "center", height: "36px", padding: "0 20px",
  background: "#000", color: "#fff", border: "1.5px solid #000",
  borderRadius: "20px", fontSize: "12px", fontWeight: 400, textDecoration: "none",
  letterSpacing: "0.06em", transition: "all 0.25s", cursor: "pointer",
  fontFamily: "var(--font-inter), Inter, sans-serif",
};

export default function SiteHeader() {
  const { open } = useAuthDialog();
  const [isScrolled, setIsScrolled] = useState(false);
  // null until checked, then true/false — avoids flashing the wrong buttons.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setSignedIn(false);
      return;
    }
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
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 60,
      height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px",
      background: isScrolled ? "#fff" : "transparent",
      boxShadow: "none",
      transition: "background 0.3s, box-shadow 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#000" }}>
          <PauseLogo color="#000" />
          <span style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 500, fontSize: "18px", letterSpacing: "-0.02em" }}>
            AI RECEPTIONIST
          </span>
        </a>
        <a
          href="/pricing"
          style={{
            color: "#000", fontSize: "12px", fontWeight: 400,
            letterSpacing: "0.06em", textDecoration: "none",
            fontFamily: "var(--font-inter), Inter, sans-serif",
          }}
        >
          PRICING
        </a>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {signedIn ? (
          <a href="/dashboard" style={ctaStyle}>
            DASHBOARD
          </a>
        ) : (
          <>
            <button
              type="button"
              onClick={() => open("login")}
              style={{
                height: "36px", padding: "0 14px", background: "transparent",
                border: "none", color: "#000", fontSize: "12px", fontWeight: 400,
                letterSpacing: "0.06em", cursor: "pointer",
                fontFamily: "var(--font-inter), Inter, sans-serif",
              }}
            >
              SIGN IN
            </button>
            <button type="button" onClick={() => open("signup")} style={ctaStyle}>
              START FREE TRIAL
            </button>
          </>
        )}
      </div>
    </header>
  );
}
