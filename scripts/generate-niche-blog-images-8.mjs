import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { GoogleGenAI, Modality } from "@google/genai"

function readKey() {
  for (const f of [".env.local", ".env"]) {
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
  console.error("No GEMINI key found.")
  process.exit(1)
}

const MODELS = [
  "gemini-3.1-flash-image-preview",
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
]

const STYLE =
  "Premium editorial photography. Soft natural directional light, shallow depth of field, calm muted neutral palette with subtle warm tones, clean composition, crisp high detail, cinematic but understated. Wide 16:9 landscape framing. Absolutely no visible text, no readable letters or numbers, no logos, no watermarks, no on-screen UI text, no readable screens."

const SPECS = [
  {
    name: "dental-front-desk-phone-hero",
    prompt: `An empty dental practice front desk photographed at the start of the day: a low reception counter in pale wood, a desk phone with its handset in the cradle and a small red message light, a closed appointment folder, a monitor turned away from camera showing only its blank back, a glass of water and a stack of clean clipboards. Soft morning light through a frosted glass partition, the treatment corridor blurred behind. Nobody in frame. Calm, clinical, slightly expectant. ${STYLE}`,
  },
  {
    name: "restaurant-phone-service-hero",
    prompt: `A busy restaurant pass photographed from the side during service: a ticket rail with blank paper slips, a chef's hand reaching for a plate, steam, and in the near foreground on the wall a corded phone handset hanging off the hook with the coiled cord swinging. Warm tungsten kitchen light against a cool dining room beyond, motion blur on the moving hands. The tickets and every surface must be completely blank with no writing. Conveys a phone ringing during a rush. ${STYLE}`,
  },
  {
    name: "home-services-dispatch-hero",
    prompt: `The cab of a service van parked at dusk outside a suburban house, shot through the open driver door from outside: a phone face-down on the passenger seat, a clipboard, a coiled length of copper pipe and a torch light, work gloves on the dashboard, the house porch light on in the blurred background. Cool blue evening light against a warm porch glow. Nobody in frame. Conveys the last job of the day while the phone keeps ringing. No readable text, no branding, no number plates. ${STYLE}`,
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
      for (const p of res.candidates?.[0]?.content?.parts ?? []) {
        if (p.inlineData?.data) {
          const buf = Buffer.from(p.inlineData.data, "base64")
          writeFileSync(`public/blog/${spec.name}.png`, buf)
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
for (const spec of SPECS) if (await genOne(spec)) ok++
console.log(`\nDone: ${ok}/${SPECS.length} images generated.`)
