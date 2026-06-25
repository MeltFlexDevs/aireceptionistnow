// One-off: generate premium editorial images for the blog using the same Gemini
// image models techdrawai uses. Run: node scripts/generate-blog-images.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { GoogleGenAI, Modality } from "@google/genai"

// Read GEMINI_KEY. Prefer a local env file; fall back to the techdrawai env the
// key was provisioned in, then the process environment.
function readKey() {
  const files = [
    ".env.local",
    ".env",
    "/Users/matuskolejak/Downloads/meltflex/techdrawai/.env.development.tmp",
    "/Users/matuskolejak/Downloads/meltflex/techdrawai/.env.local",
  ]
  for (const f of files) {
    try {
      const txt = readFileSync(f, "utf8")
      const m = txt.match(/^GEMINI_KEY\s*=\s*"?([^"\n\r]+)"?/m)
      if (m && m[1].trim()) return m[1].trim()
    } catch {}
  }
  return process.env.GEMINI_KEY || process.env.GEMINI_API_KEY
}

const API_KEY = readKey()
if (!API_KEY) {
  console.error("No GEMINI_KEY found.")
  process.exit(1)
}

const MODELS = [
  "gemini-3.1-flash-image-preview",
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
]

// A single, consistent editorial look so every image on the blog feels like a
// set. Premium, calm, lots of negative space — and never any baked-in text.
const STYLE =
  "Premium editorial photography. Soft natural directional light, shallow depth of field, calm muted neutral palette with subtle warm tones, clean minimalist composition with generous negative space, crisp high detail, cinematic but understated. Wide 16:9 landscape framing. Absolutely no visible text, no readable letters or numbers, no logos, no watermarks, no on-screen UI text."

const SPECS = [
  {
    name: "ai-receptionist-hero",
    prompt: `A single sleek matte-black desk phone resting on a clean minimal light-wood reception desk beside a window at blue-hour dusk, one soft warm pool of light glowing on it, faint suggestion of concentric sound-wave rings in the air around the handset, conveying a calm always-on 24/7 phone answering service. No people. ${STYLE}`,
  },
  {
    name: "ai-receptionist-tradesperson-call",
    prompt: `A candid wide shot of a tradesperson in clean work clothes standing on a tidy job site in warm late-afternoon light, glancing at a smartphone held in one hand as if a call just came in, relaxed and in control, background softly out of focus. Face not prominent, three-quarter from behind. ${STYLE}`,
  },
  {
    name: "ai-receptionist-human-frontdesk",
    prompt: `A warm candid moment at a bright modern small-business front desk: a friendly receptionist wearing a slim headset, seen in soft side profile, attentive and mid-conversation, blurred reception background with a plant and natural daylight. Gentle, human, reassuring. ${STYLE}`,
  },
  {
    name: "ai-receptionist-soundwave",
    prompt: `An elegant minimalist conceptual still: a smartphone lying flat on a pale seamless surface, delicate glowing concentric sound-wave rings radiating outward from its earpiece across the negative space, soft top light, premium and quiet, suggesting a natural AI voice on a call. No people. ${STYLE}`,
  },
]

mkdirSync("public/blog", { recursive: true })
const ai = new GoogleGenAI({ apiKey: API_KEY })

async function genOne(spec) {
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
          const out = `public/blog/${spec.name}.png`
          writeFileSync(out, buf)
          console.log(
            `OK   ${spec.name} via ${model} (${(buf.length / 1024).toFixed(0)} KB)`
          )
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
