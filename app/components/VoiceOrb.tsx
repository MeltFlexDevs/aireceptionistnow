/**
 * Decorative "voice orb" used on the landing hero — a circular gradient blob
 * with a soft noise texture, a centred play glyph, a hover ring and gentle
 * idle motion. Purely visual (no audio); inspired by ElevenLabs' voice previews
 * but built from our own gradient/SVG so it has no external asset dependencies.
 */
export default function VoiceOrb() {
  // Inline fractal-noise texture so the orb needs no image file.
  const noise =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  return (
    <div className="voice-orb" role="img" aria-label="AI receptionist voice preview">
      <style>{`
        .voice-orb {
          position: relative;
          width: clamp(170px, 42vw, 248px);
          aspect-ratio: 1 / 1;
          margin: 4px auto 44px;
          border-radius: 50%;
          z-index: 2;
          isolation: isolate;
          animation: vo-float 7s ease-in-out infinite;
          filter: drop-shadow(0 24px 60px rgba(123, 84, 245, 0.30));
          transition: transform 0.35s ease;
        }
        .voice-orb:hover { transform: scale(1.035); }

        /* expanding "listening" pulse */
        .voice-orb::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(177, 108, 234, 0.55);
          animation: vo-pulse 3.2s ease-out infinite;
          z-index: 0;
        }

        .vo-fill {
          position: absolute;
          inset: -14%;
          border-radius: 50%;
          background: conic-gradient(from 0deg,
            #6d5efc, #b16cea, #ff5e9c, #ffb86c, #5ee7ff, #6d5efc);
          filter: blur(7px) saturate(1.15);
          animation: vo-spin 14s linear infinite;
        }
        .vo-glow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 32% 28%,
            rgba(255,255,255,0.55), rgba(255,255,255,0) 55%);
          mix-blend-mode: screen;
        }
        .vo-noise {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-image: ${noise};
          background-size: 180px 180px;
          mix-blend-mode: overlay;
          opacity: 0.35;
        }
        .vo-depth {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          box-shadow:
            inset 0 0 46px rgba(0,0,0,0.28),
            inset 0 0 0 1px rgba(255,255,255,0.18);
        }
        .vo-ring {
          position: absolute;
          inset: -7px;
          border-radius: 50%;
          border: 4px solid rgba(229,231,235,0.9);
          opacity: 0;
          transform: scale(0.985);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .voice-orb:hover .vo-ring { opacity: 1; transform: scale(1); }

        .vo-play {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }
        .vo-play-btn {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #fff;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 1px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.14);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .voice-orb:hover .vo-play-btn { transform: scale(1.06); background: #fafafa; }

        @keyframes vo-spin { to { transform: rotate(360deg); } }
        @keyframes vo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes vo-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          80%, 100% { transform: scale(1.28); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .voice-orb, .vo-fill, .voice-orb::after { animation: none; }
        }
      `}</style>

      <div className="vo-fill" aria-hidden="true" />
      <div className="vo-glow" aria-hidden="true" />
      <div className="vo-noise" aria-hidden="true" />
      <div className="vo-depth" aria-hidden="true" />
      <div className="vo-ring" aria-hidden="true" />
      <div className="vo-play" aria-hidden="true">
        <span className="vo-play-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              fill="currentColor"
              d="M9.244 2.368C7.414 1.184 5 2.497 5 4.676v14.648c0 2.18 2.414 3.493 4.244 2.309l11.318-7.324c1.675-1.084 1.675-3.534 0-4.618z"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
