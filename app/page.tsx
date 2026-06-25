"use client";

import { useState, useEffect } from "react";

const PauseLogo = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="2.5" height="15" rx="1" fill={color} />
    <rect x="4.5" y="0" width="2.5" height="15" rx="1" fill={color} />
  </svg>
);

const StarSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#a855f7" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ChevronRight = () => (
  <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
    <path d="M1.5 1.5L6.5 6.5L1.5 11.5" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.62 10.79z"/>
  </svg>
);

const countries = [
  { flag: "🇺🇸", code: "+1", name: "United States" },
  { flag: "🇬🇧", code: "+44", name: "United Kingdom" },
  { flag: "🇩🇪", code: "+49", name: "Germany" },
  { flag: "🇫🇷", code: "+33", name: "France" },
  { flag: "🇳🇱", code: "+31", name: "Netherlands" },
  { flag: "🇸🇰", code: "+421", name: "Slovakia" },
  { flag: "🇨🇿", code: "+420", name: "Czech Republic" },
  { flag: "🇦🇹", code: "+43", name: "Austria" },
  { flag: "🇨🇭", code: "+41", name: "Switzerland" },
  { flag: "🇵🇱", code: "+48", name: "Poland" },
  { flag: "🇮🇹", code: "+39", name: "Italy" },
  { flag: "🇪🇸", code: "+34", name: "Spain" },
];

