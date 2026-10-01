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
    name: "medical-answering-service-pricing-hero",
    prompt: `A small medical practice manager's desk photographed from above at an angle: a desk phone with its handset in the cradle, a plain calculator, a few printed sheets fanned out face-down so only blank white backs show, a stethoscope coiled at the edge, a capped pen and a mug. Soft morning window light, pale wood desk, muted clinical blues and warm neutrals. Nobody in frame. Every sheet of paper, the calculator display and the phone display must be completely blank. Conveys someone about to compare monthly bills. ${STYLE}`,
  },
  {
    name: "medical-practice-after-hours-phone",
    prompt: `A physician practice reception area at night after closing, lit only by a corridor light and one small desk lamp: the front counter with a desk phone showing a single small glowing indicator light, an empty waiting room with a row of chairs blurred behind, blinds half closed with a dark blue evening sky beyond. Nobody in frame. Quiet, still, slightly expectant. No signage, no posters, no readable text anywhere. ${STYLE}`,
  },
  {
    name: "bilingual-answering-service-hero",
    prompt: `The front counter of a small neighborhood family-run business photographed in warm afternoon light - could be a plumbing supply shop or an insurance office: a desk phone with the handset lying off the hook on the counter beside an open blank notepad and a pen, a small potted plant, shelves softly blurred behind. Through the front window, a sunlit street in a Latino neighborhood of an American city, blurred. Nobody in frame. Conveys a call in progress that someone stepped away from. All paper, signs and shop windows must be blank with no writing. ${STYLE}`,
  },
  {
    name: "bilingual-caller-kitchen-phone",
    prompt: `A woman in her fifties of Latin American heritage seen in three-quarter profile standing in a home kitchen, holding a smartphone to her ear and listening with a calm, attentive expression, her other hand resting on the counter near a small puddle of water by the base of the sink cabinet with a folded towel on the floor. Natural daylight from a window, lived-in warm kitchen, shallow depth of field. Candid documentary feel, not posed, not smiling at camera. No readable text on any object. ${STYLE}`,
  },
  {
    name: "chiropractic-answering-service-hero",
    prompt: `An empty chiropractic clinic front desk photographed at the start of the day: a clean reception counter in light wood, a desk phone with its handset in the cradle and a small red message light, a closed appointment book, a small anatomical spine model standing at the end of the counter, and through an open doorway behind, softly blurred, a chiropractic adjusting table with a paper headrest cover. Soft morning light. Nobody in frame. No signage, no posters, no readable text anywhere. ${STYLE}`,
  },
  {
    name: "chiropractic-adjusting-room",
    prompt: `A chiropractor in plain dark scrubs seen from behind and to the side, standing beside a patient who is sitting upright on the edge of an adjusting table, the two in conversation before treatment - the chiropractor gesturing toward the patient's shoulder, the patient listening. Bright, calm treatment room with a window, a spine model on a shelf blurred in the background. Faces not the focus, candid documentary feel. No wall posters with text, no readable charts, no logos. ${STYLE}`,
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
