import type { ReactNode } from "react";
import type { Mood } from "./personality";

// An illustrated AI-receptionist character - a charcoal head with a headset
// (ear cups, mic boom and a lilac "voice light" in the home orb colors),
// blinking eyes and a mouth that morphs with the chosen voice's personality.
// Pure SVG + CSS (no hooks), so it drops into both client and server
// components. Re-mounting it via `key={mood}` replays the pop.

// Mouth shape per mood. Filled shapes are open grins; the rest are stroked.
// Shared with LiveAvatar so both characters morph identically.
export const MOUTHS: Record<Mood, { d: string; filled?: boolean }> = {
  greeting: { d: "M42 64 Q50 71 58 64" },
  calm: { d: "M43 65 Q50 69.5 57 65" },
  friendly: { d: "M41 63.5 Q50 73 59 63.5" },
  confident: { d: "M42 65.5 Q52 71 59 61.5" },
  bright: { d: "M40 62 Q50 74 60 62 Q50 69 40 62 Z", filled: true },
  celebrate: { d: "M39 61 Q50 77.5 61 61 Q50 71 39 61 Z", filled: true },
  // Small, focused mouth - concentrating while it reads.
  studying: { d: "M45 65.5 Q50 67.5 55 65.5" },
};

export function sparkPath(x: number, y: number, r: number): string {
  return (
    `M${x} ${y - r} Q${x + r * 0.28} ${y - r * 0.28} ${x + r} ${y} ` +
    `Q${x + r * 0.28} ${y + r * 0.28} ${x} ${y + r} ` +
    `Q${x - r * 0.28} ${y + r * 0.28} ${x - r} ${y} ` +
    `Q${x - r * 0.28} ${y - r * 0.28} ${x} ${y - r} Z`
  );
}

// Flat fills only: no gradient ids, so many copies on one page never clash.
const INK = "#1D1D1D";
const HEAD = "#2A2A2A";
const PAPER = "#FFFFFF";
const LILAC = "#B09CF0"; // VoiceOrb periwinkle rgb(176 156 240)
const PEACH = "#FFBA8E"; // VoiceOrb peach rgb(255 186 142)
const BOOM = "M19 64.5 Q20.5 76.5 32 76";

export type AvatarActivity = "phone" | "calendar" | "chart" | "study" | "gear";

// Little twinkling sparkles, drawn only when celebrating.
const RX_SPARKS = [
  { x: 17, y: 27, r: 3.2, c: PEACH, delay: "0s" },
  { x: 86, y: 74, r: 3, c: LILAC, delay: "0.35s" },
  { x: 13, y: 78, r: 2.4, c: LILAC, delay: "0.7s" },
];

