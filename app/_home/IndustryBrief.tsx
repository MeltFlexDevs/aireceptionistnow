import Link from "next/link";

import type { IndustrySlug } from "@/lib/marketing/industries";
import { INDUSTRY_CONTENT } from "./industry-content";

// The one section on an industry landing page whose prose exists nowhere else on
// the site. Rendered by HomeClient's `industryBrief` slot directly under the
// hero, above every section that is shared with the home page.
//
// Server component, plain data in, no client JS: this is text Google needs in
// the initial HTML, so nothing here may depend on hydration.
export function IndustryBrief({ slug }: { slug: IndustrySlug }) {
  const { brief } = INDUSTRY_CONTENT[slug];

  return (
    <section className="lp-section" style={{ padding: "100px 0" }}>
      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "0 24px" }}>
        <h2
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "clamp(26px, 3.2vw, 38px)",
            fontWeight: 300,
            letterSpacing: "-0.025em",
            color: "#1D1D1D",
            margin: "0 0 20px",
            maxWidth: "820px",
          }}
        >
          {brief.heading}
        </h2>
        <p
          style={{
            fontSize: "17px",
            lineHeight: 1.7,
            color: "#4a4a4a",
            margin: "0 0 48px",
            maxWidth: "760px",
          }}
        >
          {brief.intro}
        </p>

        <dl style={{ margin: 0, display: "grid", gap: "28px" }}>
          {brief.callTypes.map((c) => (
            <div
              key={c.name}
              style={{
                borderTop: "1px solid #e5e5e5",
                paddingTop: "22px",
                display: "grid",
                gap: "8px",
              }}
            >
              <dt
                style={{
                  fontSize: "17px",
                  fontWeight: 400,
                  color: "#1D1D1D",
                  letterSpacing: "-0.01em",
                }}
              >
                {c.name}
              </dt>
              <dd
                style={{
                  margin: 0,
                  fontSize: "16px",
                  lineHeight: 1.7,
                  color: "#4a4a4a",
                  maxWidth: "760px",
                }}
              >
                {c.detail}
              </dd>
            </div>
          ))}
        </dl>

        <div
          style={{
            marginTop: "56px",
            borderLeft: "2px solid #1D1D1D",
            paddingLeft: "24px",
            maxWidth: "780px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "20px",
              fontWeight: 400,
              letterSpacing: "-0.015em",
              color: "#1D1D1D",
              margin: "0 0 12px",
            }}
          >
            {brief.stakes.heading}
          </h3>
          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "#4a4a4a",
              margin: 0,
            }}
          >
            {brief.stakes.body}
          </p>
        </div>

        {/* The three questions the SXO pass found every lander left unanswered:
            how it attaches to the phone system they already run, what it does
            and does not write into, and what happens to what a caller says. */}
        <div style={{ marginTop: "72px", display: "grid", gap: "56px" }}>
          <div>
            <h3 style={subHeading}>{brief.phoneSetup.heading}</h3>
            <p style={bodyText}>{brief.phoneSetup.body}</p>
            <p style={{ ...bodyText, marginTop: "14px" }}>
              <Link href="/answers/use-existing-phone-number-with-ai-receptionist" style={linkStyle}>
                More on keeping your existing number
              </Link>
            </p>
          </div>

          <div>
            <h3 style={subHeading}>{brief.stack.heading}</h3>
            <p style={bodyText}>{brief.stack.intro}</p>
            <ul style={{ margin: "20px 0 0", padding: 0, listStyle: "none", display: "grid", gap: "16px" }}>
              {brief.stack.notes.map((n) => (
                <li
                  key={n.slice(0, 40)}
                  style={{ ...bodyText, paddingLeft: "18px", borderLeft: "1px solid #e5e5e5" }}
                >
                  {n}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={subHeading}>{brief.compliance.heading}</h3>
            <p style={bodyText}>{brief.compliance.body}</p>
          </div>
        </div>

        {/* Price and the guarantee were only ever visible on /pricing, so a
            visitor landing here from search never saw the trust layer. */}
        <div
          style={{
            marginTop: "64px",
            borderTop: "1px solid #e5e5e5",
            paddingTop: "28px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px 32px",
            alignItems: "baseline",
            fontSize: "15px",
            color: "#4a4a4a",
          }}
        >
          <span style={{ color: "#1D1D1D" }}>
            Solo &euro;99/mo &middot; Team &euro;299/mo
          </span>
          <span>30-day money-back guarantee</span>
          <span>Cancel any time from the dashboard</span>
          <Link href="/pricing" style={linkStyle}>
            See what is in each plan
          </Link>
        </div>
      </div>
    </section>
  );
}

const subHeading: React.CSSProperties = {
  fontFamily: "var(--font-inter), Inter, sans-serif",
  fontSize: "22px",
  fontWeight: 400,
  letterSpacing: "-0.015em",
  color: "#1D1D1D",
  margin: "0 0 14px",
  maxWidth: "780px",
};

const bodyText: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: 1.7,
  color: "#4a4a4a",
  margin: 0,
  maxWidth: "760px",
};

// #666 on white is 5.7:1, so the underlined link clears WCAG AA at this size.
const linkStyle: React.CSSProperties = {
  color: "#666",
  textDecoration: "underline",
  textDecorationColor: "#ddd",
  textUnderlineOffset: "4px",
};
