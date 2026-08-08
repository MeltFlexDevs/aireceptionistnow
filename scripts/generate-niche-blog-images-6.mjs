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
  // --- pest control ---
  {
    name: "pest-control-answering-service-hero",
    prompt: `A pest control technician's white service truck parked at the curb of a quiet suburban street in early spring, equipment racks, a coiled hose and a sprayer tank visible in the open bed, budding trees and a front lawn softly out of focus behind. Truck panels and all surfaces completely blank, no lettering, no logos, no phone numbers. ${STYLE}`,
  },
  // --- locksmith ---
  {
    name: "locksmith-answering-service-hero",
    prompt: `A mobile locksmith's van parked at a residential curb at night, its side door open with a work light spilling warm across a key cabinet and pinning tools, a house front door softly out of focus in the background. Van panels and every surface completely blank, no lettering, no logos, no numbers. ${STYLE}`,
  },
  // --- salon ---
  {
    name: "salon-answering-service-hero",
    prompt: `A quiet independent hair salon interior in warm morning daylight, two styling chairs and mirrors along one wall, a telephone resting beside a closed appointment book on the front desk in the foreground, the room empty between clients. Book cover and any screens completely blank, no readable writing, no signage, no branding. ${STYLE}`,
  },
  // --- cleaning company ---
  {
    name: "cleaning-company-answering-service-hero",
    prompt: `A residential cleaning crew's supply caddy with neatly folded cloths and spray bottles resting on the wooden floor of a bright, empty, freshly cleaned living room, tall windows with morning light behind, a vacuum softly out of focus at the edge of frame. Bottle labels completely blank, no readable text, no brand marks. ${STYLE}`,
  },
  // --- therapists ---
  {
    name: "answering-service-for-therapists-hero",
    prompt: `A quiet private therapy office between sessions, two facing armchairs with a small side table and a lit lamp between them, a box of tissues and a closed notebook on the table, soft daylight through a partly shaded window, plants and a bookshelf blurred behind. Book spines and all surfaces completely blank, no readable text, no diplomas, no signage. ${STYLE}`,
  },
  // --- funeral home ---
  {
    name: "funeral-home-answering-service-hero",
    prompt: `A funeral home reception room late at night, a single lamp lit on a side table beside an upholstered armchair and a telephone, dark panelled walls and a vase of white flowers receding into soft shadow, calm and dignified. Every surface completely blank, no readable text, no signage, no religious symbols, no people. ${STYLE}`,
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
