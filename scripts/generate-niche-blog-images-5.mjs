import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs"
import { GoogleGenAI, Modality } from "@google/genai"
import sharp from "sharp"

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
  "Premium editorial photography. Soft natural directional light, shallow depth of field, calm muted neutral palette with subtle warm tones, clean composition, crisp high detail, cinematic but understated. Wide 16:9 landscape framing. Absolutely no visible text, no readable letters or numbers, no logos, no watermarks, no on-screen UI text, no readable phone screens."

const SPECS = [
  // --- restaurants ---
  {
    name: "restaurant-answering-service-hero",
    prompt: `A restaurant host stand during a busy evening service, a desk phone and an open reservation book on the polished wood surface in the foreground, the full dining room warmly lit and blurred behind it, a host's hand just leaving the frame. Book pages and any screens completely blank, no readable writing, no signage. ${STYLE}`,
  },
  // --- auto repair ---
  {
    name: "auto-repair-answering-service-hero",
    prompt: `A service advisor's counter in an independent auto repair shop, a desk phone beside a stack of paper repair orders and a set of car keys on the counter, the workshop bays with a vehicle on a lift visible and softly out of focus through a glass partition behind. Papers and screens completely blank, no readable text, no branding. ${STYLE}`,
  },
  // --- missed call text back ---
  {
    name: "missed-call-text-back-hero",
    prompt: `A mobile phone lying face-up and glowing on a cluttered workshop bench among hand tools and a coiled tape measure, its owner working several feet away and blurred beyond reach in the background, late afternoon light through a dusty window. Phone screen is a plain blank glow with no interface, no icons, no text. ${STYLE}`,
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
          const raw = Buffer.from(p.inlineData.data, "base64")
          const tmp = `public/blog/${spec.name}.raw.png`
          writeFileSync(tmp, raw)
          // Heroes are declared 1600x900 in post meta, so normalise here rather
          // than trusting whatever aspect the model returned.
          await sharp(raw)
            .resize(1600, 900, { fit: "cover", position: "centre" })
            .webp({ quality: 82 })
            .toFile(`public/blog/${spec.name}.webp`)
          unlinkSync(tmp)
          console.log(`OK   ${spec.name} via ${model}`)
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
