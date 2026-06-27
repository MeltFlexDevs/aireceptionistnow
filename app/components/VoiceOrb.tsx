/**
 * Decorative "voice blob" used on the landing hero — a soft, edgeless smudge
 * whose colours come from /orb.png. A faint noise overlay and gentle idle
 * float give it life. Purely visual (no audio).
 */
export default function VoiceOrb() {
  // Inline fractal-noise texture so the blob needs no extra image file.
  const noise =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const fillMask =
    "radial-gradient(circle at center, #000 38%, rgba(0,0,0,0.5) 58%, transparent 74%)";
  const softMask =
    "radial-gradient(circle at center, #000 40%, transparent 68%)";

  return (
    <div className="voice-orb" role="img" aria-label="AI receptionist voice preview">
      <style>{`
        .voice-orb {
          position: relative;
          width: clamp(140px, 32vw, 200px);
          aspect-ratio: 1 / 1;
          margin: 4px auto 40px;
          z-index: 2;
          isolation: isolate;
          animation: vo-float 7s ease-in-out infinite;
        }

        .vo-fill {
          position: absolute;
          inset: -10%;
          border-radius: 50%;
          background: url(/orb.png) center / cover no-repeat;
          filter: blur(6px);
          -webkit-mask-image: ${fillMask};
          mask-image: ${fillMask};
        }
        .vo-noise {
          position: absolute;
          inset: 0;
          background-image: ${noise};
          background-size: 180px 180px;
          mix-blend-mode: overlay;
          opacity: 0.5;
          -webkit-mask-image: ${softMask};
          mask-image: ${softMask};
        }

        @keyframes vo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .voice-orb { animation: none; }
        }
      `}</style>

      <div className="vo-fill" aria-hidden="true" />
      <div className="vo-noise" aria-hidden="true" />
    </div>
  );
}
