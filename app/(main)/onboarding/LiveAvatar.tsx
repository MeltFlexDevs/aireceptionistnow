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
import { AvatarArt, type AvatarActivity } from "./AiAvatar";
import { isAwake } from "./presence";

// Contextual activities: a phone that rings (then the mic's voice light glows on
// the call), or one small badge at the top right (calendar, chart, book, gear).
export type Activity = AvatarActivity;

// The interactive Step 1 character. Same monochrome look as AiAvatar, but alive:
// the eyes track the cursor (spring 250/22), it blinks on idle, glances around
// when you stop moving, waves on arrival, nods when you advance, and pops on
// success. Reduced-motion safe (the CSS-driven blink honours the media query in
// surfaces.css). Not compositor-cheap: the eyes are an SVG group, so every frame
// of an eye move is a style and layout pass. That is why the idle life (glances,
// talk bursts, badge glances, reading) is sparse and rests while nobody is
// around (presence.ts).

const SPRING = { stiffness: 250, damping: 22 } as const;
// The eyes move a few viewBox units. motion's default rest thresholds for a
// followed value (0.001 units, 0.01 units/s) kept each glance animating for
// about 0.7 s, 80+ frames on a 120 Hz screen. Resting at 0.05 units (under
// 0.1 px) about halves that and looks the same.
const EYE_SPRING = { ...SPRING, restDelta: 0.05, restSpeed: 1 } as const;

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
  const eyeX = useSpring(eyeXRaw, EYE_SPRING);
  const eyeY = useSpring(eyeYRaw, EYE_SPRING);
  const pop = useSpring(1, SPRING);

  const [hover, setHover] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [talking, setTalking] = useState(false);
  const mounted = useRef(true);
  // Set on every mount: React's dev StrictMode runs the cleanup once and mounts
  // again, which left it false, so talk bursts, the phone pickup and the end of
  // a boop never ran under next dev.
  useEffect(() => {
    mounted.current = true;
    return () => void (mounted.current = false);
  }, []);

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
    // A glance every 6-10 s once the cursor has been still for a moment (it was
    // every 2.8 s), and none while nobody is around.
    let glance: ReturnType<typeof setTimeout>;
    const look = () => {
      if (isAwake() && Date.now() - lastMove >= 2600) {
        eyeXRaw.set((Math.random() - 0.5) * 4);
        eyeYRaw.set((Math.random() - 0.5) * 2.4);
      }
      glance = setTimeout(look, 6000 + Math.random() * 4000);
    };
    glance = setTimeout(look, 6000 + Math.random() * 4000);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      clearTimeout(glance);
    };
  }, [eyeXRaw, eyeYRaw, reduce, mood]);

  // Studying: look down at the material and sweep the eyes left-to-right like
  // reading a line, then drop to the next. A pause of 4-6 s after each line, and
  // the eyes stay on the page while nobody is around: reading without pauses
  // kept the eyes moving on every frame for as long as the page was open.
  useEffect(() => {
    if (reduce || mood !== "studying") return;
    eyeYRaw.set(2.6);
    let x = -2.8;
    let read: ReturnType<typeof setTimeout>;
    const step = () => {
      let wait = 700;
      if (isAwake()) {
        eyeXRaw.set(x);
        if (x >= 2.8) {
          x = -2.8; // line done: pause, then snap back to the line start
          wait = 4000 + Math.random() * 2000;
        } else {
          x += 1.9; // sweep right
        }
      }
      read = setTimeout(step, wait);
    };
    read = setTimeout(step, 700);
    return () => {
      clearTimeout(read);
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
  // caller's language - played in short bursts every 9-15 s rather than
  // constantly, and not while nobody is around.
  useEffect(() => {
    if (reduce) return;
    let next: ReturnType<typeof setTimeout>;
    const say = () => {
      if (mounted.current && isAwake()) {
        setTalking(true);
        // Not cleared on cleanup, so a burst always ends.
        setTimeout(() => mounted.current && setTalking(false), 900);
      }
      next = setTimeout(say, 9000 + Math.random() * 6000);
    };
    next = setTimeout(say, 9000 + Math.random() * 6000);
    return () => clearTimeout(next);
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

  // The activity badge sits at the top right; glance up at it when it shows,
  // then every 9-13 s while someone is around, and back to the caller's cursor.
  useEffect(() => {
    if (reduce || !activity || activity === "phone" || mood === "studying") return;
    let back: ReturnType<typeof setTimeout>;
    let next: ReturnType<typeof setTimeout>;
    const look = () => {
      eyeXRaw.set(2.8);
      eyeYRaw.set(-2.4);
      back = setTimeout(() => {
        eyeXRaw.set(0);
        eyeYRaw.set(0);
      }, 1500);
    };
    const again = () => {
      if (isAwake()) look();
      next = setTimeout(again, 9000 + Math.random() * 4000);
    };
    look();
    next = setTimeout(again, 9000 + Math.random() * 4000);
    return () => {
      clearTimeout(next);
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
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <motion.g style={{ scale: pop, transformOrigin: "50% 56%", transformBox: "fill-box" }}>
        {/* Eyes in a spring-tracked group (CSS blink nested inside). The mouth
            chats on a call and pauses to listen; a boop shows a brief grin. */}
        <AvatarArt
          mood={mood}
          activity={activity}
          celebrate={celebrate}
          onCall={onCall}
          talking={talking || (onCall && !reduce && !listening)}
          grin={reacting}
          eyes={(n) => (
            <motion.g className="ai-eyewrap" style={{ x: eyeX, y: eyeY }}>
              {n}
            </motion.g>
          )}
        />
      </motion.g>
    </motion.svg>
  );
}
