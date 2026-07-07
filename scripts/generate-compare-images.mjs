// One-off: generate premium editorial photos for the Smith.ai comparison page,
// same Gemini image models + house style as scripts/generate-blog-images.mjs.
// Run: node scripts/generate-compare-images.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { GoogleGenAI, Modality } from "@google/genai"

function readKey() {
  const files = [
    ".env.local",
    ".env",
    "/Users/matuskolejak/Downloads/meltflex/techdrawai/.env.local",
    "/Users/matuskolejak/Downloads/meltflex/techdrawai/.env.development.tmp",
  ]
  for (const f of files) {
    try {
      const txt = readFileSync(f, "utf8")
      const m =
        txt.match(/^GEMINI_API_KEY\s*=\s*"?([^"\n\r]+)"?/m) ||
        txt.match(/^GEMINI_KEY\s*=\s*"?([^"\n\r]+)"?/m)
      if (m && m[1].trim()) return m[1].trim()
    } catch {}
  }
  return process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
}

const API_KEY = readKey()
if (!API_KEY) {
  console.error("No GEMINI_API_KEY found.")
  process.exit(1)
}

const MODELS = [
  "gemini-3.1-flash-image-preview",
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
]

// One consistent, premium look so every photo on the page reads as a set.
const STYLE =
  "Premium editorial photography for a modern SaaS website. Soft natural directional light, shallow depth of field, calm muted neutral palette with subtle warm tones, clean minimalist composition with generous negative space, crisp high detail, cinematic but understated, authentic and candid — not stocky. Wide 16:9 landscape framing. Absolutely no visible text, no readable letters or numbers, no logos, no watermarks, no on-screen UI text, no brand names."

const SPECS = [
  {
    name: "call-incoming",
    prompt: `A candid evening moment: a person's hand holding a smartphone to their ear near a softly lit window at dusk, seen three-quarter from behind so the face is not prominent, warm amber light, blurred cozy home-office background, conveying a customer calling a business after hours. ${STYLE}`,
  },
  {
    name: "owner-booked",
    prompt: `A relaxed small-business owner in clean casual clothes standing in the doorway of their tidy shop in warm late-afternoon light, calm and in control, gently smiling while glancing at a phone lowered in one hand, three-quarter angle, background softly out of focus. Reassured, relieved, satisfied mood. ${STYLE}`,
  },
  {
    name: "owner-working",
    prompt: `A candid wide shot of a professional at a clean modern desk with a laptop, holding a phone to their ear mid-conversation and taking a note, soft daylight from the side, plant and minimal decor blurred in the background, focused and friendly. Face in soft side profile, not a close-up. ${STYLE}`,
  },
  {
    name: "reception-desk",
    prompt: `An elegant empty modern reception area of a small business at golden hour: a clean minimal front desk in light wood and matte black, a subtle sleek desk phone, a green plant, warm daylight through large windows, calm and welcoming, no people. ${STYLE}`,
  },
  {
    name: "calendar-booked",
    prompt: `An elegant minimalist conceptual still from just above: a clean modern smartphone lying flat on a pale seamless desk beside a simple open notebook and a pen, one small warm highlight suggesting a newly confirmed appointment, lots of soft negative space, premium and quiet. No people, no readable text. ${STYLE}`,
  },
  {
    name: "multilingual-calls",
    prompt: `An elegant minimalist conceptual still: a single smartphone lying flat on a pale seamless surface with delicate glowing concentric sound-wave rings radiating outward from its earpiece across the negative space, a few faint speech-bubble silhouettes suggesting different voices, soft top light, premium and quiet, evoking one AI voice speaking many languages. No people, no text. ${STYLE}`,
  },
  {
    // Used on the Ruby page to represent the human answering service fairly.
    name: "human-receptionist",
    prompt: `A warm, friendly professional receptionist wearing a slim modern headset at a bright, tidy front desk, smiling naturally while helping a caller, three-quarter angle so the face is soft and not a tight close-up, light wood and matte surfaces, a green plant and soft daylight from a large window blurred behind. Approachable, human, reassuring mood. ${STYLE}`,
  },
]

mkdirSync("public/compare/photos", { recursive: true })
const ai = new GoogleGenAI({ apiKey: API_KEY })

async function genOne(spec) {
  // Idempotent: skip specs whose image already exists so re-runs only fill gaps.
  if (existsSync(`public/compare/photos/${spec.name}.png`)) {
    console.log(`SKIP ${spec.name} (already exists)`)
    return true
  }
  for (const model of MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: spec.prompt }] }],
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      })
      const parts = res.candidates?.[0]?.content?.parts ?? []
      for (const p of parts) {
        if (p.inlineData?.data) {
          const buf = Buffer.from(p.inlineData.data, "base64")
          const out = `public/compare/photos/${spec.name}.png`
          writeFileSync(out, buf)
          console.log(`OK   ${spec.name} via ${model} (${(buf.length / 1024).toFixed(0)} KB)`)
          return true
        }
      }
      console.log(`WARN ${spec.name}: ${model} returned no image`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`ERR  ${spec.name} via ${model}: ${msg.slice(0, 160)}`)
    }
  }
  return false
}

let ok = 0
for (const spec of SPECS) {
  if (await genOne(spec)) ok++
}
console.log(`\nDone: ${ok}/${SPECS.length} images generated.`)
