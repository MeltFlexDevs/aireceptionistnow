"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useMotionValue,
  useSpring,
  useAnimationControls,
  useReducedMotion,
} from "motion/react";
import type { Mood } from "./personality";
import { MOUTHS, SPARKS, sparkPath } from "./AiAvatar";

// Contextual desk props the receptionist can work with: a phone that rings and
// gets picked up, a calendar it ticks, a growing chart, a book, a settings gear.
export type Activity = "phone" | "calendar" | "chart" | "study" | "gear";

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
  activity = null,
  className = "h-full w-full",
  label = "Your AI receptionist",
}: {
  mood: Mood;
  /** Bump this to make the avatar nod (e.g. when advancing a step). */
  nudge?: number;
  /** Bump this to make the avatar do a rewind wobble (e.g. when going back). */
  rewind?: number;
  celebrate?: boolean;
  /** Contextual desk prop to act out (ring/answer the phone, tick the calendar, ...). */
  activity?: Activity | null;
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

  // Phone scene: the handset buzzes in its cradle (eyes clock it), swings up
  // to the ear after two rings - with a tiny greeting nod - and then the call
  // alternates between talking and listening. Answered instantly under reduced
  // motion. Reset is derived while rendering (no effect).
  const [onCall, setOnCall] = useState(false);
  const [listening, setListening] = useState(false);
  const [prevActivity, setPrevActivity] = useState(activity);
  if (prevActivity !== activity) {
    setPrevActivity(activity);
    if (onCall) setOnCall(false);
    if (listening) setListening(false);
  }
  useEffect(() => {
    if (activity !== "phone") return;
    if (!reduce) {
      eyeXRaw.set(3.2);
      eyeYRaw.set(2.6);
    }
    const pick = setTimeout(
      () => {
        if (!mounted.current) return;
        setOnCall(true);
        eyeXRaw.set(0);
        eyeYRaw.set(0);
        if (!reduce) {
          controls.start({
            rotate: [0, 2.5, -1, 0],
            transition: { duration: 0.5, ease: "easeOut" },
          });
        }
      },
      reduce ? 0 : 1700,
    );
    return () => {
      clearTimeout(pick);
      eyeXRaw.set(0);
      eyeYRaw.set(0);
    };
  }, [activity, reduce, eyeXRaw, eyeYRaw, controls]);

  // Conversational rhythm: swap between speaking (mouth flutters) and
  // listening (sound ticks by the ear) while the call is up.
  useEffect(() => {
    if (!onCall || reduce) return;
    const iv = setInterval(() => mounted.current && setListening((l) => !l), 1700);
    return () => clearInterval(iv);
  }, [onCall, reduce]);

  // The other props sit at the bottom-right of the desk; glance down at them
  // every so often, then back to the caller's cursor.
  useEffect(() => {
    if (reduce || !activity || activity === "phone" || mood === "studying") return;
    let back: ReturnType<typeof setTimeout>;
    const look = () => {
      eyeXRaw.set(2.8);
      eyeYRaw.set(2.4);
      back = setTimeout(() => {
        eyeXRaw.set(0);
        eyeYRaw.set(0);
      }, 1500);
    };
    look();
    const iv = setInterval(look, 4200);
    return () => {
      clearInterval(iv);
      clearTimeout(back);
      eyeXRaw.set(0);
      eyeYRaw.set(0);
    };
  }, [activity, mood, reduce, eyeXRaw, eyeYRaw]);

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
          {/* Nudged up so the face sits optically centred in the viewBox. Kept
              on a nested g: CSS animates transform on .ai-float itself. */}
          <g transform="translate(0 -4.5)">
          {/* head */}
          <rect x="22" y="27" width="56" height="55" rx="23" fill="url(#liveHead)" />
          <rect x="22" y="27" width="56" height="55" rx="23" fill="url(#liveSheen)" />

          {/* eyes: spring-tracked group, CSS blink nested inside */}
          <motion.g className="ai-eyewrap" style={{ x: eyeX, y: eyeY }}>
            <g className="ai-eyes" fill="#ffffff">
              <rect x="37" y="48" width="6" height="9" rx="3" />
              <rect x="57" y="48" width="6" height="9" rx="3" />
            </g>
          </motion.g>

          {/* mouth (subtle talking flutter via CSS; chats on a call, pauses to listen) */}
          <g className="ai-mouth" data-talk={talking || (onCall && !reduce && !listening) ? "true" : undefined}>
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

          {/* contextual desk props (phone, calendar, chart, book, gear) */}
          <DeskProps activity={activity} onCall={onCall} listening={listening} reduce={!!reduce} />
          </g>
        </g>
      </motion.g>
    </motion.svg>
  );
}

