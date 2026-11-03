/**
 * The header the legal, support and account pages show in in-app mode
 * (`?app=1`, see lib/legal.ts): the wordmark only, as text, not a link.
 *
 * SiteHeader is the wrong thing to render inside the app's in-app browser -
 * its "Start now" and "Dashboard" buttons and the Pricing link all lead on to
 * the web sign-up and its Stripe plan step, which from inside the binary is a
 * purchase path outside the store. This keeps the page recognisably ours
 * without any of that. Same typography as SiteHeader's logo, static rather
 * than fixed so it never covers content in a small in-app view.
 */

const PauseLogo = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="0" y="0" width="2.5" height="15" rx="1" fill={color} />
    <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill={color} />
  </svg>
);

export default function AppModeHeader() {
  return (
    <header
      className="app-mode-header"
      style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: "0 40px",
        borderBottom: "1px solid #eee",
        background: "#fff",
      }}
    >
      <style>{`
        @media (max-width: 600px) {
          .app-mode-header { padding-left: 14px !important; padding-right: 14px !important; }
          .app-mode-header-logo { font-size: 15px !important; }
        }
      `}</style>
      <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#1D1D1D" }}>
        <PauseLogo color="#1D1D1D" />
        <span
          className="app-mode-header-logo"
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: "18px",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          AI RECEPTIONIST
        </span>
      </span>
    </header>
  );
}
