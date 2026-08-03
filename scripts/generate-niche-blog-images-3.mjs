import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { GoogleGenAI, Modality } from "@google/genai"

function readKey() {
  const files = [".env.local", ".env"]
  for (const f of files) {
    try {
      const txt = readFileSync(f, "utf8")
      const m = txt.match(/^GEMINI_(?:API_)?KEY\s*=\s*"?([^"\n\r]+)"?/m)
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
    name: "water-damage-restoration-answering-service-hero",
    prompt: `A quiet editorial interior shot of a residential hallway after a water loss at night: a professional air mover and a dehumidifier standing on damp hardwood flooring, a section of baseboard removed, faint water staining on the wall, one warm work light casting long shadows, cool blue darkness beyond the doorway, no people present. Conveys an emergency job already underway. No readable signage or branding on the equipment. ${STYLE}`,
  },
  {
    name: "home-care-answering-service-hero",
    prompt: `A calm early-morning shot of a small home care agency office before staff arrive: a tidy desk with a desk phone, a closed laptop, a paper shift schedule and a coffee cup, soft daylight through a window with a blurred residential street beyond, warm neutral tones, generous empty space on the right, no people. Conveys the quiet hours when calls still arrive. Papers must be blank with no readable text. ${STYLE}`,
  },
  {
    name: "self-storage-answering-service-hero",
    prompt: `A wide cinematic shot of a clean self-storage facility drive aisle at dusk, rows of closed roll-up doors receding into perspective, a keypad access pedestal softly out of focus in the foreground, warm sodium light beginning to glow against a blue evening sky, no people, no vehicles. Conveys a facility that is unstaffed but still taking calls. No readable signage, numbers, or branding. ${STYLE}`,
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
