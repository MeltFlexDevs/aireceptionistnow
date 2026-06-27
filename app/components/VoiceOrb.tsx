/**
 * Decorative hero "voice blob" — a soft, edgeless pastel gradient smudge with
 * a faint noise texture and slow idle motion. Purely visual; built from our own
 * gradient/SVG so it has no external asset deps.
 */
export default function VoiceOrb() {
  // Inline fractal-noise texture so the blob needs no image file.
  const noise =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const fillMask =
    "radial-gradient(circle at center, #000 36%, rgba(0,0,0,0.5) 58%, transparent 78%)";
  const softMask =
    "radial-gradient(circle at center, #000 42%, transparent 70%)";

  return (
    <div className="voice-orb" role="img" aria-label="AI receptionist voice visual">
      <style>{`
        .voice-orb {
          position: relative;
          width: clamp(140px, 32vw, 200px);
          aspect-ratio: 1 / 1;
          margin: 8px auto 40px;
          z-index: 2;
          isolation: isolate;
          animation: vo-float 7s ease-in-out infinite;
        }

        .vo-fill {
          position: absolute;
          inset: -14%;
          border-radius: 50%;
          background: conic-gradient(from 200deg,
            #b794f6, #e879f9, #fb7185, #fdba74, #b794f6);
          filter: blur(11px) saturate(1.18);
          -webkit-mask-image: ${fillMask};
          mask-image: ${fillMask};
          animation: vo-spin 16s linear infinite;
        }
        .vo-glow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 34% 30%,
            rgba(255,255,255,0.45), rgba(255,255,255,0) 55%);
          mix-blend-mode: screen;
        }
        .vo-noise {
          position: absolute;
          inset: 0;
          background-image: ${noise};
          background-size: 180px 180px;
          mix-blend-mode: overlay;
          opacity: 0.3;
          -webkit-mask-image: ${softMask};
          mask-image: ${softMask};
        }

        @keyframes vo-spin { to { transform: rotate(360deg); } }
        @keyframes vo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .voice-orb, .vo-fill { animation: none; }
        }
      `}</style>

      <div className="vo-fill" aria-hidden="true" />
      <div className="vo-glow" aria-hidden="true" />
      <div className="vo-noise" aria-hidden="true" />
    </div>
  );
}
