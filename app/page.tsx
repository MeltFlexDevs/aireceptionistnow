"use client";

import { useState, useEffect, type ReactNode } from "react";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import VoiceOrb from "./components/VoiceOrb";
import { siteUrl, siteName, siteDescription } from "@/lib/site";
import { PLANS } from "@/lib/plans";


const StarSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#111" xmlns="http://www.w3.org/2000/svg">
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

const UseCaseIcon = ({ name }: { name: string }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<string, ReactNode> = {
    briefcase: (
      <>
        <rect x="2.5" y="7" width="19" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M2.5 12.5h19" />
      </>
    ),
    transcript: (
      <>
        <path d="M5 3h11l3 3v15a0 0 0 0 1 0 0H5a0 0 0 0 1 0 0V3Z" />
        <path d="M8 9h6M8 13h8M8 17h5" />
      </>
    ),
    headset: (
      <>
        <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
        <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
        <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
        <path d="M20 19v.5a3 3 0 0 1-3 3h-2.5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="16.5" rx="2" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
        <path d="M7.5 14h2M14.5 14h2M7.5 17.5h2M14.5 17.5h2" />
      </>
    ),
    package: (
      <>
        <path d="M21 16V8l-9-5-9 5v8l9 5 9-5Z" />
        <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
      </>
    ),
    grid: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <path d="M17 14.5v6M14 17.5h6" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
};

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
  { quote: "Our front desk used to miss calls constantly during patient hours. Now every single call gets answered 24/7 and appointments just book themselves. Staff can finally focus on patients.", name: "Dr. Amanda Reyes", role: "Family Medicine", photo: "/testimonials/sarah.jpg" },
  { quote: "couldn't pick up on a job site so I was losing clients every week. This thing answers every call, qualifies the lead and texts me a summary. closed 3 jobs this month I would've missed.", name: "Mike Donovan", role: "Plumbing & Drain", photo: "/testimonials/james.jpg" },
  { quote: "Set it up in like 20 minutes during my lunch break. Now it handles all the booking calls while my team works on clients. honestly wish I'd done this a year ago.", name: "Jasmine Torres", role: "Day Spa", photo: "/testimonials/emma.jpg" },
  { quote: "One person agency here, I can't always answer. It qualifies every caller, grabs their details and books showings straight into my calendar. like a full time receptionist for nothing.", name: "Brian Callahan", role: "Realtor", photo: "/testimonials/michael.jpg" },
  { quote: "We were paying two people just to answer phones. Now the AI takes the overflow and after hours calls. Cut our front desk costs almost in half.", name: "Priya Sharma", role: "Dental Clinic", photo: "/testimonials/priya.jpg" },
  { quote: "the voice is shockingly natural. Half my customers have no idea theyre talking to an AI. Books the appointment, confirms it, done.", name: "Carlos Mendez", role: "Auto Repair Shop", photo: "/testimonials/carlos.jpg" },
  { quote: "missed calls were killing us at night. now every after hours call gets answered and I get a text recap in the morning. game changer for a small firm.", name: "Rachel Goodwin", role: "Law Office", photo: "/testimonials/rachel.jpg" },
  { quote: "Setup was way easier than I expected. Described my business, picked a few options and it was taking calls same day. No tech skills needed at all.", name: "Tom Bradley", role: "HVAC Services", photo: "/testimonials/thomas.jpg" },
  { quote: "It pushes every booking right into my calendar and never double books. Friday nights used to be chaos answering the phone, not anymore.", name: "Nina Petrova", role: "Hair Salon", photo: "/testimonials/anna.jpg" },
  { quote: "honestly skeptical at first but it handles weird questions better than my old answering service did. and it's a fraction of the price.", name: "Derek Olsen", role: "Roofing Contractor", photo: "/testimonials/henrik.jpg" },
  { quote: "We get a lot of Spanish speaking callers and it switches languages no problem. captures everything and emails me the lead instantly.", name: "Sofia Ramirez", role: "Insurance Agency", photo: "/testimonials/maria.jpg" },
  { quote: "phones ring nonstop during dinner rush. now the AI takes reservations and to-go orders while we cook. saved us so many lost tables.", name: "Marco Bianchi", role: "Restaurant", photo: "/testimonials/marco.jpg" },
  { quote: "It books consults, answers pricing questions and sends me a summary of every call. feels like I hired a receptionist without the payroll.", name: "Hannah Cole", role: "Med Spa", photo: "/testimonials/sophie.jpg" },
  { quote: "I run the shop alone and can't stop mid job to grab the phone. it answers, qualifies, and texts me whats urgent. closed more work this month than ever.", name: "Wes Carter", role: "Electrician", photo: "/testimonials/sean.jpg" },
  { quote: "switched from a call center that kept messing up bookings. this never gets the appointment wrong and it actually sounds friendly.", name: "Linda Park", role: "Chiropractic Clinic", photo: "/testimonials/lisa.jpg" },
  { quote: "the after hours coverage alone paid for itself. people call at 9pm and still get booked. no more voicemail tag.", name: "Greg Sullivan", role: "Pest Control", photo: "/testimonials/david.jpg" },
  { quote: "tried it on the free plan first and it already booked 4 appointments the first week. upgraded the same day. easy decision.", name: "Aisha Khan", role: "Nail Studio", photo: "/testimonials/delphine.jpg" },
  { quote: "integrates straight into our calendar and CRM so nothing gets lost. setup took one evening and it's been running flawless since.", name: "Daniel Wright", role: "Real Estate Team", photo: "/testimonials/oliver.jpg" },
];

