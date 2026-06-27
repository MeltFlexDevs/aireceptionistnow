"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative hero "voice orb" rendered as a soft cloud of drifting pastel
 * dots — a slow, sand-like particle animation on <canvas>. Self-contained,
 * no external assets. Respects prefers-reduced-motion (renders a still frame).
 */
export default function VoiceOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Vivid pastel palette — warmer + more saturated than a flat blob.
    const palette = [
      "#b794f6", "#a78bfa", "#f472b6", "#fb7185",
      "#fda4af", "#fdba74", "#7dd3fc",
    ];

    type P = {
      angle: number; radius: number; size: number; color: string;
      speed: number; phase: number; bob: number;
    };
    let particles: P[] = [];
    let R = 0, cx = 0, cy = 0, sizePx = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function build() {
      sizePx = canvas!.clientWidth || 200;
      canvas!.width = Math.round(sizePx * dpr);
      canvas!.height = Math.round(sizePx * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = sizePx / 2;
      cx = R; cy = R;
      const N = Math.round(sizePx * 1.15); // scale count with size
      particles = Array.from({ length: N }, () => {
        // center-biased point in the disc
        const r = Math.pow(Math.random(), 0.65) * R * 0.96;
        return {
          angle: Math.random() * Math.PI * 2,
          radius: r,
          size: 0.8 + Math.random() * 2.2,
          color: palette[(Math.random() * palette.length) | 0],
          speed: (0.0006 + Math.random() * 0.0014) * (Math.random() < 0.5 ? 1 : -1),
          phase: Math.random() * Math.PI * 2,
          bob: 2 + Math.random() * 4,
        };
      });
    }

    let raf = 0;
    let t = 0;
    function frame() {
      t += 1;
      ctx!.clearRect(0, 0, sizePx, sizePx);
      for (const p of particles) {
        p.angle += p.speed;
        // slow radial "breathing" + per-grain jitter → sand-like shifting
        const rr =
          p.radius +
          Math.sin(t * 0.008 + p.phase) * p.bob +
          Math.sin(t * 0.05 + p.phase * 3) * 0.6;
        const x = cx + Math.cos(p.angle) * rr;
        const y = cy + Math.sin(p.angle) * rr;
        const edge = rr / R;
        const alpha = Math.max(0, 1 - edge * edge * edge); // fade to nothing at edge
        ctx!.globalAlpha = alpha * 0.9;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(x, y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    build();
    if (reduce) {
      frame();
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      build();
      if (reduce) frame();
      else raf = requestAnimationFrame(frame);
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="voice-orb" role="img" aria-label="AI receptionist voice visual">
      <style>{`
        .voice-orb {
          position: relative;
          width: clamp(150px, 34vw, 210px);
          aspect-ratio: 1 / 1;
          margin: 8px auto 40px;
          z-index: 2;
          animation: vo-float 8s ease-in-out infinite;
        }
        .vo-canvas { width: 100%; height: 100%; display: block; }
        @keyframes vo-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .voice-orb { animation: none; }
        }
      `}</style>
      <canvas ref={canvasRef} className="vo-canvas" aria-hidden="true" />
    </div>
  );
}
