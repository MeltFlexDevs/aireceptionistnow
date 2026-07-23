import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { GoogleGenAI, Modality } from "@google/genai"

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

const STYLE =
  "Premium editorial photography. Soft natural directional light, shallow depth of field, calm muted neutral palette with subtle warm tones, clean minimalist composition with generous negative space, crisp high detail, cinematic but understated. Wide 16:9 landscape framing. Absolutely no visible text, no readable letters or numbers, no logos, no watermarks, no on-screen UI text."

const SPECS = [
  {
    name: "best-ai-receptionist-hero",
    prompt: `A neat row of several sleek matte-black desk phones of subtly different designs lined up across a pale seamless studio surface, soft directional top light, one phone gently spotlit and slightly forward as if chosen from the lineup, the others softly out of focus, conveying carefully comparing and choosing between options. No people. ${STYLE}`,
  },
  {
    name: "ai-receptionist-for-it-companies-hero",
    prompt: `A candid three-quarter-from-behind wide shot of a calm IT support technician wearing a slim headset at a tidy modern desk, several computer monitors glowing softly and completely out of focus in the background (no readable screen content), cool blue-hour ambient light with one warm desk lamp, focused and in control mid-call. Face not prominent. ${STYLE}`,
  },
  {
    name: "ai-receptionist-appointment-booking-hero",
    prompt: `An elegant minimalist still life on a pale light-wood desk: an open blank paper planner with an unmarked clean grid beside a smartphone, a pen resting on the page and a hand lightly touching the corner as if confirming a date, a small cup of coffee softly out of focus, soft natural morning light and long gentle shadows, conveying booking an appointment. No readable text or numbers anywhere. ${STYLE}`,
  },
  {
    name: "ai-receptionist-orange-county-hero",
    prompt: `A warm editorial wide shot of a bright sunlit Southern California small-business main street at golden hour, low-rise storefronts with clean blank awnings, palm trees and a hint of coastal light softly out of focus, calm and welcoming, evoking a local Orange County neighbourhood of small businesses. No people prominent, no readable signage or text of any kind. ${STYLE}`,
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
