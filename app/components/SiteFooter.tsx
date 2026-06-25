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
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Resources</span>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                {[{ label: "Blog", href: "/blog" }].map((l) => (
                  <li key={l.label}><a href={l.href} style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em" }}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          </nav>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "32px" }}>
            <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", height: "36px", padding: "0 20px", background: "#fff", color: "#000", borderRadius: "20px", fontSize: "12px", fontWeight: 400, textDecoration: "none", letterSpacing: "0.05em" }}>
              START FREE TRIAL
            </a>
          </div>
        </div>
      </div>
      {/* ── COPYRIGHT BAR ── */}
      <div style={{ padding: "20px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          {/* Left: copyright + links */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#fff" }}>
              <PauseLogo color="#fff" />
              <span style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 500, fontSize: "16px", letterSpacing: "-0.02em" }}>AI RECEPTIONIST</span>
            </a>
            <span style={{ color: "#fff", fontSize: "11px", fontWeight: 300 }}>© All rights reserved. aireceptionistnow.com 2026 · MeltFlex s. r. o.</span>
            <a href="#" style={{ color: "#fff", fontSize: "11px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.02em" }}>Imprint</a>
            <a href="/privacy-policy" style={{ color: "#fff", fontSize: "11px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.02em" }}>Data protection</a>
          </div>

          {/* Right: GDPR badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <img src="https://cdn.prod.website-files.com/66cdd640b6eaf9b4ea2f21c8/6848312f044b2bc8aef51e5d_leaves.svg" loading="lazy" alt="" style={{ height: "20px", width: "auto" }} />
            <span style={{ color: "#fff", fontSize: "11px", fontWeight: 300 }}>
              <strong style={{ color: "#fff", fontWeight: 500 }}>GDPR</strong> compliant
            </span>
            <img src="https://cdn.prod.website-files.com/66cdd640b6eaf9b4ea2f21c8/684831cb9a3271ea234575e9_leaves-2.svg" loading="lazy" alt="" style={{ height: "20px", width: "auto" }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
