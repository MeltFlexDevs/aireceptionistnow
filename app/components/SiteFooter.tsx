"use client";

import type { ReactNode } from "react";

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

const ASK_AI_PROMPT = encodeURIComponent(
  "I'm researching AI receptionists and AI phone answering services for my small business and want to understand how AI Receptionist Now helps businesses stop missing calls, book appointments, and capture leads. Please summarize the highlights of the AI Receptionist Now website (https://aireceptionistnow.com) and community reviews.",
);

const ASK_AI_PROVIDERS: { name: string; href: string; icon: ReactNode }[] = [
  {
    name: "ChatGPT",
    href: `https://chatgpt.com/?prompt=${ASK_AI_PROMPT}`,
    icon: (
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="airn-ask-ai-mask0-chatgpt" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24" style={{ maskType: "luminance" }}><path d="M23.987.03H.02v23.967h23.967V.03Z" fill="#fff" /></mask>
        <g mask="url(#airn-ask-ai-mask0-chatgpt)">
          <mask id="airn-ask-ai-mask1-chatgpt" maskUnits="userSpaceOnUse" x="0" y="1" width="24" height="23" style={{ maskType: "luminance" }}><path d="M23.109 1H.899v22.011h22.21V1Z" fill="#fff" /></mask>
          <g mask="url(#airn-ask-ai-mask1-chatgpt)">
            <path d="M9.418 9.012V6.921c0-.176.066-.308.22-.396l4.204-2.421c.572-.33 1.255-.485 1.96-.485 2.64 0 4.313 2.048 4.313 4.227 0 .154 0 .33-.022.506l-4.358-2.554a.737.737 0 0 0-.792 0L9.418 9.012Zm9.817 8.144V12.16a.736.736 0 0 0-.396-.683l-5.525-3.213 1.805-1.035a.4.4 0 0 1 .44 0l4.204 2.421c1.21.705 2.025 2.201 2.025 3.654 0 1.673-.99 3.214-2.553 3.852ZM8.119 12.754l-1.805-1.056c-.154-.088-.22-.22-.22-.397V6.46c0-2.355 1.805-4.138 4.248-4.138a4.12 4.12 0 0 1 2.51.858L8.516 5.69a.736.736 0 0 0-.397.682v6.383ZM12.004 15l-2.586-1.453v-3.081l2.586-1.453 2.586 1.453v3.082l-2.586 1.452Zm1.662 6.692a4.12 4.12 0 0 1-2.51-.859l4.337-2.51a.736.736 0 0 0 .396-.681v-6.384l1.827 1.057c.154.088.22.22.22.396v4.842c0 2.355-1.827 4.139-4.27 4.139Zm-5.217-4.909-4.204-2.421c-1.21-.705-2.025-2.201-2.025-3.654a4.148 4.148 0 0 1 2.575-3.852v5.019c0 .308.132.528.396.682l5.503 3.192-1.805 1.034a.4.4 0 0 1-.44 0Zm-.242 3.61c-2.487 0-4.314-1.87-4.314-4.182 0-.176.022-.352.044-.528l4.336 2.509a.737.737 0 0 0 .793 0l5.524-3.192v2.091c0 .177-.066.309-.22.397l-4.204 2.42c-.572.331-1.255.485-1.959.485Zm5.459 2.62a5.504 5.504 0 0 0 5.393-4.403c2.465-.638 4.05-2.95 4.05-5.305 0-1.54-.66-3.037-1.849-4.116.11-.462.176-.924.176-1.386 0-3.148-2.553-5.503-5.503-5.503-.594 0-1.166.088-1.739.286A5.517 5.517 0 0 0 10.342 1 5.503 5.503 0 0 0 4.95 5.402C2.484 6.041.9 8.352.9 10.707c0 1.54.66 3.037 1.85 4.116-.11.462-.177.925-.177 1.387 0 3.147 2.554 5.503 5.503 5.503.594 0 1.167-.088 1.739-.287a5.516 5.516 0 0 0 3.852 1.585Z" fill="currentColor" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    name: "Perplexity",
    href: `https://www.perplexity.ai/search/new?q=${ASK_AI_PROMPT}`,
    icon: (
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="m5.206.889 6.176 5.83V.902h1.202v5.843L18.787.89v6.647h2.546v9.588h-2.539v5.92l-6.21-5.592v5.655h-1.202v-5.563l-6.169 5.567v-5.987H2.667V7.536h2.54V.89Zm5.27 7.864H3.868v7.155h1.343V13.65l5.263-4.898Zm-4.06 5.438v6.205l4.966-4.482V9.568l-4.967 4.623Zm6.202 1.664V9.562l4.968 4.623v2.94h.006v3.208l-4.974-4.478Zm6.176.053h1.337V8.753h-6.557l5.22 4.847v2.308Zm-1.21-8.372V3.688l-4.076 3.848h4.076Zm-7.1 0H6.409V3.688l4.077 3.848Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Claude",
    href: `https://claude.ai/new?q=${ASK_AI_PROMPT}`,
    icon: (
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#airn-ask-ai-clip0-claude)">
          <path d="m11.376 24-.6-.456-.336-.744.336-1.488.384-1.92.312-1.536.288-1.896.168-.624-.024-.048-.12.024-1.44 1.968-2.184 2.952-1.728 1.824-.408.168-.72-.36.072-.672.408-.576 2.376-3.048 1.44-1.896.936-1.08-.024-.144h-.048l-6.336 4.128L3 18.72l-.504-.456.072-.744.24-.24 1.896-1.32 4.728-2.64.072-.24-.072-.12h-.24l-.792-.048-2.688-.072-2.328-.096-2.28-.12-.576-.12-.528-.72.048-.36.48-.312.696.048 1.512.12 2.28.144 1.656.096 2.448.264h.384l.048-.168-.12-.096-.096-.096L6.96 9.84 4.416 8.16l-1.344-.984-.72-.504-.36-.456-.144-1.008.648-.72.888.072.216.048.888.696 1.896 1.464L8.88 8.616l.36.288.168-.096v-.072l-.168-.264-1.344-2.448-1.44-2.496-.648-1.032-.168-.624a2.53 2.53 0 0 1-.096-.72L6.288.144 6.696 0l1.008.144.408.36.624 1.416.984 2.232 1.56 3.024.456.912.24.816.096.264h.168v-.144l.12-1.728.24-2.088.24-2.688.072-.768.384-.912.744-.48.576.264.48.696-.072.432L14.76 3.6l-.576 2.904-.36 1.968h.216l.24-.264.984-1.296 1.656-2.064.72-.816.864-.912.552-.432h1.032l.744 1.128-.336 1.176-1.056 1.344-.888 1.128-1.272 1.704-.768 1.368.072.096h.168l2.856-.624 1.56-.264 1.824-.312.84.384.096.384-.336.816-1.968.48-2.304.456-3.432.816-.048.024.048.072 1.536.144.672.048h1.632l3.024.216.792.528.456.624-.072.504-1.224.6-1.632-.384-3.84-.912-1.296-.312h-.192v.096l1.104 1.08 1.992 1.8 2.52 2.328.12.576-.312.48-.336-.048-2.208-1.68-.864-.744-1.92-1.608h-.12v.168l.432.648 2.352 3.528.12 1.08-.168.336-.624.216-.648-.12-1.392-1.92-1.416-2.184-1.152-1.944-.12.096-.696 7.248-.312.36-.72.288Z" fill="#D97757" />
        </g>
        <defs>
          <clipPath id="airn-ask-ai-clip0-claude"><path fill="#fff" d="M0 0h24v24H0z" /></clipPath>
        </defs>
      </svg>
    ),
  },
  {
    name: "Gemini",
    href: `https://www.google.com/search?udm=50&aep=11&q=${ASK_AI_PROMPT}`,
    icon: (
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.616 10.835a14.148 14.148 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.629 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.148 14.148 0 0 1 4.45 3.001 14.112 14.112 0 0 1 3.68 6.453.502.502 0 0 0 .974 0c.172-.685.397-1.351.677-2.003a14.146 14.146 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.503.503 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z" fill="#3186FF" />
        <path d="M20.616 10.835a14.148 14.148 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.629 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.148 14.148 0 0 1 4.45 3.001 14.112 14.112 0 0 1 3.68 6.453.502.502 0 0 0 .974 0c.172-.685.397-1.351.677-2.003a14.146 14.146 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.503.503 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z" fill="url(#airn-ask-ai-paint0-gemini)" />
        <path d="M20.616 10.835a14.148 14.148 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.629 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.148 14.148 0 0 1 4.45 3.001 14.112 14.112 0 0 1 3.68 6.453.502.502 0 0 0 .974 0c.172-.685.397-1.351.677-2.003a14.146 14.146 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.503.503 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z" fill="url(#airn-ask-ai-paint1-gemini)" />
        <path d="M20.616 10.835a14.148 14.148 0 0 1-4.45-3.001 14.111 14.111 0 0 1-3.678-6.452.503.503 0 0 0-.975 0c-.629 2.44-1.9 4.668-3.679 6.452a14.155 14.155 0 0 1-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 0 0 0 .975c.684.172 1.35.397 2.002.677a14.148 14.148 0 0 1 4.45 3.001 14.112 14.112 0 0 1 3.68 6.453.502.502 0 0 0 .974 0c.172-.685.397-1.351.677-2.003a14.146 14.146 0 0 1 3.001-4.45 14.113 14.113 0 0 1 6.453-3.678.503.503 0 0 0 0-.975 13.24 13.24 0 0 1-2.003-.678Z" fill="url(#airn-ask-ai-paint2-gemini)" />
        <defs>
          <linearGradient id="airn-ask-ai-paint0-gemini" x1="7" y1="15.5" x2="11" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#08B962" /><stop offset="1" stopColor="#08B962" stopOpacity="0" /></linearGradient>
          <linearGradient id="airn-ask-ai-paint1-gemini" x1="8" y1="5.5" x2="11.5" y2="11" gradientUnits="userSpaceOnUse"><stop stopColor="#F94543" /><stop offset="1" stopColor="#F94543" stopOpacity="0" /></linearGradient>
          <linearGradient id="airn-ask-ai-paint2-gemini" x1="3.5" y1="13.5" x2="17.5" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#FABC12" /><stop offset="0.46" stopColor="#FABC12" stopOpacity="0" /></linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    name: "Grok",
    href: `https://x.com/i/grok?text=${ASK_AI_PROMPT}`,
    icon: (
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="m9.541 15.31 7.56-5.706c.372-.28.901-.17 1.078.264.93 2.292.514 5.045-1.335 6.936-1.85 1.89-4.423 2.305-6.775 1.361L7.5 19.381c3.685 2.575 8.16 1.939 10.956-.922 2.219-2.268 2.905-5.359 2.263-8.146l.006.006c-.931-4.095.229-5.732 2.606-9.079L23.5 1l-3.128 3.198v-.01L9.54 15.312M7.877 16.633c-2.701-2.493-2.236-6.351.07-8.576 1.704-1.647 4.497-2.32 6.935-1.331L17.5 5.558a7.646 7.646 0 0 0-1.77-.933C12.594 3.38 8.84 4 6.292 6.46c-2.452 2.368-3.223 6.01-1.9 9.118.99 2.323-.632 3.966-2.265 5.624C1.55 21.79.967 22.378.5 23l7.375-6.365" fill="currentColor" />
      </svg>
    ),
  },
];

const AskAI = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px", marginTop: "24px" }}>
    <style>{`
      .airn-ask-ai__btn{display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.55);text-decoration:none;transition:color .2s ease}
      .airn-ask-ai__btn:hover{color:#fff}
      .airn-ask-ai__btn svg{width:26px;height:26px;flex-shrink:0}
    `}</style>
    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 300, letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
      Ask AI about AI Receptionist Now
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {ASK_AI_PROVIDERS.map((p) => (
        <a
          key={p.name}
          className="airn-ask-ai__btn"
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Ask ${p.name} about AI Receptionist Now`}
        >
          {p.icon}
        </a>
      ))}
    </div>
  </div>
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
            <AskAI />
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
