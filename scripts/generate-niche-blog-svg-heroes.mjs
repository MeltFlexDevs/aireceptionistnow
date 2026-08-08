// Hand-authored SVG heroes for the six 2026-08-08 niche posts, plus a
// rasterised og:image for each (social crawlers do not render SVG).
//
// These follow the same visual language as the existing SVG heroes
// (medical-answering-service-hero.svg et al): soft gradient field, blurred
// depth circles, a glass panel, an industry glyph chip, the dark AI chip with
// a waveform, a second chip for the outcome, and a badge.
//
// Photography is preferred where it exists; scripts/generate-niche-blog-images-6.mjs
// holds the prompts to replace these with photos when image credits allow.
import { writeFileSync } from "node:fs"
import sharp from "sharp"

const CALENDAR = `<g stroke="#1a1a1a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-58" y="-46" width="116" height="104" rx="14"/>
      <path d="M -58 -14 h 116"/>
      <path d="M -30 -66 v 24"/>
      <path d="M 30 -66 v 24"/>
      <path d="M -22 22 l 14 14 30 -30"/>
    </g>`

const CLOCK = `<g stroke="#1a1a1a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="0" cy="0" r="58"/>
      <path d="M 0 -32 V 4 H 28"/>
    </g>`

const SPECS = [
  {
    name: "pest-control-answering-service-hero",
    label:
      "A pest control glyph and an appointment calendar either side of an AI receptionist chip with a voice waveform - every service call answered through the season",
    badge: "EVERY SERVICE CALL, ANSWERED",
    stops: ["#cfe6c9", "#e6f0dc", "#d8ecdf"],
    left: `<g stroke="#1a1a1a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="0" cy="12" rx="34" ry="46"/>
      <circle cx="0" cy="-40" r="18"/>
      <path d="M -10 -54 l -18 -20"/>
      <path d="M 10 -54 l 18 -20"/>
      <path d="M -34 -8 l -32 -16"/>
      <path d="M -36 14 l -36 2"/>
      <path d="M -30 36 l -30 22"/>
      <path d="M 34 -8 l 32 -16"/>
      <path d="M 36 14 l 36 2"/>
      <path d="M 30 36 l 30 22"/>
    </g>`,
    right: CALENDAR,
  },
  {
    name: "locksmith-answering-service-hero",
    label:
      "A key glyph and a clock either side of an AI receptionist chip with a voice waveform - a locksmith line answered at any hour",
    badge: "ANSWERED IN TWO RINGS",
    stops: ["#c8d6e8", "#e2e8f0", "#cfdbe6"],
    left: `<g stroke="#1a1a1a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="-38" cy="0" r="26"/>
      <path d="M -12 0 H 60"/>
      <path d="M 34 0 v 22"/>
      <path d="M 52 0 v 30"/>
    </g>`,
    right: CLOCK,
  },
  {
    name: "salon-answering-service-hero",
    label:
      "A pair of scissors and an appointment calendar either side of an AI receptionist chip with a voice waveform - salon bookings captured while the chairs stay full",
    badge: "EVERY BOOKING, CAPTURED",
    stops: ["#f0d8dd", "#f6e8e6", "#e9dcea"],
    left: `<g stroke="#1a1a1a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="-30" cy="42" r="17"/>
      <circle cx="30" cy="42" r="17"/>
      <path d="M -30 25 L 36 -54"/>
      <path d="M 30 25 L -36 -54"/>
    </g>`,
    right: CALENDAR,
  },
  {
    name: "cleaning-company-answering-service-hero",
    label:
      "A spray bottle and an appointment calendar either side of an AI receptionist chip with a voice waveform - cleaning enquiries scoped and booked",
    badge: "EVERY QUOTE, SCOPED",
    stops: ["#c6e4e4", "#e0f0ef", "#d3e8dd"],
    left: `<g stroke="#1a1a1a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-26" y="-4" width="52" height="60" rx="12"/>
      <path d="M -8 -4 v -14 h 16 v 14"/>
      <path d="M 8 -18 h 20 v -16 h -36"/>
      <path d="M 28 -34 h 16"/>
      <path d="M 54 -46 l 8 -6"/>
      <path d="M 56 -34 h 10"/>
      <path d="M 54 -22 l 8 6"/>
    </g>`,
    right: CALENDAR,
  },
  {
    name: "answering-service-for-therapists-hero",
    label:
      "A heart glyph and an appointment calendar either side of an AI receptionist chip with a voice waveform - private practice enquiries answered between sessions",
    badge: "INTAKE, WITHOUT THE RISK",
    stops: ["#d8d6ee", "#e8e6f4", "#dbe6f0"],
    left: `<g stroke="#1a1a1a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 0 48 C -54 10 -60 -30 -30 -46 C -12 -55 0 -40 0 -27 C 0 -40 12 -55 30 -46 C 60 -30 54 10 0 48 Z"/>
    </g>`,
    right: CALENDAR,
  },
  {
    name: "funeral-home-answering-service-hero",
    label:
      "A candle glyph and a clock either side of an AI receptionist chip with a voice waveform - a funeral home first call answered at any hour",
    badge: "THE FIRST CALL, ANSWERED",
    stops: ["#e0d8cc", "#efe9e0", "#dfe0dd"],
    left: `<g stroke="#1a1a1a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="-22" y="-6" width="44" height="60" rx="10"/>
      <path d="M 0 -6 v -14"/>
      <path d="M 0 -62 C 17 -46 17 -30 0 -20 C -17 -30 -17 -46 0 -62 Z"/>
      <path d="M -36 54 h 72"/>
    </g>`,
    right: CLOCK,
  },
]