const faqs = [
  {
    q: "What is an AI receptionist?",
    a: "An AI receptionist is a virtual phone assistant that answers your business calls automatically, 24/7. It greets callers in a natural voice, answers questions, qualifies leads, books appointments, and sends you a summary of every call — so you never miss a customer, even after hours or during busy periods.",
  },
  {
    q: "How does an AI phone answering service work?",
    a: "AI Receptionist connects to a dedicated phone number or your existing business line. When someone calls, the AI picks up instantly, holds a natural conversation, and follows the instructions you set up — answering FAQs, capturing caller details, routing the call, or scheduling appointments directly into your calendar. You get a transcript and summary by email or text after each call.",
  },
  {
    q: "Can the AI receptionist answer calls 24/7?",
    a: "Yes. AI Receptionist answers every call around the clock — nights, weekends, holidays, and during call overflow — with no hold times and no voicemail. Businesses that switch typically stop losing leads to missed and after-hours calls within the first week.",
  },
  {
    q: "How quickly can I set up AI Receptionist?",
    a: "Setup takes under 10 minutes. Describe your business, choose a voice and language, set how calls should be handled, and the AI is ready to take calls the same day. No coding or technical skills required.",
  },
  {
    q: "Will callers know they're talking to an AI?",
    a: "The AI sounds natural and conversational, and many callers can't tell the difference. You stay in control: you can have the AI introduce itself as a virtual assistant or keep the experience seamless — whatever fits your brand.",
  },
  {
    q: "Can it book appointments and integrate with my calendar and CRM?",
    a: "Yes. AI Receptionist books appointments during the call and integrates natively with Google Calendar, Outlook, HubSpot, Salesforce, and Calendly, plus thousands of apps through Zapier. Custom integrations are available via our open API, so caller data flows straight into the tools you already use.",
  },
  {
    q: "What languages does the AI receptionist support?",
    a: "The AI handles calls in 30+ languages and can switch languages mid-conversation based on the caller — ideal for businesses that serve multilingual customers and want every caller to feel understood.",
  },
  {
    q: "What happens if the AI can't handle a call?",
    a: "The AI makes decisions from the context you provide, which resolves the vast majority of calls on its own. If a request falls outside its scope, it can capture the details, schedule a callback, or transfer the call to you or a team member in real time.",
  },
  {
    q: "How much does an AI receptionist cost?",
    a: "You can start for free and only upgrade when you need more calls or features. An AI receptionist costs a fraction of hiring front-desk staff or an answering service, while answering every call 24/7 — most businesses recover the cost from the extra booked jobs and recovered missed calls.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All call data is encrypted in transit and at rest. We comply with GDPR and HIPAA requirements, and your data is never sold, shared with third parties, or used to train external AI models.",
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+1");
  const [flagOpen, setFlagOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callMsg, setCallMsg] = useState<string | null>(null);

  async function placeTestCall() {
    const to = `${dialCode}${phone.replace(/[^\d]/g, "")}`;
    if (!/^\+[1-9]\d{6,15}$/.test(to)) {
      setCallMsg("Enter a valid phone number.");
      return;
    }
    setCalling(true);
    setCallMsg(null);
    try {
      const res = await fetch("/api/test-call", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      setCallMsg(
        data.ok ? "Calling you now, pick up your phone!" : data.error || "Couldn't place the call.",
      );
    } catch {
      setCallMsg("Couldn't place the call. Try again.");
    } finally {
      setCalling(false);
    }
  }

  const inter: React.CSSProperties = {
    fontFamily: "var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: 300,
  };

  const prices = PLANS.map((p) => p.monthlyAmountCents / 100);
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    url: siteUrl,
    description: siteDescription,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: String(Math.min(...prices)),
      highPrice: String(Math.max(...prices)),
      offerCount: PLANS.length,
      url: `${siteUrl}/pricing`,
    },
  };

  return (
    <main style={{ ...inter, background: "#fff", color: "#333", minHeight: "100vh", overflowX: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
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
        .badge.main-lp {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border-radius: 10px;
          padding: 6px 16px;
        }
        .badge-icon {
          width: 16px;
          height: 16px;
          object-fit: contain;
        }
        .badge-text {
          color: #111;
          font-size: 13px;
          font-weight: 300;
          font-family: var(--font-inter), Inter, sans-serif;
          margin: 0;
        }
        /* How it works — Fonio 1:1 (exact CSS, our font) */
        .hiw-vars {
          --hiw-secondary-text: #555b6e;
          --hiw-primary-text: #0f0f16;
          --hiw-secondary-bg: #f7f8fc;
          --hiw-border: #e1e3f4;
          --hiw-card-radius: 12px;
          --hiw-small-radius: 10px;
          --hiw-max-container: 80rem;
          --hiw-margin-desktop: 4rem;
        }
        .hiw-vars .container {
          z-index: 1;
          width: 100%;
          max-width: var(--hiw-max-container);
          padding-left: var(--hiw-margin-desktop);
          padding-right: var(--hiw-margin-desktop);
          margin-left: auto;
          margin-right: auto;
          display: block;
        }
        .hiw-vars .section-header { margin-bottom: 2rem; }
        .hiw-vars .section-header.align-center { text-align: center; }
        .hiw-vars .section-header.align-center.width-40rem {
          width: 40rem;
          max-width: 40rem;
          margin-left: auto;
          margin-right: auto;
        }
        .hiw-vars .h2 {
          font-family: var(--font-inter), Inter, sans-serif;
          text-wrap: balance;
          margin-bottom: 8px;
          font-size: clamp(28px, 3.5vw, 42px);
          font-weight: 300;
          letter-spacing: -0.025em;
          line-height: 1.1;
          text-transform: uppercase;
          color: #111;
        }
        .hiw-vars .section-header > p {
          font-family: var(--font-inter), Inter, sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #888;
          margin: 0;
        }
        .hiw-vars ._4rem-margin-top { margin-top: 4rem; }
        .hiw-vars ._0-5rem-margin-top { margin-top: 0.5rem; }
        .hiw-vars .grid_3col {
          grid-column-gap: 16px;
          grid-row-gap: 16px;
          grid-template-columns: 1fr 1fr 1fr;
          grid-auto-columns: 1fr;
          display: grid;
        }
        .hiw-vars .how-it-works_card {
          border: 1px solid var(--hiw-border);
          border-radius: var(--hiw-card-radius);
          flex-flow: column;
          justify-content: space-between;
          align-items: stretch;
          height: 100%;
          display: flex;
        }
        .hiw-vars .steps-text_container {
          grid-column-gap: 0.5rem;
          grid-row-gap: 0.5rem;
          flex-flow: column;
          padding: 2rem 2rem 0;
          display: flex;
        }
        .hiw-vars .steps-heading_wrapper {
          flex-flow: column;
          font-weight: 400;
          letter-spacing: -0.01em;
          display: flex;
        }
        .hiw-vars .card-icon_wrapper {
          border-radius: var(--hiw-small-radius);
          background-color: var(--hiw-secondary-bg);
          justify-content: center;
          align-items: center;
          width: 2rem;
          height: 2rem;
          margin-bottom: 1rem;
          display: flex;
        }
        .hiw-vars .text-size-big {
          font-size: 1.25rem;
          line-height: 1.25;
          margin-bottom: 0;
        }
        .hiw-vars .inline-text { display: inline; }
        .hiw-vars .text-color-secondary { color: var(--hiw-secondary-text); }
        .hiw-vars .flex-vertical-stretch {
          grid-column-gap: 1rem;
          grid-row-gap: 1rem;
          flex-flow: column;
          display: flex;
          position: relative;
        }
        .hiw-vars .flex-vertical-stretch.space-between {
          grid-column-gap: 0;
          grid-row-gap: 0;
          justify-content: space-between;
          height: 100%;
        }
        .hiw-vars .bg-image-frame {
          background-color: var(--hiw-secondary-bg);
          background-image: url(https://cdn.prod.website-files.com/66cdd640b6eaf9b4ea2f21c8/6989e6db045752228c165493_Half-Circle_BG.webp);
          background-position: 50% 100%;
          background-repeat: no-repeat;
          background-size: 100% 120%;
          border-radius: 12px;
          justify-content: center;
          align-items: center;
          display: flex;
          overflow: hidden;
        }
        .hiw-vars .bg-image-frame.is-how-it-works {
          background-image: linear-gradient(155deg, #cdbef5 0%, #e4d6f2 44%, #ffd9c0 100%);
          aspect-ratio: 1 / 1;
          width: 100%;
          display: block;
          position: relative;
          overflow: hidden;
        }
        .hiw-vars .bleed-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 0;
          box-shadow: none;
          object-fit: cover;
          object-position: 50% 20%;
          transform: scale(1.5);
          transform-origin: 50% 20%;
          display: block;
        }
        /* pastel "voice" tint so the cards match the hero orb palette */
        .hiw-vars .hiw-tint {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(155deg, #b9a6f0 0%, rgba(255,255,255,0) 46%, #ffc59a 100%);
          mix-blend-mode: soft-light;
          opacity: 0.85;
        }
        .hiw-vars .hiw-tint::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(120% 80% at 50% 6%, rgba(183,148,244,0.28), rgba(183,148,244,0) 60%);
          mix-blend-mode: multiply;
        }
        @media (max-width: 991px) {
          .hiw-vars .grid_3col { flex-flow: column; display: flex; }
          .hiw-vars .section-header.align-center.width-40rem { width: auto; }
          .hiw-vars .h2 { font-size: 1.75rem; line-height: 1.25; }
        }
        @media (max-width: 767px) {
          .hiw-vars .container { padding-left: 5%; padding-right: 5%; }
        }
        .reviews-masonry {
          columns: 4;
          column-gap: 16px;
        }
        @media (max-width: 1024px) {
          .reviews-masonry { columns: 3; }
        }
        @media (max-width: 768px) {
          .reviews-masonry { columns: 2; }
        }
        @media (max-width: 480px) {
          .reviews-masonry { columns: 1; }
        }
        /* ── MOBILE RESPONSIVE (inline styles → need !important) ── */
        @media (max-width: 768px) {
          .lp-section { padding-top: 60px !important; padding-bottom: 60px !important; }
          .lp-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .lp-hero { padding-top: 92px !important; min-height: auto !important; }
          .cta-outer { padding-left: 20px !important; padding-right: 20px !important; }
          .cta-card { padding: 48px 24px !important; border-radius: 20px !important; }
          .lp-marquee-item { padding-left: 32px !important; padding-right: 32px !important; }
        }
        @media (max-width: 860px) {
          .hero-h1 { white-space: normal !important; padding: 0 16px; }
        }
        @media (max-width: 680px) {
          .hero-h1 {
            font-size: clamp(30px, 8.5vw, 44px) !important;
            line-height: 1.1 !important;
            margin-bottom: 32px !important;
          }
        }
        @media (max-width: 600px) {
          .trust-divider { display: none !important; }
        }
        /* iOS zooms the page when a focused input's font-size is < 16px.
           Bump the phone field to 16px on mobile so entering a number never zooms. */
        @media (max-width: 600px) {
          .phone-input { font-size: 16px !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <SiteHeader />

      {/* ── HERO ── */}
      <section className="lp-hero" style={{
        position: "relative", background: "#fff", minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: "110px", overflow: "hidden",
      }}>
        {/* H1 — direct flex child so section's alignItems:center truly centers it */}
        <h1 className="hero-h1" style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(34px, 5vw, 62px)", fontWeight: 300, letterSpacing: "-0.02em", color: "#111", lineHeight: 1.06, marginTop: "56px", marginBottom: "44px", whiteSpace: "normal", textWrap: "balance", textTransform: "uppercase", position: "relative", zIndex: 2, textAlign: "center", maxWidth: "16ch", paddingLeft: "16px", paddingRight: "16px" }}>
          Let our AI take care of your calls
        </h1>

        <VoiceOrb />

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "860px", padding: "0 24px", textAlign: "center" }}>
          {/* CTA Card */}
          <div style={{ maxWidth: "380px", margin: "0 auto 64px" }}>
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Phone input row with flag selector */}
              <div style={{ display: "flex", alignItems: "center", background: "#f8f8f8", border: "1px solid #e8e8e8", borderRadius: "10px", overflow: "visible", position: "relative" }}>
                {/* Custom flag picker */}
                <div style={{ position: "relative", flexShrink: 0, borderRight: "1px solid #e8e8e8" }}>
                  <button
                    onClick={() => setFlagOpen(!flagOpen)}
                    style={{ display: "flex", alignItems: "center", gap: "4px", background: "transparent", border: "none", padding: "10px 10px", cursor: "pointer", lineHeight: 1 }}
                  >
                    <span style={{ fontSize: "22px" }}>{countries.find(c => c.code === dialCode)?.flag}</span>
                    <span style={{ fontSize: "9px", color: "#999" }}>▼</span>
                  </button>
                  {flagOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#fff", border: "1px solid #e8e8e8", borderRadius: "10px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 200, minWidth: "140px", maxHeight: "220px", overflowY: "auto" }}>
                      {countries.map(c => (
                        <button
                          key={c.code}
                          onClick={() => { setDialCode(c.code); setFlagOpen(false); }}
                          style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                        >
                          <span style={{ fontSize: "20px" }}>{c.flag}</span>
                          <span style={{ fontSize: "13px", color: "#333", fontFamily: "var(--font-inter), Inter, sans-serif" }}>{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  className="phone-input"
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
                onClick={placeTestCall}
                disabled={calling}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#000", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 20px", fontSize: "14px", fontWeight: 400, cursor: calling ? "default" : "pointer", opacity: calling ? 0.7 : 1, fontFamily: "var(--font-inter), Inter, sans-serif", letterSpacing: "0.01em", transition: "opacity 0.2s" }}
                onMouseOver={(e) => { if (!calling) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                onMouseOut={(e) => { if (!calling) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
              >
                <PhoneIcon />
                {calling ? "Calling..." : "Talk to our AI now"}
              </button>
              {callMsg && (
                <p style={{ color: "#444", fontSize: "12px", textAlign: "center", fontWeight: 300, margin: 0 }}>{callMsg}</p>
              )}
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
            <div className="trust-divider" style={{ width: "1px", height: "28px", background: "#e0e0e0" }} />
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
              <div key={i} className="lp-marquee-item" style={{ padding: "0 52px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={28} height={28} viewBox={brand.viewBox} fill="currentColor" style={{ color: "#c8c8c8" }} aria-label={brand.name}>
                  <path d={brand.d} />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ── */}
      <section className="lp-section" style={{ padding: "100px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.025em", textTransform: "uppercase", color: "#111", margin: "0 0 8px" }}>
              Loved by busy businesses
            </h2>
            <p style={{ fontSize: "15px", color: "#888", fontWeight: 300, margin: 0 }}>
              Thousands of calls answered every day, never a missed one.
            </p>
          </div>
          <div className="reviews-masonry">
            {reviews.map((r, i) => (
              <div key={i} style={{ breakInside: "avoid-column", marginBottom: "16px", padding: "24px", borderRadius: "12px", border: "1px solid #f0f0f0", background: "#fff", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={r.photo} alt={r.name} width={36} height={36} loading="lazy" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontWeight: 400, color: "#111", fontSize: "13px" }}>{r.name}</div>
                    <div style={{ color: "#bbb", fontSize: "10px", fontWeight: 300, letterSpacing: "0.5px" }}>{r.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[...Array(5)].map((_, j) => <StarSvg key={j} />)}
                </div>
                <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6, fontWeight: 300, fontStyle: "italic", margin: 0 }}>&ldquo;{r.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section hiw-vars lp-section" style={{ padding: "100px 0" }}>
        <div className="container">
          <div className="section-header align-center width-40rem">
            <h2 className="h2">Ready to go in under 10 minutes.</h2>
            <p>Anyone can get AI Receptionist up and running—no coding skills required.</p>
          </div>
          <div className="_4rem-margin-top">
            <div className="grid_3col">
              <div className="how-it-works_card">
                <div className="steps-text_container">
                  <div className="steps-heading_wrapper">
                    <div className="card-icon_wrapper"><div>01</div></div>
                    <p className="text-size-big inline-text">Create AI phone assistants</p>
                  </div>
                  <p className="text-color-secondary">Select voice, language, and a welcome message.</p>
                </div>
                <div className="_0-5rem-margin-top">
                  <div className="flex-vertical-stretch space-between">
                    <div className="bg-image-frame is-how-it-works">
                      <img alt="Create your AI receptionist on iPhone" src="/how-it-works/create.webp" loading="lazy" className="bleed-image" />
                      <div className="hiw-tint" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="how-it-works_card">
                <div className="steps-text_container">
                  <div className="steps-heading_wrapper">
                    <div className="card-icon_wrapper"><div>02</div></div>
                    <p className="text-size-big inline-text">Define in-call behavior and post-processing</p>
                  </div>
                  <p className="text-color-secondary">Set up different call handling and choose how you want to receive the transcripts.</p>
                </div>
                <div className="_0-5rem-margin-top">
                  <div>
                    <div className="bg-image-frame is-how-it-works">
                      <img alt="Define in-call behavior on iPhone" src="/how-it-works/behavior.webp" loading="lazy" className="bleed-image" />
                      <div className="hiw-tint" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="how-it-works_card">
                <div className="steps-text_container">
                  <div className="steps-heading_wrapper">
                    <div className="card-icon_wrapper"><div>03</div></div>
                    <p className="text-size-big inline-text">Let the AI take your phone calls</p>
                  </div>
                  <p className="text-color-secondary">The AI will be linked to an AI Receptionist phone number or your own phone system.</p>
                </div>
                <div className="_0-5rem-margin-top">
                  <div className="flex-vertical-stretch space-between">
                    <div className="bg-image-frame is-how-it-works">
                      <img alt="The AI taking a phone call on iPhone" src="/how-it-works/call.webp" loading="lazy" className="bleed-image" />
                      <div className="hiw-tint" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section id="features" className="lp-section" style={{ background: "#000", padding: "100px 0" }}>
        <div className="lp-pad" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "40px", marginBottom: "56px", flexWrap: "wrap" }}>
            <div style={{ maxWidth: "520px" }}>
              <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.025em", textTransform: "uppercase", color: "#fff", marginBottom: "16px" }}>
                Use cases
              </h2>
              <p style={{ fontSize: "16px", color: "#999", fontWeight: 300, lineHeight: 1.65 }}>
                Our AI phone assistant adapts flexibly to your needs and integrates with your calendar and CRM. Automated calls that make sense.
              </p>
            </div>
            <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", height: "42px", padding: "0 22px", background: "#fff", color: "#000", borderRadius: "20px", fontSize: "13px", fontWeight: 400, textDecoration: "none", letterSpacing: "0.02em", transition: "opacity 0.2s", flexShrink: 0 }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              Start Free Trial
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[
              { icon: "briefcase", title: "Reception & Routing", desc: "Takes incoming calls and forwards them to the appropriate contact person.", link: true },
              { icon: "transcript", title: "Call Transcription", desc: "Collects inquiries, transcribes them, and sends you a summary by email.", link: true },
              { icon: "headset", title: "Customer Service", desc: "Handles customer inquiries around the clock with precisely defined behavior.", link: true },
              { icon: "calendar", title: "Appointment Booking", desc: "Schedules appointments during the conversation with instant confirmation.", link: true },
              { icon: "package", title: "Order Processing", desc: "Fast 24/7 automated request handling — no waiting, no missed orders.", link: true },
              { icon: "grid", title: "50+ More Options", desc: "Every business is different. Configure the AI to match your exact workflow.", link: false },
            ].map((uc, i) => (
              <div key={i} style={{ background: "transparent", padding: "8px 4px", transition: "opacity 0.2s", cursor: uc.link ? "pointer" : "default" }}
                onMouseOver={(e) => {
                  const arrow = e.currentTarget.querySelector("[data-arrow]") as HTMLElement | null;
                  if (arrow) { arrow.style.opacity = "1"; arrow.style.transform = "translate(2px, -2px)"; }
                }}
                onMouseOut={(e) => {
                  const arrow = e.currentTarget.querySelector("[data-arrow]") as HTMLElement | null;
                  if (arrow) { arrow.style.opacity = "0"; arrow.style.transform = "translate(0, 0)"; }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                  <div style={{ width: "44px", height: "44px", flexShrink: 0, borderRadius: "12px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                    <UseCaseIcon name={uc.icon} />
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 500, color: "#fff", letterSpacing: "-0.01em", margin: 0 }}>{uc.title}</h3>
                  {uc.link && (
                    <span data-arrow style={{ display: "inline-flex", marginLeft: "auto", color: "#fff", opacity: 0, transform: "translate(0, 0)", transition: "opacity 0.2s, transform 0.2s" }}>
                      <svg width="18" height="18" viewBox="0 -960 960 960" fill="currentColor"><path d="M640-624 284-268q-11 11-28 11t-28-11q-11-11-11-28t11-28l356-356H280q-17 0-28.5-11.5T240-720q0-17 11.5-28.5T280-760h400q17 0 28.5 11.5T720-720v400q0 17-11.5 28.5T680-280q-17 0-28.5-11.5T640-320v-304Z" /></svg>
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#888", lineHeight: 1.65, fontWeight: 300 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section" style={{ padding: "100px 0" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            }),
          }}
        />
        <div className="lp-pad" style={{ maxWidth: "760px", margin: "0 auto", padding: "0 40px" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 300, letterSpacing: "-0.025em", textTransform: "uppercase", color: "#111" }}>
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
      <section className="cta-outer" style={{ padding: "0 40px 100px" }}>
        <div className="cta-card" style={{ maxWidth: "1200px", margin: "0 auto", background: "#fff", borderRadius: "24px", padding: "80px 60px", textAlign: "center" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 300, letterSpacing: "-0.025em", color: "#111", marginBottom: "16px", textTransform: "uppercase" }}>
              Scalable call management with AI Receptionist.
            </h2>
            <p style={{ color: "#888", fontSize: "16px", fontWeight: 300, lineHeight: 1.65, maxWidth: "560px", margin: "0 auto 36px" }}>
              Try AI Receptionist and see how our AI phone assistant automates your calls to reduce strain on your team. It&apos;s simple, efficient, and around the clock.
            </p>
            <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", height: "46px", padding: "0 28px", background: "#000", color: "#fff", borderRadius: "23px", fontSize: "14px", fontWeight: 400, textDecoration: "none", transition: "opacity 0.2s" }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.88")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              Create your own AI now
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <SiteFooter />
    </main>
  );
}
