"use client";

const PauseLogo = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="2.5" height="15" rx="1" fill={color} />
    <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill={color} />
  </svg>
);

export default function SiteFooter() {
  return (
    <footer style={{ background: "#000", color: "#fff", fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif", fontWeight: 300 }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "60px 0 50px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
          <nav style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Product</span>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {[{ label: "Features", href: "/#features" }, { label: "How it works", href: "/#how-it-works" }, { label: "Pricing", href: "/#pricing" }, { label: "Integrations", href: "#" }, { label: "API Access", href: "#" }].map((l) => (
                  <li key={l.label}><a href={l.href} style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em" }}>{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Industries</span>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Dental Clinics", "Law Firms", "Medical Practices", "Hotels", "Auto Dealers", "Restaurants"].map((l) => (
                  <li key={l}><a href="#" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em" }}>{l}</a></li>
                ))}
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Resources</span>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {[{ label: "Blog", href: "#" }, { label: "FAQ", href: "#" }, { label: "Contact", href: "#" }, { label: "Documentation", href: "#" }].map((l) => (
                  <li key={l.label}><a href={l.href} style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em" }}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          </nav>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "32px" }}>
            <a href="/#pricing" style={{ display: "inline-flex", alignItems: "center", height: "36px", padding: "0 20px", background: "#fff", color: "#000", borderRadius: "20px", fontSize: "12px", fontWeight: 400, textDecoration: "none", letterSpacing: "0.05em" }}>
              START FREE TRIAL
            </a>
          </div>
        </div>
      </div>
      <div style={{ padding: "28px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", color: "#fff" }}>
            <PauseLogo color="#fff" />
            <span style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 500, fontSize: "16px", letterSpacing: "-0.02em" }}>AI RECEPTIONIST</span>
          </a>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[{ label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms & Conditions", href: "#" }, { label: "Cookie Policy", href: "#" }].map((l) => (
              <li key={l.label}><a href={l.href} style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.02em" }}>{l.label}</a></li>
            ))}
          </ul>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: 300, margin: 0 }}>© 2026 AI Receptionist Now. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