function svgFor(spec) {
  // Badge pill sized from the caption length so the text never overflows it.
  const w = Math.max(360, Math.round(spec.badge.length * 24 * 0.62) + 80)
  const half = Math.round(w / 2)
  return `<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" role="img" aria-label="${spec.label}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${spec.stops[0]}"/>
      <stop offset="0.5" stop-color="${spec.stops[1]}"/>
      <stop offset="1" stop-color="${spec.stops[2]}"/>
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
  </defs>

  <rect width="1600" height="900" fill="url(#bg)"/>

  <!-- soft depth circles -->
  <circle cx="310" cy="240" r="150" fill="#ffffff" opacity="0.30" filter="url(#soft)"/>
  <circle cx="1310" cy="650" r="180" fill="#ffffff" opacity="0.25" filter="url(#soft)"/>

  <!-- glass panel -->
  <rect x="280" y="220" width="1040" height="460" rx="40" fill="#ffffff" opacity="0.45"/>
  <rect x="280.5" y="220.5" width="1039" height="459" rx="40" stroke="#ffffff" opacity="0.7"/>

  <!-- industry chip -->
  <g transform="translate(500 450)">
    <rect x="-110" y="-110" width="220" height="220" rx="40" fill="#ffffff" opacity="0.55"/>
    <rect x="-109.5" y="-109.5" width="219" height="219" rx="40" stroke="#ffffff" opacity="0.8"/>
    ${spec.left}
  </g>

  <!-- AI chip with 24/7 tag -->
  <g transform="translate(800 450)">
    <rect x="-115" y="-115" width="230" height="230" rx="40" fill="#111111"/>
    <g stroke="#ffffff" stroke-width="12" stroke-linecap="round">
      <path d="M -56 -16 v 32"/>
      <path d="M -28 -36 v 72"/>
      <path d="M 0 -54 v 108"/>
      <path d="M 28 -36 v 72"/>
      <path d="M 56 -16 v 32"/>
    </g>
    <g transform="translate(100 -100)">
      <rect x="-46" y="-24" width="92" height="48" rx="24" fill="#ffffff"/>
      <rect x="-45.5" y="-23.5" width="91" height="47" rx="23.5" stroke="#111111" stroke-opacity="0.12"/>
      <text x="0" y="7" text-anchor="middle" font-size="21" font-weight="700" fill="#111111" letter-spacing="0.02em">24/7</text>
    </g>
  </g>

  <!-- outcome chip -->
  <g transform="translate(1100 450)">
    <rect x="-110" y="-110" width="220" height="220" rx="40" fill="#ffffff" opacity="0.55"/>
    <rect x="-109.5" y="-109.5" width="219" height="219" rx="40" stroke="#ffffff" opacity="0.8"/>
    ${spec.right}
  </g>

  <g transform="translate(800 760)">
    <rect x="-${half}" y="-34" width="${w}" height="68" rx="34" fill="#111111"/>
    <text x="0" y="8" text-anchor="middle" font-size="24" font-weight="600" fill="#ffffff" letter-spacing="0.06em">${spec.badge}</text>
  </g>
</svg>
`
}

for (const spec of SPECS) {
  const svg = svgFor(spec)
  writeFileSync(`public/blog/${spec.name}.svg`, svg)
  const ogName = spec.name.replace(/-hero$/, "-og")
  await sharp(Buffer.from(svg), { density: 144 })
    .resize(1600, 900, { fit: "cover" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 86 })
    .toFile(`public/blog/${ogName}.webp`)
  console.log(`OK   ${spec.name}.svg + ${ogName}.webp`)
}
console.log(`\nDone: ${SPECS.length} SVG heroes and og images.`)
