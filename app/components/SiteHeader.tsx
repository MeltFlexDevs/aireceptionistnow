"use client";

import { useState, useEffect } from "react";

const PauseLogo = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="2.5" height="15" rx="1" fill={color} />
    <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill={color} />
  </svg>
);

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 60,
      height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px",
      background: isScrolled ? "#fff" : "transparent",
      boxShadow: isScrolled ? "0 1px 0 rgba(0,0,0,0.07)" : "none",
      transition: "background 0.3s, box-shadow 0.3s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#000" }}>
          <PauseLogo color="#000" />
          <span style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 500, fontSize: "18px", letterSpacing: "-0.02em" }}>
            AI RECEPTIONIST
          </span>
        </a>
        <nav style={{ display: "flex", gap: "24px" }}>
          {[
            { label: "Features", href: "/#features" },
            { label: "How it works", href: "/#how-it-works" },
            { label: "Pricing", href: "/#pricing" },
          ].map((l) => (
            <a key={l.label} href={l.href} style={{ color: "#333", fontSize: "14px", fontWeight: 400, textDecoration: "none", transition: "color 0.15s" }}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <a href="/#pricing" style={{
        display: "inline-flex", alignItems: "center", height: "36px", padding: "0 20px",
        background: "#000", color: "#fff",
        border: "1.5px solid #000",
        borderRadius: "20px", fontSize: "12px", fontWeight: 400, textDecoration: "none",
        letterSpacing: "0.06em", transition: "all 0.25s",
      }}>
        START FREE TRIAL
      </a>
    </header>
  );
}
