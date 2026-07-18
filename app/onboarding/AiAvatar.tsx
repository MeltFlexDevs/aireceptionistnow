import type { Mood } from "./personality";

// An illustrated, monochrome AI-receptionist character - a soft charcoal head
// wearing a headset, with blinking eyes and a mouth that morphs with the chosen
// voice's personality. Pure SVG + CSS (no hooks), so it drops into both client
// and server components. Re-mounting it via `key={mood}` replays the pop.

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

// Little twinkling sparkles, drawn only for the celebrate mood.
export const SPARKS = [
  { x: 19, y: 30, r: 2.6, delay: "0s" },
  { x: 83, y: 36, r: 3, delay: "0.5s" },
  { x: 79, y: 74, r: 2.4, delay: "0.9s" },
  { x: 22, y: 72, r: 2.8, delay: "1.3s" },
];

export function sparkPath(x: number, y: number, r: number): string {
  return (
    `M${x} ${y - r} Q${x + r * 0.28} ${y - r * 0.28} ${x + r} ${y} ` +
    `Q${x + r * 0.28} ${y + r * 0.28} ${x} ${y + r} ` +
    `Q${x - r * 0.28} ${y + r * 0.28} ${x - r} ${y} ` +
    `Q${x - r * 0.28} ${y - r * 0.28} ${x} ${y - r} Z`
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
  const mouth = MOUTHS[mood] ?? MOUTHS.friendly;
  return (
    <svg
      viewBox="0 0 100 100"
      className={`onb-avatar ai-avatar ${className}`}
      data-wave={wave || undefined}
      data-mood={mood}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="aiHead" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3c3c3c" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <radialGradient id="aiSheen" cx="0.36" cy="0.28" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="ai-float">
        {/* headset band */}
        <path
          d="M24 55 Q24 20 50 20 Q76 20 76 55"
          fill="none"
          stroke="#e8e8e8"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* status light on the band */}
        <circle className="ai-status" cx="50" cy="18" r="3" fill="#ffffff" />

        {/* head */}
        <rect x="22" y="27" width="56" height="55" rx="23" fill="url(#aiHead)" />
        <rect x="22" y="27" width="56" height="55" rx="23" fill="url(#aiSheen)" />

        {/* earpieces */}
        <rect x="17.5" y="47" width="10" height="18" rx="5" fill="#e8e8e8" />
        <rect x="72.5" y="47" width="10" height="18" rx="5" fill="#e8e8e8" />
        {/* mic boom + tip */}
        <path
          d="M23 63 Q20 75 35 74.5"
          fill="none"
          stroke="#e8e8e8"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="36" cy="74.5" r="2.6" fill="#e8e8e8" />

        {/* eyes */}
        <g className="ai-eyes" fill="#ffffff">
          <rect x="37" y="48" width="6" height="9" rx="3" />
          <rect x="57" y="48" width="6" height="9" rx="3" />
        </g>

        {/* mouth */}
        <path
          d={mouth.d}
          fill={mouth.filled ? "#ffffff" : "none"}
          stroke={mouth.filled ? "none" : "#ffffff"}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* sparkles (celebrate only) */}
        {mood === "celebrate" &&
          SPARKS.map((s, i) => (
            <path
              key={i}
              className="ai-spark"
              style={{ animationDelay: s.delay }}
              d={sparkPath(s.x, s.y, s.r)}
              fill="#1d1d1d"
            />
          ))}
      </g>
    </svg>
  );
}
