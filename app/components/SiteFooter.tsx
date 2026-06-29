"use client";

const PauseLogo = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="2.5" height="15" rx="1" fill={color} />
    <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill={color} />
  </svg>
);

// Official ElevenLabs wordmark, rendered white via fill="currentColor".
const ElevenLabsLogo = () => (
  <svg
    viewBox="0 0 117 15"
    fill="currentColor"
    role="img"
    aria-label="ElevenLabs"
    style={{ height: "17px", width: "auto", color: "#fff", overflow: "visible", display: "block" }}
  >
    <path d="M41.507 3.698h-2.975l3.595 11.054h3.203l3.595-11.054h-2.976l-2.25 8.327zM0 0h3.079v14.752H0zM6.115 0h3.079v14.752H6.115zM12.23 0h9.112v2.459H15.31V5.97h5.62V8.43h-5.62v3.863h6.033v2.46h-9.111zM23.222 0h2.913v14.752h-2.913zM27.892 9.215c0-4.029 2.004-5.765 5.124-5.765s4.896 1.715 4.896 5.806v.661h-7.148c.103 2.397.826 3.203 2.21 3.203 1.095 0 1.777-.64 1.901-1.756h2.913C37.602 13.802 35.578 15 32.974 15c-3.305 0-5.082-1.756-5.082-5.785m7.148-1.22c-.144-2.024-.847-2.685-2.066-2.685s-1.983.682-2.19 2.686zM49.482 9.215c0-4.029 2.005-5.765 5.124-5.765 3.12 0 4.897 1.715 4.897 5.806v.661h-7.149c.104 2.397.827 3.203 2.211 3.203 1.095 0 1.777-.64 1.9-1.756h2.914C59.193 13.802 57.17 15 54.565 15c-3.306 0-5.083-1.756-5.083-5.785m7.15-1.22c-.145-2.024-.848-2.685-2.067-2.685s-1.983.682-2.19 2.686zM73.304 0h3.079v12.293h5.785v2.46h-8.864z" />
    <path fillRule="evenodd" clipRule="evenodd" d="M82.891 9.215c0-4.215 1.942-5.765 4.442-5.765 1.24 0 2.376.703 2.83 1.447V3.698h2.976v11.054h-2.892V13.45c-.434.868-1.653 1.55-2.996 1.55-2.645 0-4.36-1.694-4.36-5.785m5.207-3.595c1.446 0 2.231 1.095 2.231 3.595s-.785 3.616-2.231 3.616c-1.447 0-2.273-1.116-2.273-3.616s.826-3.595 2.273-3.595M98.284 13.45v1.302H95.39V0h2.913v4.897c.496-.765 1.653-1.447 2.893-1.447 2.438 0 4.38 1.55 4.38 5.765S103.676 15 101.135 15c-1.343 0-2.438-.682-2.851-1.55m2.086-7.81c1.447 0 2.273 1.075 2.273 3.575s-.826 3.616-2.273 3.616c-1.446 0-2.231-1.116-2.231-3.616s.785-3.574 2.231-3.574" />
    <path d="M106.776 11.467h2.913c.041 1.157.661 1.715 1.756 1.715s1.715-.496 1.715-1.364c0-.785-.475-1.074-1.508-1.322l-.889-.227c-2.52-.64-3.781-1.323-3.781-3.41 0-2.086 1.942-3.409 4.422-3.409s4.359.972 4.442 3.265h-2.913c-.062-1.012-.682-1.446-1.571-1.446s-1.508.434-1.508 1.26c0 .764.496 1.054 1.364 1.26l.909.228c2.397.599 3.905 1.198 3.905 3.43 0 2.23-1.984 3.553-4.67 3.553-2.913 0-4.524-1.095-4.586-3.533M64.214 8.244c0-1.736.826-2.686 2.107-2.686 1.054 0 1.653.661 1.653 2.087v7.107h2.913V7.19c0-2.562-1.446-3.74-3.553-3.74-1.426 0-2.604.724-3.12 1.674V3.698h-2.955v11.054h2.955z" />
  </svg>
);

const VoicePartnerBadge = () => (
  <a
    href="https://elevenlabs.io"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="ElevenLabs — Voice Partner"
    style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", textDecoration: "none" }}
  >
    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase" }}>
      Voice Partner
    </span>
    <ElevenLabsLogo />
  </a>
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
                {[{ label: "Blog", href: "/blog" }, { label: "Answers", href: "/answers" }, { label: "AI Information", href: "/llms.txt" }].map((l) => (
                  <li key={l.label}><a href={l.href} style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em" }}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          </nav>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "32px" }}>
            <VoicePartnerBadge />
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
            <span style={{ color: "#fff", fontSize: "11px", fontWeight: 300 }}>© 2026 MeltFlex s. r. o.</span>
            <a href="/privacy-policy" style={{ color: "#fff", fontSize: "11px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.02em" }}>Data protection</a>
          </div>

          {/* Right: GDPR badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <img src="https://cdn.prod.website-files.com/66cdd640b6eaf9b4ea2f21c8/6848312f044b2bc8aef51e5d_leaves.svg" loading="lazy" alt="" style={{ height: "20px", width: "auto", filter: "brightness(0) invert(1)" }} />
            <span style={{ color: "#fff", fontSize: "11px", fontWeight: 300 }}>
              <strong style={{ color: "#fff", fontWeight: 500 }}>GDPR</strong> compliant
            </span>
            <img src="https://cdn.prod.website-files.com/66cdd640b6eaf9b4ea2f21c8/684831cb9a3271ea234575e9_leaves-2.svg" loading="lazy" alt="" style={{ height: "20px", width: "auto", filter: "brightness(0) invert(1)" }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