const PROP_SPRING = { type: "spring", stiffness: 300, damping: 22 } as const;
const PROP_STYLE = { transformBox: "fill-box", transformOrigin: "center" } as const;
const PROP_ENTER = { opacity: 0, scale: 0.6, y: 8 };
const PROP_EXIT = { opacity: 0, scale: 0.85, transition: { duration: 0.16 } };

// The receptionist's desk props, drawn bottom-right in the same monochrome ink
// as the sparkles. AnimatePresence pops the active one in and out; MotionConfig
// stills the transform loops for reduced-motion users.
function DeskProps({
  activity,
  onCall,
  listening,
  reduce,
}: {
  activity: Activity | null;
  onCall: boolean;
  listening: boolean;
  reduce: boolean;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {activity === "phone" && (
          <motion.g
            key="phone"
            initial={PROP_ENTER}
            animate={{ opacity: 1, scale: 1 }}
            exit={PROP_EXIT}
            transition={PROP_SPRING}
            style={PROP_STYLE}
          >
            {/* the cradle stays behind on the desk, so the pickup reads */}
            <g transform="translate(86 77)">
              <rect x="-8.5" y="-2.6" width="17" height="5.2" rx="2.4" fill="#1d1d1d" />
              <rect x="-4.5" y="-4.4" width="9" height="2.6" rx="1.3" fill="#1d1d1d" opacity="0.45" />
            </g>

            {/* handset: buzzes in the cradle, then swings up to the ear in an arc */}
            <motion.g
              animate={
                onCall
                  ? reduce
                    ? { x: -2, y: -22, rotate: 8 }
                    : { x: [0, 7, -2], y: [0, -13, -22], rotate: [0, 26, 8] }
                  : { x: 0, y: 0, rotate: 0 }
              }
              transition={
                onCall && !reduce
                  ? { duration: 0.55, times: [0, 0.45, 1], ease: ["easeOut", "easeInOut"] }
                  : { duration: 0.2 }
              }
              style={PROP_STYLE}
            >
              <motion.g
                animate={!onCall && !reduce ? { rotate: [0, -9, 8, -7, 6, 0] } : { rotate: 0 }}
                transition={
                  !onCall && !reduce
                    ? { duration: 0.55, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }
                    : { duration: 0.2 }
                }
                style={PROP_STYLE}
              >
                <g transform="translate(86 71) rotate(-42)">
                  <path d="M-6.5 0 Q0 -6 6.5 0" fill="none" stroke="#1d1d1d" strokeWidth="4" strokeLinecap="round" />
                  <rect x="-10.4" y="-3.2" width="6.4" height="7.6" rx="2.8" fill="#1d1d1d" />
                  <rect x="4" y="-3.2" width="6.4" height="7.6" rx="2.8" fill="#1d1d1d" />
                </g>
              </motion.g>
            </motion.g>

            {/* ring chirps, in step with the buzz */}
            {!onCall && !reduce && (
              <g fill="none" stroke="#1d1d1d" strokeWidth="2" strokeLinecap="round">
                <motion.path
                  d="M91 60.5 a7.5 7.5 0 0 0 -2.3 -5.6"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity, repeatDelay: 0.5 }}
                />
                <motion.path
                  d="M95.5 59 a12 12 0 0 0 -3.8 -9"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity, repeatDelay: 0.5, delay: 0.12 }}
                />
              </g>
            )}

            {/* the caller's turn: sound ticks by the ear while listening */}
            {onCall && !reduce && (
              <motion.g
                fill="none"
                stroke="#1d1d1d"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ opacity: listening ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.path
                  d="M89.5 46 a7 7 0 0 0 -2.1 -5.3"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <motion.path
                  d="M93.5 44.5 a11 11 0 0 0 -3.4 -8.3"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                />
              </motion.g>
            )}
          </motion.g>
        )}

        {activity === "calendar" && (
          <motion.g
            key="calendar"
            initial={PROP_ENTER}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={PROP_EXIT}
            transition={PROP_SPRING}
            style={PROP_STYLE}
          >
            <g transform="translate(75 71)">
              <rect x="-5.6" y="-11" width="2.6" height="5" rx="1.3" fill="#1d1d1d" />
              <rect x="3" y="-11" width="2.6" height="5" rx="1.3" fill="#1d1d1d" />
              <rect x="-11" y="-8" width="22" height="17" rx="3" fill="#1d1d1d" />
              <path d="M-11 -3.5 L11 -3.5" stroke="#ffffff" strokeWidth="1.4" opacity="0.45" />
              <g fill="#ffffff" opacity="0.5">
                <circle cx="-6.5" cy="0.5" r="1.1" />
                <circle cx="-2" cy="0.5" r="1.1" />
                <circle cx="2.5" cy="0.5" r="1.1" />
                <circle cx="7" cy="0.5" r="1.1" />
                <circle cx="-6.5" cy="4.5" r="1.1" />
                <circle cx="-2" cy="4.5" r="1.1" />
              </g>
              {/* booking lands: the tick draws itself in */}
              <motion.path
                d="M0.5 2.6 L3.6 5.8 L9 -1"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.45, ease: "easeOut" }}
              />
            </g>
          </motion.g>
        )}

        {activity === "chart" && (
          <motion.g
            key="chart"
            initial={PROP_ENTER}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={PROP_EXIT}
            transition={PROP_SPRING}
            style={PROP_STYLE}
          >
            <g transform="translate(67 84)">
              {[8, 13, 18].map((h, i) => (
                <motion.rect
                  key={h}
                  x={i * 7}
                  y={-h}
                  width="4.6"
                  height={h}
                  rx="1.8"
                  fill="#1d1d1d"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.18 + i * 0.14, type: "spring", stiffness: 300, damping: 20 }}
                  style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
                />
              ))}
            </g>
          </motion.g>
        )}

        {activity === "study" && (
          <motion.g
            key="study"
            initial={PROP_ENTER}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={PROP_EXIT}
            transition={PROP_SPRING}
            style={PROP_STYLE}
          >
            <motion.g
              animate={{ y: [0, -1.6, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              style={PROP_STYLE}
            >
              <g transform="translate(74 75) rotate(5)">
                <path d="M0 -4.5 Q-6 -8 -12 -6 L-12 4.5 Q-6 2.5 0 6 Z" fill="#1d1d1d" />
                <path d="M0 -4.5 Q6 -8 12 -6 L12 4.5 Q6 2.5 0 6 Z" fill="#1d1d1d" />
                <path d="M0 -4.5 L0 6" stroke="#ffffff" strokeWidth="1.2" opacity="0.55" />
                <path d="M-9 -3.2 Q-5 -4.6 -2.6 -3.6" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.45" />
                <path d="M2.6 -3.6 Q5 -4.6 9 -3.2" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.45" />
              </g>
            </motion.g>
          </motion.g>
        )}

        {activity === "gear" && (
          <motion.g
            key="gear"
            initial={PROP_ENTER}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={PROP_EXIT}
            transition={PROP_SPRING}
            style={PROP_STYLE}
          >
            <motion.g
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
              style={PROP_STYLE}
            >
              <g transform="translate(78 73)">
                {Array.from({ length: 8 }, (_, i) => (
                  <rect
                    key={i}
                    x="-1.7"
                    y="-10.2"
                    width="3.4"
                    height="4.4"
                    rx="1.4"
                    fill="#1d1d1d"
                    transform={`rotate(${i * 45})`}
                  />
                ))}
                <circle r="7" fill="#1d1d1d" />
                <circle r="2.6" fill="#ffffff" />
              </g>
            </motion.g>
          </motion.g>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
