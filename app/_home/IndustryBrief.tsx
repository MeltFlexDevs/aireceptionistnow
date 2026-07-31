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
      </div>
    </section>
  );
}
