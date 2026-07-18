"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import type { Mood } from "./personality";
import { MOUTHS, SPARKS, sparkPath } from "./AiAvatar";

// The interactive Step 1 character. Same monochrome look as AiAvatar, but alive:
// the eyes track the cursor (spring 250/22), it blinks on idle, glances around
// when you stop moving, waves on arrival, nods when you advance, and pops on
// success. Everything is compositor-cheap (transform/opacity) and reduced-motion
// safe (the CSS-driven blink/float honour the media query in onboarding.css).

const SPRING = { stiffness: 250, damping: 22 } as const;

export function LiveAvatar({
  mood,
  nudge = 0,
  rewind = 0,
  celebrate = false,
  className = "h-full w-full",
  label = "Your AI receptionist",
}: {
  mood: Mood;
  /** Bump this to make the avatar nod (e.g. when advancing a step). */
  nudge?: number;
  /** Bump this to make the avatar do a rewind wobble (e.g. when going back). */
  rewind?: number;
  celebrate?: boolean;
  className?: string;
  label?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const controls = useAnimationControls();
  const reduce = useReducedMotion();

  const eyeXRaw = useMotionValue(0);
  const eyeYRaw = useMotionValue(0);
  const eyeX = useSpring(eyeXRaw, SPRING);
  const eyeY = useSpring(eyeYRaw, SPRING);
  const pop = useSpring(1, SPRING);

  const [hover, setHover] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [talking, setTalking] = useState(false);
  const mounted = useRef(true);
  useEffect(() => () => void (mounted.current = false), []);

  // Eye tracking + idle glances. Suspended while studying (the eyes read
  // instead of following the cursor).
  useEffect(() => {
    if (reduce || mood === "studying") return;
    let lastMove = Date.now();
    function onMove(e: PointerEvent) {
      const el = svgRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 260));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 260));
      eyeXRaw.set(nx * 3);
      eyeYRaw.set(ny * 2.2);
      lastMove = Date.now();
    }
    const glance = setInterval(() => {
      if (Date.now() - lastMove < 2600) return;
      eyeXRaw.set((Math.random() - 0.5) * 4);
      eyeYRaw.set((Math.random() - 0.5) * 2.4);
    }, 2800);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      clearInterval(glance);
    };
  }, [eyeXRaw, eyeYRaw, reduce, mood]);

  // Studying: look down at the material and sweep the eyes left-to-right like
  // reading a line, then drop to the next.
  useEffect(() => {
    if (reduce || mood !== "studying") return;
    eyeYRaw.set(2.6);
    let x = -2.8;
    const read = setInterval(() => {
      eyeXRaw.set(x);
      x = x >= 2.8 ? -2.8 : x + 1.9; // sweep right, then snap back to line start
    }, 700);
    return () => {
      clearInterval(read);
      eyeXRaw.set(0);
      eyeYRaw.set(0);
    };
  }, [mood, eyeXRaw, eyeYRaw, reduce]);

  // Slight wave hello on arrival.
  useEffect(() => {
    if (reduce) return;
    controls.start({ rotate: [0, -4, 3, -1.5, 0], transition: { duration: 1.1, ease: "easeOut" } });
  }, [controls, reduce]);

  // Small nod when the caller advances a step.
  useEffect(() => {
    if (reduce) return;
    if (nudge > 0) {
      controls.start({ rotate: [0, 3.5, 0], transition: { duration: 0.42, ease: "easeOut" } });
    }
  }, [nudge, controls, reduce]);

  // Gentle rewind lean when the caller steps back - the mirror of the forward
  // nod. Eyes glance the way we came, then re-centre.
  useEffect(() => {
    if (reduce || rewind === 0) return;
    controls.start({ rotate: [0, -4.5, 2.5, 0], transition: { duration: 0.5, ease: "easeOut" } });
    eyeXRaw.set(-3);
    const t = setTimeout(() => eyeXRaw.set(0), 300);
    return () => clearTimeout(t);
  }, [rewind, controls, eyeXRaw, reduce]);

  // Slight pop on success.
  useEffect(() => {
    if (reduce || !celebrate) return;
    pop.set(1.08);
    const t = setTimeout(() => pop.set(1), 260);
    return () => clearTimeout(t);
  }, [celebrate, pop, reduce]);

  // Hover: a barely-there lean-in, so the face acknowledges the cursor. Yields
  // while a one-off reaction owns the scale.
  useEffect(() => {
    if (reduce || reacting || celebrate) return;
    pop.set(hover ? 1.035 : 1);
  }, [hover, reacting, celebrate, pop, reduce]);

  // Occasional soft "talking" flutter of the mouth, so it reads as speaking the
  // caller's language - played in short bursts rather than constantly.
  useEffect(() => {
    if (reduce) return;
    let off: ReturnType<typeof setTimeout>;
    const say = () => {
      if (!mounted.current) return;
      setTalking(true);
      off = setTimeout(() => mounted.current && setTalking(false), 900);
    };
    const iv = setInterval(say, 5200 + Math.random() * 2600);
    return () => {
      clearInterval(iv);
      clearTimeout(off);
    };
  }, [reduce]);

  // Tap/click "boop": a subtle squish with a brief grin, so the avatar feels
  // alive to the touch without being bouncy. Driven from the event, not an effect.
  function boop() {
    if (reduce) return;
    controls.start({ rotate: [0, -3, 2, 0], transition: { duration: 0.45, ease: "easeOut" } });
    setReacting(true);
    setTalking(true);
    pop.set(0.95);
    setTimeout(() => mounted.current && pop.set(1.04), 100);
    setTimeout(() => mounted.current && pop.set(1), 260);
    setTimeout(() => mounted.current && (setReacting(false), setTalking(false)), 640);
  }

  const mouth = reacting ? MOUTHS.bright ?? MOUTHS.friendly : MOUTHS[mood] ?? MOUTHS.friendly;

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 100 100"
      className={`ai-avatar cursor-pointer ${className}`}
      style={{ transformOrigin: "50% 82%", touchAction: "manipulation" }}
      animate={controls}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={boop}
      data-mood={mood}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="liveHead" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3c3c3c" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <radialGradient id="liveSheen" cx="0.36" cy="0.28" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.g style={{ scale: pop, transformOrigin: "50% 56%", transformBox: "fill-box" }}>
        <g className="ai-float">
          {/* headset band + status light */}
          <path d="M24 55 Q24 20 50 20 Q76 20 76 55" fill="none" stroke="#e8e8e8" strokeWidth="4.5" strokeLinecap="round" />
          <circle className="ai-status" cx="50" cy="18" r="3" fill="#ffffff" />

          {/* head */}
          <rect x="22" y="27" width="56" height="55" rx="23" fill="url(#liveHead)" />
          <rect x="22" y="27" width="56" height="55" rx="23" fill="url(#liveSheen)" />

          {/* earpieces + mic */}
          <rect x="17.5" y="47" width="10" height="18" rx="5" fill="#e8e8e8" />
          <rect x="72.5" y="47" width="10" height="18" rx="5" fill="#e8e8e8" />
          <path d="M23 63 Q20 75 35 74.5" fill="none" stroke="#e8e8e8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="36" cy="74.5" r="2.6" fill="#e8e8e8" />

          {/* eyes: spring-tracked group, CSS blink nested inside */}
          <motion.g className="ai-eyewrap" style={{ x: eyeX, y: eyeY }}>
            <g className="ai-eyes" fill="#ffffff">
              <rect x="37" y="48" width="6" height="9" rx="3" />
              <rect x="57" y="48" width="6" height="9" rx="3" />
            </g>
          </motion.g>

          {/* mouth (subtle talking flutter via CSS) */}
          <g className="ai-mouth" data-talk={talking ? "true" : undefined}>
            <path
              d={mouth.d}
              fill={mouth.filled ? "#ffffff" : "none"}
              stroke={mouth.filled ? "none" : "#ffffff"}
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* sparkles on success */}
          {celebrate &&
            SPARKS.map((s, i) => (
              <path key={i} className="ai-spark" style={{ animationDelay: s.delay }} d={sparkPath(s.x, s.y, s.r)} fill="#1d1d1d" />
            ))}
        </g>
      </motion.g>
    </motion.svg>
  );
}
