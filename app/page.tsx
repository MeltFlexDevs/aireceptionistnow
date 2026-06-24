"use client";

import { useState, useEffect } from "react";

const PauseLogo = () => (
  <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="2.5" height="15" rx="1" fill="currentColor" />
    <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill="currentColor" />
  </svg>
);

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const interFont: React.CSSProperties = {
    fontFamily: "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: 300,
  };

  return (
    <main style={{ ...interFont, background: "#fff", color: "#333", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── HEADER ── */}
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 60,
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          background: isScrolled ? "#fff" : "transparent",
          boxShadow: isScrolled ? "0 1px 0 rgba(0,0,0,0.07)" : "none",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#000",
            }}
          >
            <PauseLogo />
            <span
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontWeight: 500,
                fontSize: "18px",
                letterSpacing: "-0.02em",
                color: "#000",
              }}
            >
              AI RECEPTIONIST
            </span>
          </a>

          {/* Desktop nav */}
          <nav style={{ display: "flex", gap: "24px" }} className="hidden md:flex">
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  color: "#333",
                  fontSize: "14px",
                  fontWeight: 400,
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#000")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#333")}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Header CTA */}
        <a
          href="#pricing"
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "36px",
            padding: "0 20px",
            background: "#000",
            color: "#fff",
            border: "1.5px solid #000",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 400,
            textDecoration: "none",
            letterSpacing: "0.06em",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#000";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#000";
            e.currentTarget.style.color = "#fff";
          }}
        >
          START FREE TRIAL
        </a>
      </header>

      {/* ── HERO ── */}
      <section style={{ paddingTop: "140px", paddingBottom: "80px", padding: "140px 40px 80px", textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#f5f5f5",
              color: "#777",
              fontSize: "12px",
              fontWeight: 400,
              padding: "5px 14px",
              borderRadius: "20px",
              marginBottom: "36px",
              letterSpacing: "0.01em",
            }}
          >
            <span style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", flexShrink: 0 }} />
            12,000+ businesses already use AI Receptionist
          </div>

          {/* H1 */}
          <h1
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "clamp(40px, 6.5vw, 68px)",
              fontWeight: 300,
              letterSpacing: "-0.03em",
              color: "#111",
              lineHeight: 1.08,
              marginBottom: "24px",
            }}
          >
            Never Miss a Business Call Again
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "17px",
              color: "#777",
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: "520px",
              margin: "0 auto 40px",
            }}
          >
            Your AI receptionist answers calls, books appointments, and handles
            customers 24/7 — so you can focus on your work. Set up in under 10 minutes.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "64px" }}>
            <a
              href="#pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "46px",
                padding: "0 26px",
                background: "#000",
                color: "#fff",
                border: "1.5px solid #000",
                borderRadius: "23px",
                fontSize: "14px",
                fontWeight: 400,
                textDecoration: "none",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#000";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#000";
                e.currentTarget.style.color = "#fff";
              }}
            >
              Start Free Trial →
            </a>
            <a
              href="#how-it-works"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "46px",
                padding: "0 26px",
                background: "transparent",
                color: "#333",
                border: "1.5px solid #e0e0e0",
                borderRadius: "23px",
                fontSize: "14px",
                fontWeight: 400,
                textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#aaa";
                e.currentTarget.style.color = "#000";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.color = "#333";
              }}
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              maxWidth: "380px",
              margin: "0 auto",
              paddingTop: "36px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            {[
              { value: "24/7", label: "Always available" },
              { value: "4.9★", label: "Average rating" },
              { value: "10 min", label: "Setup time" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  textAlign: "center",
                  borderLeft: i > 0 ? "1px solid #f0f0f0" : "none",
                  padding: "0 8px",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: 500, color: "#111", letterSpacing: "-0.02em" }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px", fontWeight: 300 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO CHAT ── */}
      <section style={{ padding: "0 40px 64px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div
            style={{
              background: "#f8f8f8",
              borderRadius: "20px",
              padding: "28px 28px",
              border: "1px solid #ececec",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {[
              { role: "ai", text: "\"Hello! You've reached Dr. Smith's dental office. I'm your AI assistant — I can book an appointment, answer questions, or connect you to our team. How can I help?\"" },
              { role: "user", text: "\"I'd like to book a cleaning for next Tuesday morning.\"" },
              { role: "ai", text: "\"Perfect! I have Tuesday at 9:00 AM and 10:30 AM available. Which works better? I'll send a confirmation to your phone right away.\"" },
            ].map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: msg.role === "ai" ? "#111" : "#e8e8e8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "10px",
                    fontWeight: 500,
                    color: msg.role === "ai" ? "#fff" : "#666",
                    letterSpacing: "0.02em",
                  }}
                >
                  {msg.role === "ai" ? "AI" : "C"}
                </div>
                <div
                  style={{
                    background: msg.role === "user" ? "#111" : "#fff",
                    color: msg.role === "user" ? "#fff" : "#444",
                    borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    padding: "11px 15px",
                    maxWidth: "380px",
                    fontSize: "13px",
                    lineHeight: 1.65,
                    border: msg.role === "user" ? "none" : "1px solid #ececec",
                    fontWeight: 300,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section style={{ padding: "40px 40px 64px", textAlign: "center" }}>
        <p
          style={{
            fontSize: "10px",
            color: "#ccc",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 400,
            marginBottom: "20px",
          }}
        >
          Trusted by businesses in every industry
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 28px" }}>
          {["Dental Clinics", "Law Firms", "Auto Dealers", "Hotels", "Tradespeople", "Medical Practices", "Real Estate", "Restaurants"].map(
            (industry) => (
              <span
                key={industry}
                style={{ color: "#ccc", fontSize: "13px", fontWeight: 300, transition: "color 0.15s", cursor: "default" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#666")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#ccc")}
              >
                {industry}
              </span>
            )
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 40px", background: "#f8f8f8" }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: 300,
                letterSpacing: "-0.025em",
                color: "#111",
                marginBottom: "14px",
              }}
            >
              Everything your receptionist does — automated
            </h2>
            <p style={{ fontSize: "15px", color: "#888", fontWeight: 300, maxWidth: "440px", margin: "0 auto", lineHeight: 1.6 }}>
              Your AI handles the full call flow so customers always get a professional experience.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {[
              { icon: "📞", title: "Answers Every Call", desc: "No more missed calls or voicemail. Your AI picks up instantly, 24/7, including weekends and holidays." },
              { icon: "📅", title: "Books Appointments", desc: "Integrates with your calendar and books meetings during the call — no back-and-forth needed." },
              { icon: "🔀", title: "Smart Call Routing", desc: "Routes complex calls to the right team member. Handles simple ones on its own." },
              { icon: "📝", title: "Call Transcripts", desc: "Every call is transcribed and summarized. Get an email recap after each conversation." },
              { icon: "🌍", title: "Multi-Language", desc: "Speaks 30+ languages fluently. Serve customers in their native language automatically." },
              { icon: "🔗", title: "CRM Integration", desc: "Connects with HubSpot, Salesforce, Google Calendar, and more via native integrations." },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "24px",
                  border: "1px solid #ececec",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  cursor: "default",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
                  (e.currentTarget as HTMLElement).style.borderColor = "#ddd";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "#ececec";
                }}
              >
                <div style={{ fontSize: "22px", marginBottom: "14px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#111", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: 300,
                letterSpacing: "-0.025em",
                color: "#111",
                marginBottom: "14px",
              }}
            >
              Set up in 3 simple steps
            </h2>
            <p style={{ fontSize: "15px", color: "#888", fontWeight: 300, lineHeight: 1.6 }}>No coding. No technical skills required.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {[
              { step: "01", title: "Tell us about your business", desc: "Describe your business, services, and how you want calls handled. Takes about 5 minutes." },
              { step: "02", title: "Get your AI phone number", desc: "We give you a local phone number — or forward your existing number to your AI receptionist." },
              { step: "03", title: "Start taking calls", desc: "Your AI is live immediately. Customers call, the AI handles it, you get a summary." },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div
                  style={{
                    fontSize: "38px",
                    fontWeight: 300,
                    color: "#e8e8e8",
                    lineHeight: 1,
                    flexShrink: 0,
                    width: "52px",
                    textAlign: "right",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {s.step}
                </div>
                <div style={{ paddingTop: "4px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#111", marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.65, fontWeight: 300 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "80px 40px", background: "#f8f8f8" }}>
        <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 300,
              letterSpacing: "-0.025em",
              color: "#111",
              textAlign: "center",
              marginBottom: "56px",
            }}
          >
            Businesses love AI Receptionist
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {[
              { quote: "My AI receptionist saves me the equivalent of a full-time employee. Every call is answered perfectly, even at 2am.", name: "Martin K.", role: "Owner, Auto Repair Shop" },
              { quote: "We were missing 30% of calls during busy hours. Now we capture every lead. Revenue up 22% in 3 months.", name: "Dr. Jana P.", role: "Dental Practice Owner" },
              { quote: "Set it up in 8 minutes. Our customers can't tell it's AI. The booking integration is flawless.", name: "Tomáš R.", role: "Hotel Manager" },
            ].map((t) => (
              <div
                key={t.name}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "24px",
                  border: "1px solid #ececec",
                }}
              >
                <div style={{ display: "flex", gap: "2px", marginBottom: "14px" }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: "#f59e0b", fontSize: "12px" }}>★</span>
                  ))}
                </div>
                <p style={{ color: "#666", lineHeight: 1.7, marginBottom: "18px", fontSize: "13px", fontWeight: 300 }}>"{t.quote}"</p>
                <div>
                  <div style={{ fontWeight: 500, color: "#111", fontSize: "13px" }}>{t.name}</div>
                  <div style={{ color: "#bbb", fontSize: "12px", fontWeight: 300, marginTop: "2px" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "940px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "clamp(26px, 3.5vw, 38px)",
                fontWeight: 300,
                letterSpacing: "-0.025em",
                color: "#111",
                marginBottom: "14px",
              }}
            >
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: "15px", color: "#888", fontWeight: 300, lineHeight: 1.6 }}>
              Start free. Upgrade when you need more. Cancel anytime.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
            {[
              {
                name: "Starter",
                price: "$29",
                period: "/month",
                desc: "Perfect for small businesses getting started",
                features: ["100 calls / month", "Appointment booking", "Email summaries", "1 phone number", "5 languages"],
                cta: "Start Free Trial",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$79",
                period: "/month",
                desc: "For growing businesses with high call volume",
                features: ["500 calls / month", "Everything in Starter", "CRM integration", "3 phone numbers", "30+ languages", "Call routing", "Priority support"],
                cta: "Start Free Trial",
                highlight: true,
              },
              {
                name: "Business",
                price: "$199",
                period: "/month",
                desc: "For teams and multi-location businesses",
                features: ["Unlimited calls", "Everything in Pro", "Custom voice & persona", "10 phone numbers", "API access", "Dedicated support"],
                cta: "Contact Sales",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                style={{
                  borderRadius: "16px",
                  padding: "28px",
                  border: plan.highlight ? "1.5px solid #111" : "1px solid #ececec",
                  background: plan.highlight ? "#111" : "#fff",
                }}
              >
                {plan.highlight && (
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 400,
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: "16px",
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <div style={{ marginBottom: "22px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 400, color: plan.highlight ? "rgba(255,255,255,0.4)" : "#aaa", marginBottom: "6px", letterSpacing: "0.03em" }}>
                    {plan.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "36px", fontWeight: 300, letterSpacing: "-0.03em", color: plan.highlight ? "#fff" : "#111" }}>{plan.price}</span>
                    <span style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.3)" : "#bbb", fontWeight: 300 }}>{plan.period}</span>
                  </div>
                  <p style={{ fontSize: "12px", marginTop: "8px", color: plan.highlight ? "rgba(255,255,255,0.4)" : "#aaa", fontWeight: 300, lineHeight: 1.5 }}>{plan.desc}</p>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 26px 0", display: "flex", flexDirection: "column", gap: "9px" }}>
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        fontWeight: 300,
                        color: plan.highlight ? "rgba(255,255,255,0.75)" : "#666",
                      }}
                    >
                      <span style={{ color: plan.highlight ? "rgba(255,255,255,0.35)" : "#22c55e", fontSize: "11px", flexShrink: 0 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "11px 0",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 400,
                    textDecoration: "none",
                    background: plan.highlight ? "#fff" : "#000",
                    color: plan.highlight ? "#000" : "#fff",
                    transition: "opacity 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "0 40px 80px" }}>
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            background: "#111",
            borderRadius: "20px",
            padding: "64px 48px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "clamp(24px, 3.5vw, 36px)",
              fontWeight: 300,
              letterSpacing: "-0.025em",
              color: "#fff",
              marginBottom: "16px",
            }}
          >
            Start answering every call today
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px", fontWeight: 300, lineHeight: 1.65, maxWidth: "440px", margin: "0 auto 36px" }}>
            Join 12,000+ businesses that never miss a call. Set up in 10 minutes. First 14 days free.
          </p>
          <a
            href="#pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "46px",
              padding: "0 26px",
              background: "#fff",
              color: "#000",
              borderRadius: "23px",
              fontSize: "14px",
              fontWeight: 400,
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Start Free Trial →
          </a>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", marginTop: "14px", fontWeight: 300 }}>No credit card required</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#000",
          color: "#fff",
          fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif",
          fontWeight: 300,
        }}
      >
        {/* Top */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "60px 0 50px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>

            {/* Nav columns */}
            <nav style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
              {/* Product */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Product</span>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { label: "Features", href: "#features" },
                    { label: "How it works", href: "#how-it-works" },
                    { label: "Pricing", href: "#pricing" },
                    { label: "Integrations", href: "#" },
                    { label: "API Access", href: "#" },
                  ].map((l) => (
                    <li key={l.label}>
                      <a href={l.href} style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s" }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                      >{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Industries */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Industries</span>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {["Dental Clinics", "Law Firms", "Medical Practices", "Hotels", "Auto Dealers", "Restaurants"].map((l) => (
                    <li key={l}>
                      <a href="#" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s" }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Resources</span>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { label: "Blog", href: "#" },
                    { label: "FAQ", href: "#" },
                    { label: "Contact", href: "#" },
                    { label: "Documentation", href: "#" },
                  ].map((l) => (
                    <li key={l.label}>
                      <a href={l.href} style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s" }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                      >{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Right side */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "32px" }}>
              {/* Ask AI */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" }}>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 300, letterSpacing: "0.05em", textTransform: "uppercase" }}>Ask AI about AI Receptionist</p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {/* ChatGPT */}
                  <a href="https://chatgpt.com/?prompt=I'm%20researching%20AI%20receptionist%20and%20call%20handling%20tools%20and%20want%20to%20understand%20how%20AI%20Receptionist%20Now%20helps%20businesses%20answer%20calls%2024%2F7.%20Please%20summarize%20the%20highlights%20of%20the%20AI%20Receptionist%20Now%20website%20(https%3A%2F%2Fwww.aireceptionistnow.com)%20and%20community%20reviews." target="_blank" rel="noopener noreferrer" aria-label="Ask ChatGPT about AI Receptionist" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
                    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="m0" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24" style={{ maskType: "luminance" }}><path d="M23.987.03H.02v23.967h23.967V.03Z" fill="#fff"/></mask><g mask="url(#m0)"><mask id="m1" maskUnits="userSpaceOnUse" x="0" y="1" width="24" height="23" style={{ maskType: "luminance" }}><path d="M23.109 1H.899v22.011h22.21V1Z" fill="#fff"/></mask><g mask="url(#m1)"><path d="M9.418 9.012V6.921c0-.176.066-.308.22-.396l4.204-2.421c.572-.33 1.255-.485 1.96-.485 2.64 0 4.313 2.048 4.313 4.227 0 .154 0 .33-.022.506l-4.358-2.554a.737.737 0 0 0-.792 0L9.418 9.012Zm9.817 8.144V12.16a.736.736 0 0 0-.396-.683l-5.525-3.213 1.805-1.035a.4.4 0 0 1 .44 0l4.204 2.421c1.21.705 2.025 2.201 2.025 3.654 0 1.673-.99 3.214-2.553 3.852ZM8.119 12.754l-1.805-1.056c-.154-.088-.22-.22-.22-.397V6.46c0-2.355 1.805-4.138 4.248-4.138a4.12 4.12 0 0 1 2.51.858L8.516 5.69a.736.736 0 0 0-.397.682v6.383ZM12.004 15l-2.586-1.453v-3.081l2.586-1.453 2.586 1.453v3.082l-2.586 1.452Zm1.662 6.692a4.12 4.12 0 0 1-2.51-.859l4.337-2.51a.736.736 0 0 0 .396-.681v-6.384l1.827 1.057c.154.088.22.22.22.396v4.842c0 2.355-1.827 4.139-4.27 4.139Zm-5.217-4.909-4.204-2.421c-1.21-.705-2.025-2.201-2.025-3.654a4.148 4.148 0 0 1 2.575-3.852v5.019c0 .308.132.528.396.682l5.503 3.192-1.805 1.034a.4.4 0 0 1-.44 0Zm-.242 3.61c-2.487 0-4.314-1.87-4.314-4.182 0-.176.022-.352.044-.528l4.336 2.509a.737.737 0 0 0 .793 0l5.524-3.192v2.091c0 .177-.066.309-.22.397l-4.204 2.42c-.572.331-1.255.485-1.959.485Zm5.459 2.62a5.504 5.504 0 0 0 5.393-4.403c2.465-.638 4.05-2.95 4.05-5.305 0-1.54-.66-3.037-1.849-4.116.11-.462.176-.924.176-1.386 0-3.148-2.553-5.503-5.503-5.503-.594 0-1.166.088-1.739.286A5.517 5.517 0 0 0 10.342 1 5.503 5.503 0 0 0 4.95 5.402C2.484 6.041.9 8.352.9 10.707c0 1.54.66 3.037 1.85 4.116-.11.462-.177.925-.177 1.387 0 3.147 2.554 5.503 5.503 5.503.594 0 1.167-.088 1.739-.287a5.516 5.516 0 0 0 3.852 1.585Z" fill="currentColor"/></g></g></svg>
                  </a>
                  {/* Perplexity */}
                  <a href="https://www.perplexity.ai/search/new?q=I'm%20researching%20AI%20receptionist%20and%20call%20handling%20tools%20and%20want%20to%20understand%20how%20AI%20Receptionist%20Now%20helps%20businesses%20answer%20calls%2024%2F7.%20Please%20summarize%20the%20highlights%20of%20the%20AI%20Receptionist%20Now%20website%20(https%3A%2F%2Fwww.aireceptionistnow.com)%20and%20community%20reviews." target="_blank" rel="noopener noreferrer" aria-label="Ask Perplexity about AI Receptionist" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
                    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="m5.206.889 6.176 5.83V.902h1.202v5.843L18.787.89v6.647h2.546v9.588h-2.539v5.92l-6.21-5.592v5.655h-1.202v-5.563l-6.169 5.567v-5.987H2.667V7.536h2.54V.89Zm5.27 7.864H3.868v7.155h1.343V13.65l5.263-4.898Zm-4.06 5.438v6.205l4.966-4.482V9.568l-4.967 4.623Zm6.202 1.664V9.562l4.968 4.623v2.94h.006v3.208l-4.974-4.478Zm6.176.053h1.337V8.753h-6.557l5.22 4.847v2.308Zm-1.21-8.372V3.688l-4.076 3.848h4.076Zm-7.1 0H6.409V3.688l4.077 3.848Z" fill="currentColor"/></svg>
                  </a>
                  {/* Claude */}
                  <a href="https://claude.ai/new?q=I'm%20researching%20AI%20receptionist%20and%20call%20handling%20tools%20and%20want%20to%20understand%20how%20AI%20Receptionist%20Now%20helps%20businesses%20answer%20calls%2024%2F7.%20Please%20summarize%20the%20highlights%20of%20the%20AI%20Receptionist%20Now%20website%20(https%3A%2F%2Fwww.aireceptionistnow.com)%20and%20community%20reviews." target="_blank" rel="noopener noreferrer" aria-label="Ask Claude about AI Receptionist" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
                    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#cl)"><path d="m11.376 24-.6-.456-.336-.744.336-1.488.384-1.92.312-1.536.288-1.896.168-.624-.024-.048-.12.024-1.44 1.968-2.184 2.952-1.728 1.824-.408.168-.72-.36.072-.672.408-.576 2.376-3.048 1.44-1.896.936-1.08-.024-.144h-.048l-6.336 4.128L3 18.72l-.504-.456.072-.744.24-.24 1.896-1.32 4.728-2.64.072-.24-.072-.12h-.24l-.792-.048-2.688-.072-2.328-.096-2.28-.12-.576-.12-.528-.72.048-.36.48-.312.696.048 1.512.12 2.28.144 1.656.096 2.448.264h.384l.048-.168-.12-.096-.096-.096L6.96 9.84 4.416 8.16l-1.344-.984-.72-.504-.36-.456-.144-1.008.648-.72.888.072.216.048.888.696 1.896 1.464L8.88 8.616l.36.288.168-.096v-.072l-.168-.264-1.344-2.448-1.44-2.496-.648-1.032-.168-.624a2.53 2.53 0 0 1-.096-.72L6.288.144 6.696 0l1.008.144.408.36.624 1.416.984 2.232 1.56 3.024.456.912.24.816.096.264h.168v-.144l.12-1.728.24-2.088.24-2.688.072-.768.384-.912.744-.48.576.264.48.696-.072.432L14.76 3.6l-.576 2.904-.36 1.968h.216l.24-.264.984-1.296 1.656-2.064.72-.816.864-.912.552-.432h1.032l.744 1.128-.336 1.176-1.056 1.344-.888 1.128-1.272 1.704-.768 1.368.072.096h.168l2.856-.624 1.56-.264 1.824-.312.84.384.096.384-.336.816-1.968.48-2.304.456-3.432.816-.048.024.048.072 1.536.144.672.048h1.632l3.024.216.792.528.456.624-.072.504-1.224.6-1.632-.384-3.84-.912-1.296-.312h-.192v.096l1.104 1.08 1.992 1.8 2.52 2.328.12.576-.312.48-.336-.048-2.208-1.68-.864-.744-1.92-1.608h-.12v.168l.432.648 2.352 3.528.12 1.08-.168.336-.624.216-.648-.12-1.392-1.92-1.416-2.184-1.152-1.944-.12.096-.696 7.248-.312.36-.72.288Z" fill="#D97757"/></g><defs><clipPath id="cl"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs></svg>
                  </a>
                  {/* Gemini */}
                  <a href="https://www.google.com/search?udm=50&aep=11&q=I'm%20researching%20AI%20receptionist%20and%20call%20handling%20tools%20and%20want%20to%20understand%20how%20AI%20Receptionist%20Now%20helps%20businesses%20answer%20calls%2024%2F7.%20Please%20summarize%20the%20highlights%20of%20the%20AI%20Receptionist%20Now%20website%20(https%3A%2F%2Fwww.aireceptionistnow.com)%20and%20community%20reviews." target="_blank" rel="noopener noreferrer" aria-label="Ask Gemini about AI Receptionist" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
                    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.616 10.835a14.148 14.148 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.629 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.148 14.148 0 0 1 4.45 3.001 14.112 14.112 0 0 1 3.68 6.453.502.502 0 0 0 .974 0c.172-.685.397-1.351.677-2.003a14.146 14.146 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.503.503 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z" fill="#3186FF"/><path d="M20.616 10.835a14.148 14.148 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.629 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.148 14.148 0 0 1 4.45 3.001 14.112 14.112 0 0 1 3.68 6.453.502.502 0 0 0 .974 0c.172-.685.397-1.351.677-2.003a14.146 14.146 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.503.503 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z" fill="url(#g0)"/><path d="M20.616 10.835a14.148 14.148 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.629 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.148 14.148 0 0 1 4.45 3.001 14.112 14.112 0 0 1 3.68 6.453.502.502 0 0 0 .974 0c.172-.685.397-1.351.677-2.003a14.146 14.146 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.503.503 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z" fill="url(#g1)"/><path d="M20.616 10.835a14.148 14.148 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.629 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.148 14.148 0 0 1 4.45 3.001 14.112 14.112 0 0 1 3.68 6.453.502.502 0 0 0 .974 0c.172-.685.397-1.351.677-2.003a14.146 14.146 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.503.503 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z" fill="url(#g2)"/><defs><linearGradient id="g0" x1="7" y1="15.5" x2="11" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#08B962"/><stop offset="1" stopColor="#08B962" stopOpacity="0"/></linearGradient><linearGradient id="g1" x1="8" y1="5.5" x2="11.5" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#F94543"/><stop offset="1" stopColor="#F94543" stopOpacity="0"/></linearGradient><linearGradient id="g2" x1="3.5" y1="13.5" x2="17.5" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#FABC12"/><stop offset="0.46" stopColor="#FABC12" stopOpacity="0"/></linearGradient></defs></svg>
                  </a>
                  {/* Grok */}
                  <a href="https://x.com/i/grok?text=I'm%20researching%20AI%20receptionist%20and%20call%20handling%20tools%20and%20want%20to%20understand%20how%20AI%20Receptionist%20Now%20helps%20businesses%20answer%20calls%2024%2F7.%20Please%20summarize%20the%20highlights%20of%20the%20AI%20Receptionist%20Now%20website%20(https%3A%2F%2Fwww.aireceptionistnow.com)%20and%20community%20reviews." target="_blank" rel="noopener noreferrer" aria-label="Ask Grok about AI Receptionist" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}>
                    <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m9.541 15.31 7.56-5.706c.372-.28.901-.17 1.078.264.93 2.292.514 5.045-1.335 6.936-1.85 1.89-4.423 2.305-6.775 1.361L7.5 19.381c3.685 2.575 8.16 1.939 10.956-.922 2.219-2.268 2.905-5.359 2.263-8.146l.006.006c-.931-4.095.229-5.732 2.606-9.079L23.5 1l-3.128 3.198v-.01L9.54 15.312M7.877 16.633c-2.701-2.493-2.236-6.351.07-8.576 1.704-1.647 4.497-2.32 6.935-1.331L17.5 5.558a7.646 7.646 0 0 0-1.77-.933C12.594 3.38 8.84 4 6.292 6.46c-2.452 2.368-3.223 6.01-1.9 9.118.99 2.323-.632 3.966-2.265 5.624C1.55 21.79.967 22.378.5 23l7.375-6.365" fill="currentColor"/></svg>
                  </a>
                </div>
              </div>

              {/* CTA */}
              <a
                href="#pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: "36px",
                  padding: "0 20px",
                  background: "#fff",
                  color: "#000",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 400,
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                START FREE TRIAL
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ padding: "28px 0" }}>
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {/* Logo */}
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", color: "#fff" }}>
              <PauseLogo />
              <span style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 500, fontSize: "16px", letterSpacing: "-0.02em", color: "#fff" }}>
                AI RECEPTIONIST
              </span>
            </a>

            {/* Legal links */}
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[
                { label: "Privacy Policy", href: "#" },
                { label: "Terms & Conditions", href: "#" },
                { label: "Cookie Policy", href: "#" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.02em", transition: "color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                  >{l.label}</a>
                </li>
              ))}
            </ul>

            {/* Copyright */}
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: 300, margin: 0 }}>
              © 2026 AI Receptionist Now. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
