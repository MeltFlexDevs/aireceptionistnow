"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="flex flex-col min-h-screen bg-white" style={{ fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif", fontWeight: 300, color: "#333" }}>

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          background: isScrolled ? "#ffffff" : "transparent",
          boxShadow: isScrolled ? "0 1px 0 rgba(0,0,0,0.06)" : "none",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <a
            href="/"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 500,
              fontSize: "20px",
              letterSpacing: "-0.02em",
              color: "#000",
              textDecoration: "none",
            }}
          >
            AI RECEPTIONIST
          </a>
          <div className="hidden md:flex" style={{ gap: "24px" }}>
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{ color: "#333", fontSize: "14px", fontWeight: 400, textDecoration: "none", transition: "color 0.15s" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#000")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#333")}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
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
            fontSize: "13px",
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
          Start Free Trial
        </a>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: "140px", paddingBottom: "80px", paddingLeft: "24px", paddingRight: "24px", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#f5f5f5",
              color: "#666",
              fontSize: "12px",
              fontWeight: 400,
              padding: "6px 16px",
              borderRadius: "20px",
              marginBottom: "32px",
            }}
          >
            <span style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", display: "inline-block" }}></span>
            12,000+ businesses already use AI Receptionist
          </div>

          <h1
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "clamp(42px, 7vw, 72px)",
              fontWeight: 300,
              letterSpacing: "-0.03em",
              color: "#111",
              lineHeight: 1.1,
              marginBottom: "24px",
            }}
          >
            Never Miss a Business Call Again
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "#666",
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: "560px",
              margin: "0 auto 40px",
            }}
          >
            Your AI receptionist answers calls, books appointments, and handles
            customers 24/7 — so you can focus on your work. Set up in under 10 minutes.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "60px" }}>
            <a
              href="#pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "48px",
                padding: "0 28px",
                background: "#000",
                color: "#fff",
                border: "1.5px solid #000",
                borderRadius: "24px",
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
                height: "48px",
                padding: "0 28px",
                background: "transparent",
                color: "#333",
                border: "1.5px solid #ddd",
                borderRadius: "24px",
                fontSize: "14px",
                fontWeight: 400,
                textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#999";
                e.currentTarget.style.color = "#000";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#ddd";
                e.currentTarget.style.color = "#333";
              }}
            >
              See How It Works
            </a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0",
              maxWidth: "400px",
              margin: "0 auto",
              paddingTop: "40px",
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
                }}
              >
                <div style={{ fontSize: "26px", fontWeight: 500, color: "#111", letterSpacing: "-0.02em" }}>{stat.value}</div>
                <div style={{ fontSize: "12px", color: "#999", marginTop: "4px", fontWeight: 300 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO CHAT */}
      <section style={{ padding: "40px 24px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div
            style={{
              background: "#f8f8f8",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid #ececec",
            }}
          >
            {[
              {
                role: "ai",
                text: '"Hello! You\'ve reached Dr. Smith\'s dental office. I\'m your AI assistant — I can book an appointment, answer questions, or connect you to our team. How can I help?"',
              },
              {
                role: "user",
                text: '"I\'d like to book a cleaning for next Tuesday morning."',
              },
              {
                role: "ai",
                text: '"Perfect! I have Tuesday at 9:00 AM and 10:30 AM available. Which works better? I\'ll send a confirmation to your phone right away."',
              },
            ].map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: i < 2 ? "20px" : "0",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: msg.role === "ai" ? "#111" : "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "11px",
                    fontWeight: 500,
                    color: msg.role === "ai" ? "#fff" : "#555",
                  }}
                >
                  {msg.role === "ai" ? "AI" : "C"}
                </div>
                <div
                  style={{
                    background: msg.role === "user" ? "#111" : "#fff",
                    color: msg.role === "user" ? "#fff" : "#333",
                    borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    padding: "12px 16px",
                    maxWidth: "400px",
                    fontSize: "13px",
                    lineHeight: 1.6,
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

      {/* INDUSTRIES */}
      <section style={{ padding: "48px 24px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px", fontWeight: 400 }}>
            Trusted by businesses in every industry
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 32px" }}>
            {["Dental Clinics", "Law Firms", "Auto Dealers", "Hotels", "Tradespeople", "Medical Practices", "Real Estate", "Restaurants"].map(
              (industry) => (
                <span key={industry} style={{ color: "#bbb", fontSize: "13px", fontWeight: 300, transition: "color 0.15s", cursor: "default" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#555")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#bbb")}
                >
                  {industry}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "80px 24px", background: "#f8f8f8" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#111", marginBottom: "16px" }}>
              Everything your receptionist does — automated
            </h2>
            <p style={{ fontSize: "16px", color: "#666", fontWeight: 300, maxWidth: "480px", margin: "0 auto" }}>
              Your AI handles the full call flow so customers always get a professional experience.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
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
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid #ececec",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor = "#ddd";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "#ececec";
                }}
              >
                <div style={{ fontSize: "26px", marginBottom: "16px" }}>{f.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#111", marginBottom: "8px" }}>{f.title}</h3>
                <p style={{ fontSize: "13px", color: "#777", lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#111", marginBottom: "16px" }}>
              Set up in 3 simple steps
            </h2>
            <p style={{ fontSize: "16px", color: "#666", fontWeight: 300 }}>No coding. No technical skills required.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
            {[
              { step: "01", title: "Tell us about your business", desc: "Describe your business, services, and how you want calls handled. Takes about 5 minutes." },
              { step: "02", title: "Get your AI phone number", desc: "We give you a local phone number — or forward your existing number to your AI receptionist." },
              { step: "03", title: "Start taking calls", desc: "Your AI is live immediately. Customers call, the AI handles it, you get a summary." },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                <div style={{ fontSize: "42px", fontWeight: 300, color: "#e8e8e8", lineHeight: 1, flexShrink: 0, width: "56px", textAlign: "right", letterSpacing: "-0.03em" }}>
                  {s.step}
                </div>
                <div style={{ paddingTop: "4px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 500, color: "#111", marginBottom: "8px" }}>{s.title}</h3>
                  <p style={{ fontSize: "14px", color: "#777", lineHeight: 1.6, fontWeight: 300 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 24px", background: "#f8f8f8" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#111", textAlign: "center", marginBottom: "60px" }}>
            Businesses love AI Receptionist
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[
              { quote: "My AI receptionist saves me the equivalent of a full-time employee. Every call is answered perfectly, even at 2am.", name: "Martin K.", role: "Owner, Auto Repair Shop" },
              { quote: "We were missing 30% of calls during busy hours. Now we capture every lead. Revenue up 22% in 3 months.", name: "Dr. Jana P.", role: "Dental Practice Owner" },
              { quote: "Set it up in 8 minutes. Our customers can't tell it's AI. The booking integration is flawless.", name: "Tomáš R.", role: "Hotel Manager" },
            ].map((t) => (
              <div
                key={t.name}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid #ececec",
                }}
              >
                <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: "#f59e0b", fontSize: "14px" }}>★</span>
                  ))}
                </div>
                <p style={{ color: "#555", lineHeight: 1.7, marginBottom: "20px", fontSize: "13px", fontWeight: 300 }}>"{t.quote}"</p>
                <div>
                  <div style={{ fontWeight: 500, color: "#111", fontSize: "13px" }}>{t.name}</div>
                  <div style={{ color: "#aaa", fontSize: "12px", fontWeight: 300 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#111", marginBottom: "16px" }}>
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: "16px", color: "#666", fontWeight: 300 }}>Start free. Upgrade when you need more. Cancel anytime.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
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
                  border: plan.highlight ? "1.5px solid #000" : "1px solid #ececec",
                  background: plan.highlight ? "#111" : "#fff",
                  color: plan.highlight ? "#fff" : "#333",
                }}
              >
                {plan.highlight && (
                  <div style={{ fontSize: "10px", fontWeight: 500, color: "#fff", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
                    Most Popular
                  </div>
                )}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 400, color: plan.highlight ? "rgba(255,255,255,0.5)" : "#999", marginBottom: "6px" }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "38px", fontWeight: 300, letterSpacing: "-0.03em", color: plan.highlight ? "#fff" : "#111" }}>{plan.price}</span>
                    <span style={{ fontSize: "13px", color: plan.highlight ? "rgba(255,255,255,0.4)" : "#aaa", fontWeight: 300 }}>{plan.period}</span>
                  </div>
                  <p style={{ fontSize: "13px", marginTop: "8px", color: plan.highlight ? "rgba(255,255,255,0.5)" : "#888", fontWeight: 300 }}>{plan.desc}</p>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 300, color: plan.highlight ? "rgba(255,255,255,0.8)" : "#555" }}>
                      <span style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : "#22c55e", fontSize: "12px" }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px 0",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: 400,
                    textDecoration: "none",
                    background: plan.highlight ? "#fff" : "#000",
                    color: plan.highlight ? "#000" : "#fff",
                    border: plan.highlight ? "none" : "1.5px solid #000",
                    transition: "opacity 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "60px 24px" }}>
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            background: "#111",
            borderRadius: "20px",
            padding: "60px 40px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#fff", marginBottom: "16px" }}>
            Start answering every call today
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px", fontWeight: 300, marginBottom: "36px", maxWidth: "480px", margin: "0 auto 36px" }}>
            Join 12,000+ businesses that never miss a call. Set up in 10 minutes. First 14 days free.
          </p>
          <a
            href="#pricing"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "48px",
              padding: "0 28px",
              background: "#fff",
              color: "#000",
              borderRadius: "24px",
              fontSize: "14px",
              fontWeight: 400,
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Start Free Trial →
          </a>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "16px", fontWeight: 300 }}>No credit card required</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #f0f0f0", padding: "40px 24px" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <a
            href="/"
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontWeight: 500,
              fontSize: "16px",
              letterSpacing: "-0.02em",
              color: "#000",
              textDecoration: "none",
            }}
          >
            AI RECEPTIONIST
          </a>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a
                key={link}
                href="#"
                style={{ color: "#aaa", fontSize: "13px", fontWeight: 300, textDecoration: "none", transition: "color 0.15s" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#555")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#aaa")}
              >
                {link}
              </a>
            ))}
          </div>
          <p style={{ color: "#bbb", fontSize: "12px", fontWeight: 300 }}>© 2026 AI Receptionist Now. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