const brandLogos = [
  { name: "Volkswagen", viewBox: "0 0 24 24", d: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.046 3.268 2.506 6.232H9.54zm-1.076.233L7.164 9.5H3.268l4.313-3.14zm2.262 0 3.296 2.86L20.732 9.5h-4.896zM3.07 10.5h4.47l1.69 4.373zm5.578 0h6.704L12 19.164zm7.812 0h4.468L14.77 14.872zm-8.71 5.482 2.455 4.75-5.865-4.164zm6.64 0 3.41.586-5.866 4.163z" },
  { name: "Nike", viewBox: "0 0 24 24", d: "M24 7.8L6.442 15.276c-1.456.617-2.679.925-3.668.925-1.139 0-1.965-.413-2.502-1.234C-.533 13.498.967 11.18 4.8 8.832c2.147-1.348 4.936-2.75 8.16-3.893z" },
  { name: "Apple", viewBox: "0 0 24 24", d: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.541 9.103 1.519 12.09 1.013 1.463 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.925-.987 1.838 0 2.354.987 3.96.948 1.638-.026 2.677-1.485 3.676-2.948 1.156-1.688 1.638-3.325 1.663-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.632-2.324-4.409-2.376-2-.156-3.675 1.09-4.816 1.09zm4.717-3.26c.78-.95 1.304-2.383 1.152-3.962-1.12.043-2.482.751-3.284 1.701-.726.885-1.362 2.3-1.189 3.233 1.248.111 2.522-.598 3.321-2.972z" },
  { name: "Spotify", viewBox: "0 0 24 24", d: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" },
  { name: "Google", viewBox: "0 0 24 24", d: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" },
  { name: "Microsoft", viewBox: "0 0 24 24", d: "M0 0h11.5v11.5H0zm12.5 0H24v11.5H12.5zM0 12.5h11.5V24H0zm12.5 0H24V24H12.5z" },
  { name: "X", viewBox: "0 0 24 24", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "LinkedIn", viewBox: "0 0 24 24", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
];

const reviews = [
  {
    quote: "Our front desk used to miss calls constantly during patient hours. Since switching to AI Receptionist, every call is answered 24/7, appointments are booked automatically, and our staff can focus on patients.",
    name: "Dr. Amanda Reyes",
    role: "Family Medicine Practice",
    av: "AR",
  },
  {
    quote: "I used to lose clients because I couldn't answer the phone on a job site. AI Receptionist handles every inbound call, qualifies the lead, and texts me a summary. Closed three new clients this month I would have missed.",
    name: "Mike Donovan",
    role: "Owner, Plumbing & Drain Services",
    av: "MD",
  },
  {
    quote: "My front desk was overwhelmed with booking calls. Set up AI Receptionist in less than 20 minutes. Now it handles all appointment scheduling while my team focuses on clients.",
    name: "Jasmine Torres",
    role: "Owner, Day Spa",
    av: "JT",
  },
  {
    quote: "I'm a one-person agency and I can't always pick up. AI Receptionist qualifies every caller, captures their details, and books showings into my calendar. Like having a full-time receptionist at a fraction of the cost.",
    name: "Brian Callahan",
    role: "Independent Realtor",
    av: "BC",
  },
];

const faqs = [
  {
    q: "How quickly can I get AI Receptionist up and running?",
    a: "Setup takes under 10 minutes. Describe your business, choose your preferences, and the AI is ready to take calls immediately. No coding or technical skills required.",
  },
  {
    q: "Will callers know they're talking to an AI?",
    a: "Our AI sounds natural and conversational. Many customers report that callers can't tell the difference. You can also configure the AI to be transparent about being an assistant.",
  },
  {
    q: "What happens if the AI can't handle a call?",
    a: "The AI makes decisions based on the context you provide, which eliminates most issues. If it can't resolve a situation, it can schedule a callback or transfer the call to you directly.",
  },
  {
    q: "Does it integrate with my existing calendar and CRM?",
    a: "Yes. AI Receptionist integrates natively with Google Calendar, Outlook, HubSpot, Salesforce, Calendly, and many more. Custom integrations available via our API.",
  },
  {
    q: "Is my data secure?",
    a: "All call data is encrypted in transit and at rest. We comply with GDPR and HIPAA requirements. Your data is never shared with third parties or used to train AI models.",
  },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+1");

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const inter: React.CSSProperties = {
    fontFamily: "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: 300,
  };

  return (
    <main style={{ ...inter, background: "#fff", color: "#333", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .hero-trust-star.half {
          background: linear-gradient(90deg, #111 50%, #ddd 50%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ── HEADER ── */}
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
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Pricing", href: "#pricing" },
            ].map((l) => (
              <a key={l.label} href={l.href} style={{ color: "#333", fontSize: "14px", fontWeight: 400, textDecoration: "none", transition: "color 0.15s" }}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <a href="#pricing" style={{
          display: "inline-flex", alignItems: "center", height: "36px", padding: "0 20px",
          background: "#000", color: "#fff",
          border: "1.5px solid #000",
          borderRadius: "20px", fontSize: "12px", fontWeight: 400, textDecoration: "none",
          letterSpacing: "0.06em", transition: "all 0.25s",
        }}>
          START FREE TRIAL
        </a>
      </header>

      {/* ── HERO ── */}
      <section style={{
        position: "relative", background: "#fff", minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: "110px", overflow: "hidden",
      }}>
        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "860px", padding: "0 24px", textAlign: "center" }}>

          {/* Badge */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#f5f5f5", border: "1px solid #e8e8e8", borderRadius: "20px", padding: "6px 16px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ color: "#555", fontSize: "13px", fontWeight: 300 }}>AI calls made easy</span>
            </div>
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(38px, 6.5vw, 76px)", fontWeight: 300, letterSpacing: "-0.03em", color: "#111", lineHeight: 1.04, marginBottom: "44px" }}>
            Let our AI take care of your calls
          </h1>

          {/* CTA Card */}
          <div style={{ maxWidth: "480px", margin: "0 auto 64px" }}>
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Phone input row with flag selector */}
              <div style={{ display: "flex", alignItems: "center", background: "#f8f8f8", border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", flexShrink: 0, borderRight: "1px solid #e8e8e8" }}>
                  <select
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    style={{ appearance: "none", WebkitAppearance: "none", background: "transparent", border: "none", padding: "13px 28px 13px 12px", fontSize: "14px", fontWeight: 300, color: "#111", cursor: "pointer", outline: "none", fontFamily: "var(--font-inter), Inter, sans-serif" }}
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: "8px", pointerEvents: "none", color: "#999", fontSize: "10px" }}>▼</span>
                </div>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  style={{ flex: 1, background: "transparent", border: "none", padding: "13px 16px", color: "#111", fontSize: "14px", fontWeight: 300, fontFamily: "var(--font-inter), Inter, sans-serif", outline: "none" }}
                />
              </div>
              {/* Button full width */}
              <button
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#000", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 20px", fontSize: "14px", fontWeight: 400, cursor: "pointer", fontFamily: "var(--font-inter), Inter, sans-serif", letterSpacing: "0.01em", transition: "opacity 0.2s" }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
              >
                <PhoneIcon />
                Talk to our AI now
              </button>
              <p style={{ color: "#aaa", fontSize: "11px", textAlign: "center", marginTop: "2px", fontWeight: 300 }}>
                By making this call, you consent to being{" "}
                <a href="/privacy-policy" style={{ color: "#888", textDecoration: "underline" }}>contacted by us</a>
                {" "}and confirm to have read our{" "}
                <a href="/privacy-policy" style={{ color: "#888", textDecoration: "underline" }}>privacy policy</a>.
              </p>
            </div>
          </div>

          {/* Trust bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "18px 0 4px", marginTop: "12px", marginBottom: "52px", justifyContent: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", marginRight: "-4px" }}>
              {[
                { src: "/testimonials/maria_sm.webp", alt: "Maria, AI Receptionist user" },
                { src: "/testimonials/mustafa_sm.webp", alt: "Mustafa, AI Receptionist user" },
                { src: "/testimonials/saheed_sm.webp", alt: "Saheed, AI Receptionist user" },
                { src: "/testimonials/delphine_sm.webp", alt: "Delphine, AI Receptionist user" },
              ].map((av, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={av.src} alt={av.alt} width={32} height={32} loading="lazy"
                  style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "none", marginRight: i < 3 ? "-8px" : "0" }}
                />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontSize: "14px", fontWeight: 400, color: "#111", letterSpacing: "-0.01em" }}>9,500+ users worldwide</span>
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#666" }}>Got every call answered 24/7.</span>
            </div>
            <div style={{ width: "1px", height: "28px", background: "#e0e0e0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#555", lineHeight: 1.4, fontWeight: 400, letterSpacing: "-0.01em" }}>
                  Rated top-notch<br />
                  1,200+ reviews
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {["★", "★", "★", "★", "★"].map((s, i) => (
                    <span key={i} style={{ fontSize: "20px", color: "#111" }}>{s}</span>
                  ))}
                </div>
                <span style={{ fontSize: "12px", fontWeight: 400, color: "#666" }}>4.8 out of 5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logo marquee */}
        <div style={{ width: "100%", overflow: "hidden", paddingTop: "30px", paddingBottom: "48px" }}>
          <div className="marquee-inner">
            {[...brandLogos, ...brandLogos, ...brandLogos, ...brandLogos].map((brand, i) => (
              <div key={i} style={{ padding: "0 52px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={28} height={28} viewBox={brand.viewBox} fill="currentColor" style={{ color: "#c8c8c8" }} aria-label={brand.name}>
                  <path d={brand.d} />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ── */}
      <section style={{ padding: "100px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.025em", color: "#111" }}>
              Customer reviews
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: "18px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", transition: "box-shadow 0.2s", cursor: "default" }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)")}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "none")}
              >
                <div style={{ display: "flex", gap: "2px" }}>
                  {[...Array(5)].map((_, j) => <StarSvg key={j} />)}
                </div>
                <p style={{ fontSize: "14px", color: "#444", lineHeight: 1.72, fontWeight: 300, flexGrow: 1 }}>"{r.quote}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 500, flexShrink: 0 }}>
                    {r.av}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: "#111", fontSize: "13px" }}>{r.name}</div>
                    <div style={{ color: "#aaa", fontSize: "12px", fontWeight: 300 }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "100px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ textAlign: "center", maxWidth: "640px", margin: "0 auto 56px" }}>
            <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.025em", color: "#111", marginBottom: "16px" }}>
              Ready to go in under 10 minutes.
            </h2>
            <p style={{ fontSize: "16px", color: "#888", fontWeight: 300, lineHeight: 1.6 }}>
              Anyone can get AI Receptionist up and running — no coding skills required.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {[
              { num: "01", title: "Create your AI receptionist", desc: "Select a voice, language, and a welcome message tailored to your business.", bg: "#f5f3ff" },
              { num: "02", title: "Define in-call behavior", desc: "Set up call handling — appointment booking, FAQ answers, routing rules, and post-call summaries.", bg: "#eff6ff" },
              { num: "03", title: "Let the AI take your calls", desc: "The AI connects to a new number or your existing line. Live immediately, 24/7.", bg: "#f0fdf4" },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: "20px", padding: "32px", border: "1px solid rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "36px", height: "36px", background: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 500, color: "#111", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flexShrink: 0 }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#111", lineHeight: 1.35 }}>{s.title}</h3>
                </div>
                <p style={{ fontSize: "14px", color: "#666", fontWeight: 300, lineHeight: 1.65 }}>{s.desc}</p>
                <div style={{ marginTop: "28px", height: "148px", background: "rgba(0,0,0,0.04)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "52px", fontWeight: 200, color: "rgba(0,0,0,0.1)", letterSpacing: "-0.04em" }}>{s.num}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section id="features" style={{ background: "#f8f8f8", padding: "100px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "40px", marginBottom: "56px", flexWrap: "wrap" }}>
            <div style={{ maxWidth: "520px" }}>
              <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.025em", color: "#111", marginBottom: "16px" }}>
                Use cases
              </h2>
              <p style={{ fontSize: "16px", color: "#888", fontWeight: 300, lineHeight: 1.65 }}>
                Our AI phone assistant adapts flexibly to your needs and integrates with your calendar and CRM. Automated calls that make sense.
              </p>
            </div>
            <a href="#pricing" style={{ display: "inline-flex", alignItems: "center", height: "42px", padding: "0 22px", background: "#000", color: "#fff", borderRadius: "20px", fontSize: "13px", fontWeight: 400, textDecoration: "none", letterSpacing: "0.02em", transition: "opacity 0.2s", flexShrink: 0 }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              Start Free Trial
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", background: "#e8e8e8", borderRadius: "16px", overflow: "hidden", border: "1px solid #e8e8e8", gap: "1px" }}>
            {[
              { icon: "💼", title: "Reception & Routing", desc: "Takes incoming calls and forwards them to the appropriate contact person." },
              { icon: "📝", title: "Call Transcription", desc: "Collects inquiries, transcribes them, and sends you a summary by email." },
              { icon: "🎧", title: "Customer Service", desc: "Handles customer inquiries around the clock with precisely defined behavior." },
              { icon: "📅", title: "Appointment Booking", desc: "Schedules appointments during the conversation with instant confirmation." },
              { icon: "🔁", title: "Order Processing", desc: "Fast 24/7 automated request handling — no waiting, no missed orders." },
              { icon: "⚡", title: "50+ More Options", desc: "Every business is different. Configure the AI to match your exact workflow." },
            ].map((uc, i) => (
              <div key={i} style={{ background: "#fff", padding: "28px 24px", transition: "background 0.2s", cursor: "default" }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "#fafafa")}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}
              >
                <div style={{ fontSize: "22px", marginBottom: "12px" }}>{uc.icon}</div>
                <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#111", marginBottom: "8px" }}>{uc.title}</h3>
                <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.65, fontWeight: 300 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section style={{ padding: "100px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.025em", color: "#111", marginBottom: "20px" }}>
                Integrations
              </h2>
              <p style={{ fontSize: "16px", color: "#666", fontWeight: 300, lineHeight: 1.7, marginBottom: "28px" }}>
                AI Receptionist connects with your existing tools — CRMs, calendar apps, and databases — via native integrations or our open API to accurately capture and retrieve data.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {["Google Calendar", "Outlook", "HubSpot", "Salesforce", "Zapier", "Calendly", "Twilio", "REST API"].map((t) => (
                  <span key={t} style={{ background: "#f5f5f5", border: "1px solid #ebebeb", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", color: "#555", fontWeight: 300 }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "#f8f8f8", borderRadius: "20px", height: "320px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ebebeb" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "24px" }}>
                {["Google Calendar", "HubSpot", "Salesforce", "Calendly", "Outlook", "Zapier"].map((t) => (
                  <div key={t} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#444", fontWeight: 300, textAlign: "center" }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "100px 0", background: "#f8f8f8" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.025em", color: "#111", marginBottom: "14px" }}>
              Simple, transparent pricing
            </h2>
            <p style={{ fontSize: "16px", color: "#888", fontWeight: 300, lineHeight: 1.6 }}>
              Start free. Upgrade when you need more. Cancel anytime.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
            {[
              { name: "Starter", price: "$29", desc: "Perfect for small businesses getting started", features: ["100 calls / month", "Appointment booking", "Email summaries", "1 phone number", "5 languages"], cta: "Start Free Trial", hi: false },
              { name: "Pro", price: "$79", desc: "For growing businesses with high call volume", features: ["500 calls / month", "Everything in Starter", "CRM integration", "3 phone numbers", "30+ languages", "Call routing", "Priority support"], cta: "Start Free Trial", hi: true },
              { name: "Business", price: "$199", desc: "For teams and multi-location businesses", features: ["Unlimited calls", "Everything in Pro", "Custom voice & persona", "10 phone numbers", "API access", "Dedicated support"], cta: "Contact Sales", hi: false },
            ].map((plan) => (
              <div key={plan.name} style={{ borderRadius: "16px", padding: "28px", border: plan.hi ? "1.5px solid #111" : "1px solid #ececec", background: plan.hi ? "#111" : "#fff" }}>
                {plan.hi && <div style={{ fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Most Popular</div>}
                <div style={{ marginBottom: "22px" }}>
                  <div style={{ fontSize: "12px", color: plan.hi ? "rgba(255,255,255,0.38)" : "#aaa", marginBottom: "6px", letterSpacing: "0.03em" }}>{plan.name}</div>
                  <div style={{ fontSize: "36px", fontWeight: 300, letterSpacing: "-0.03em", color: plan.hi ? "#fff" : "#111" }}>
                    {plan.price}<span style={{ fontSize: "13px", color: plan.hi ? "rgba(255,255,255,0.28)" : "#bbb", fontWeight: 300 }}>/mo</span>
                  </div>
                  <p style={{ fontSize: "12px", marginTop: "8px", color: plan.hi ? "rgba(255,255,255,0.38)" : "#aaa", fontWeight: 300, lineHeight: 1.5 }}>{plan.desc}</p>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", display: "flex", flexDirection: "column", gap: "9px" }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 300, color: plan.hi ? "rgba(255,255,255,0.72)" : "#666" }}>
                      <span style={{ color: plan.hi ? "rgba(255,255,255,0.32)" : "#22c55e", fontSize: "11px", flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a href="#" style={{ display: "block", textAlign: "center", padding: "11px 0", borderRadius: "20px", fontSize: "13px", fontWeight: 400, textDecoration: "none", background: plan.hi ? "#fff" : "#000", color: plan.hi ? "#000" : "#fff", transition: "opacity 0.2s" }}
                  onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
                  onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "100px 0" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.025em", color: "#111" }}>
              Frequently Asked Questions
            </h2>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "16px", fontFamily: "var(--font-inter), Inter, sans-serif" }}
              >
                <span style={{ fontSize: "15px", fontWeight: 300, color: "#111" }}>{faq.q}</span>
                <span style={{ flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(90deg)" : "rotate(0deg)", display: "flex" }}>
                  <ChevronRight />
                </span>
              </button>
              {openFaq === i && (
                <div style={{ paddingBottom: "20px" }}>
                  <p style={{ color: "#666", fontSize: "14px", fontWeight: 300, lineHeight: 1.72, margin: 0 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "0 40px 100px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", background: "#f8f8f8", border: "1px solid #ebebeb", borderRadius: "24px", padding: "80px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% -10%, rgba(139,92,246,0.08) 0%, transparent 55%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 300, letterSpacing: "-0.025em", color: "#111", marginBottom: "16px" }}>
              Scalable call management with AI Receptionist.
            </h2>
            <p style={{ color: "#888", fontSize: "16px", fontWeight: 300, lineHeight: 1.65, maxWidth: "520px", margin: "0 auto 36px" }}>
              Try AI Receptionist and see how our AI automates your calls to reduce strain on your team — simple, efficient, and around the clock.
            </p>
            <a href="#pricing" style={{ display: "inline-flex", alignItems: "center", height: "46px", padding: "0 28px", background: "#000", color: "#fff", borderRadius: "23px", fontSize: "14px", fontWeight: 400, textDecoration: "none", transition: "opacity 0.2s" }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              Start Free Trial →
            </a>
            <p style={{ color: "#bbb", fontSize: "12px", marginTop: "14px", fontWeight: 300 }}>No credit card required.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#000", color: "#fff", fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif", fontWeight: 300 }}>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "60px 0 50px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
            <nav style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Product</span>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[{ label: "Features", href: "#features" }, { label: "How it works", href: "#how-it-works" }, { label: "Pricing", href: "#pricing" }, { label: "Integrations", href: "#" }, { label: "API Access", href: "#" }].map((l) => (
                    <li key={l.label}><a href={l.href} style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>{l.label}</a></li>
                  ))}
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Industries</span>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {["Dental Clinics", "Law Firms", "Medical Practices", "Hotels", "Auto Dealers", "Restaurants"].map((l) => (
                    <li key={l}><a href="#" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>{l}</a></li>
                  ))}
                </ul>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>Resources</span>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[{ label: "Blog", href: "#" }, { label: "FAQ", href: "#" }, { label: "Contact", href: "#" }, { label: "Documentation", href: "#" }].map((l) => (
                    <li key={l.label}><a href={l.href} style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>{l.label}</a></li>
                  ))}
                </ul>
              </div>
            </nav>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "32px" }}>
              <a href="#pricing" style={{ display: "inline-flex", alignItems: "center", height: "36px", padding: "0 20px", background: "#fff", color: "#000", borderRadius: "20px", fontSize: "12px", fontWeight: 400, textDecoration: "none", letterSpacing: "0.05em", transition: "opacity 0.2s" }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                START FREE TRIAL
              </a>
            </div>
          </div>
        </div>
        <div style={{ padding: "28px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", color: "#fff" }}>
              <PauseLogo color="#fff" />
              <span style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 500, fontSize: "16px", letterSpacing: "-0.02em", color: "#fff" }}>AI RECEPTIONIST</span>
            </a>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[{ label: "Privacy Policy", href: "#" }, { label: "Terms & Conditions", href: "#" }, { label: "Cookie Policy", href: "#" }].map((l) => (
                <li key={l.label}><a href={l.href} style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 300, textDecoration: "none", letterSpacing: "0.02em", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>{l.label}</a></li>
              ))}
            </ul>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", fontWeight: 300, margin: 0 }}>© 2026 AI Receptionist Now. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