// One small badge at the top right per desk activity, clear of the status dot.
const BADGE: Record<Exclude<AvatarActivity, "phone">, ReactNode> = {
  calendar: (
    <>
      <rect x={74.3} y={19.6} width={11.4} height={10} rx={2.2} fill="none" stroke={INK} strokeWidth={1.9} />
      <path d="M74.3 23.2 H85.7 M77.4 17.8 V20.6 M82.6 17.8 V20.6" stroke={INK} strokeWidth={1.9} strokeLinecap="round" />
      <path d="M77.4 26.1 L79.3 27.9 L82.8 24.4" fill="none" stroke={INK} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  chart: <path d="M75.5 29 V25.5 M80 29 V22.5 M84.5 29 V19.5" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />,
  study: (
    <path
      d="M80 21.2 Q77 19.4 74 20.2 V28.4 Q77 27.6 80 29.4 Q83 27.6 86 28.4 V20.2 Q83 19.4 80 21.2 Z M80 21.2 V29.4"
      fill="none"
      stroke={INK}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  ),
  gear: (
    <>
      <circle cx={80} cy={24.5} r={3.6} fill="none" stroke={INK} strokeWidth={2.2} />
      <path
        d="M80 17.9 V19.6 M80 29.4 V31.1 M73.4 24.5 H75.1 M84.9 24.5 H86.6 M75.3 19.8 L76.5 21 M83.5 28 L84.7 29.2 M75.3 29.2 L76.5 28 M83.5 21 L84.7 19.8"
        stroke={INK}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </>
  ),
};

function Mouth({ mood }: { mood: Mood }) {
  const mouth = MOUTHS[mood] ?? MOUTHS.friendly;
  return (
    <path
      d={mouth.d}
      fill={mouth.filled ? PAPER : "none"}
      stroke={mouth.filled ? "none" : PAPER}
      strokeWidth="4.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Eyes({ mood, happy }: { mood: Mood; happy: boolean }) {
  if (happy)
    return (
      <path
        d="M35.5 53.5 Q40 46.5 44.5 53.5 M55.5 53.5 Q60 46.5 64.5 53.5"
        fill="none"
        stroke={PAPER}
        strokeWidth={3.6}
        strokeLinecap="round"
      />
    );
  // calm: shorter; studying: looking down; others: tall pills
  const [y, h] = mood === "calm" ? [49, 7.5] : mood === "studying" ? [50, 8.5] : [46.5, 10.5];
  return (
    <g className="ai-eyes" fill={PAPER}>
      <rect x={36.5} y={y} width={7} height={h} rx={3.5} />
      <rect x={56.5} y={y} width={7} height={h} rx={3.5} />
    </g>
  );
}

// The face itself, without the root <svg>: AiAvatar draws it static, LiveAvatar
// wraps the eyes in its spring-tracked group via `eyes` and grins on a boop.
export function AvatarArt({
  mood,
  activity = null,
  celebrate = false,
  onCall = false,
  talking = false,
  grin = false,
  eyes,
}: {
  mood: Mood;
  activity?: AvatarActivity | null;
  celebrate?: boolean;
  onCall?: boolean;
  talking?: boolean;
  grin?: boolean;
  eyes?: (node: ReactNode) => ReactNode;
}) {
  const happy = celebrate || mood === "celebrate";
  const voiceOn = talking || (activity === "phone" && onCall);
  const eyeNode = <Eyes mood={mood} happy={happy} />;
  return (
    <>
      {/* headband, head, sheen, ear cups, mic boom */}
      <path d="M19 55 C19 30 31 17.5 50 17.5 C69 17.5 81 30 81 55" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <rect x={22} y={25} width={56} height={55} rx={23.5} fill={HEAD} />
      <path d="M30 37.5 Q33.5 30 42 29" fill="none" stroke={PAPER} strokeOpacity={0.16} strokeWidth={3} strokeLinecap="round" />
      <rect x={13.5} y={45} width={11} height={20} rx={5.5} fill={INK} stroke={PAPER} strokeWidth={1.8} />
      <rect x={75.5} y={45} width={11} height={20} rx={5.5} fill={INK} stroke={PAPER} strokeWidth={1.8} />
      <path d={BOOM} fill="none" stroke={PAPER} strokeWidth={7} strokeLinecap="round" />
      <path d={BOOM} fill="none" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
      {/* voice light at the mic tip: glows while talking or on a call */}
      <g className="rx-voice" data-on={voiceOn ? "true" : undefined}>
        {voiceOn && <circle cx={34} cy={75.8} r={9.5} fill={LILAC} opacity={0.35} />}
        <circle cx={34} cy={75.8} r={5.6} fill={LILAC} stroke={PAPER} strokeWidth={1.8} />
        <circle cx={35.4} cy={76.8} r={2.7} fill={PEACH} />
      </g>
      {eyes ? eyes(eyeNode) : eyeNode}
      <g className="ai-mouth" data-talk={talking ? "true" : undefined}>
        <Mouth mood={grin ? "bright" : mood} />
      </g>
      {activity === "phone" && !onCall && (
        <g className="rx-ring" fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round">
          <path d="M90.5 49 Q93.5 55 90.5 61" />
          <path d="M95 45.5 Q99.5 55 95 64.5" />
        </g>
      )}
      {happy &&
        RX_SPARKS.map((s, i) => (
          <path key={i} className="ai-spark" style={{ animationDelay: s.delay }} d={sparkPath(s.x, s.y, s.r)} fill={s.c} />
        ))}
      {activity && activity !== "phone" && (
        <g className="rx-badge" key={activity}>
          <circle cx={80} cy={24.5} r={11.5} fill={PAPER} stroke={INK} strokeWidth={2.4} />
          {BADGE[activity]}
        </g>
      )}
    </>
  );
}

export function AiAvatar({
  mood,
  wave = false,
  className = "h-full w-full",
  label = "Your AI receptionist",
}: {
  mood: Mood;
  wave?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`ai-avatar ${className}`}
      data-wave={wave || undefined}
      data-mood={mood}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <AvatarArt mood={mood} />
    </svg>
  );
}
