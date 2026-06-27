/**
 * Decorative "voice blob" used on the landing hero — a soft, edgeless pastel
 * gradient smudge with a faint noise texture and gentle idle motion. Purely
 * visual; built from our own gradient/SVG so it has no external asset deps.
 */
export default function VoiceOrb() {
  // Inline fractal-noise texture so the blob needs no image file.
  const noise =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const fillMask =
    "radial-gradient(circle at center, #000 22%, rgba(0,0,0,0.35) 50%, transparent 70%)";
  const softMask =
    "radial-gradient(circle at center, #000 40%, transparent 68%)";

  return (
    <div className="voice-orb" role="img" aria-label="AI receptionist voice preview">
      <style>{`
        .voice-orb {
          position: relative;
          width: clamp(128px, 30vw, 184px);
          aspect-ratio: 1 / 1;
          margin: 4px auto 40px;
          z-index: 2;
          isolation: isolate;
          animation: vo-float 7s ease-in-out infinite;
        }

        .vo-fill {
          position: absolute;
          inset: -16%;
          border-radius: 50%;
          background: conic-gradient(from 200deg,
            #dccdf5, #f4d2e3, #ffdfc9, #dccdf5);
          filter: blur(14px) saturate(0.92);
          -webkit-mask-image: ${fillMask};
          mask-image: ${fillMask};
          animation: vo-spin 16s linear infinite;
        }
        .vo-glow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 34% 30%,
            rgba(255,255,255,0.5), rgba(255,255,255,0) 55%);
          mix-blend-mode: screen;
        }
        .vo-noise {
          position: absolute;
          inset: 0;
          background-image: ${noise};
          background-size: 180px 180px;
          mix-blend-mode: overlay;
          opacity: 0.28;
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
