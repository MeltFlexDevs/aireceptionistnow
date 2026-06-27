"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative "voice blob" on the landing hero — an edgeless smudge whose colours
 * come from /orb.png, with a faint noise overlay and an organic, irregular
 * canvas animation (drifting light spots driven by summed sines with random
 * frequencies/phases) so it gently "moves like a voice". Purely visual.
 */
export default function VoiceOrb() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Inline fractal-noise texture so the blob needs no extra image file.
  const noise =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const fillMask =
    "radial-gradient(circle at center, #000 38%, rgba(0,0,0,0.5) 58%, transparent 74%)";
  const softMask =
    "radial-gradient(circle at center, #000 40%, transparent 68%)";
  const waveMask =
    "radial-gradient(circle at center, #000 30%, transparent 66%)";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const s = canvas.clientWidth || 180;
      canvas.width = Math.round(s * dpr);
      canvas.height = Math.round(s * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const TAU = Math.PI * 2;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    // Tones sampled from the orb image so the motion blends in.
    const palette = [
      [176, 156, 240], // periwinkle
      [255, 186, 142], // peach
      [255, 255, 255], // light
      [150, 200, 235], // soft blue
    ];
    // Each spot follows a quasi-random path: two summed sines per axis with
    // incommensurate frequencies + random phases => never repeats cleanly.
    const spots = Array.from({ length: 4 }, (_, i) => ({
      fx1: rand(0.05, 0.15), fx2: rand(0.17, 0.31), px1: rand(0, TAU), px2: rand(0, TAU),
      fy1: rand(0.06, 0.16), fy2: rand(0.18, 0.33), py1: rand(0, TAU), py2: rand(0, TAU),
      fr1: rand(0.08, 0.2), fr2: rand(0.22, 0.4), pr: rand(0, TAU),
      ax: rand(0.14, 0.32), ay: rand(0.14, 0.32),
      baseR: rand(0.24, 0.42),
      alpha: rand(0.1, 0.2),
      col: palette[i % palette.length],
    }));

    let raf = 0;
    let start = 0;
    const draw = (ts: number) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2, R = W / 2;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const s of spots) {
        const dx =
          Math.sin(t * s.fx1 * TAU + s.px1) * 0.6 +
          Math.sin(t * s.fx2 * TAU + s.px2) * 0.4;
        const dy =
          Math.sin(t * s.fy1 * TAU + s.py1) * 0.6 +
          Math.sin(t * s.fy2 * TAU + s.py2) * 0.4;
        const x = cx + dx * s.ax * R;
        const y = cy + dy * s.ay * R;
        const pulse =
          0.72 +
          (Math.sin(t * s.fr1 * TAU + s.pr) * 0.5 +
            Math.sin(t * s.fr2 * TAU) * 0.5) *
            0.28;
        const r = s.baseR * R * pulse;
        const [cr, cg, cb] = s.col;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${s.alpha})`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

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
        .vo-wave {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          mix-blend-mode: screen;
          -webkit-mask-image: ${waveMask};
          mask-image: ${waveMask};
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
      <canvas ref={canvasRef} className="vo-wave" aria-hidden="true" />
      <div className="vo-noise" aria-hidden="true" />
    </div>
  );
}
