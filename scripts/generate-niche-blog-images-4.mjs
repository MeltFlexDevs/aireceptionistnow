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
  "Premium editorial photography. Soft natural directional light, shallow depth of field, calm muted neutral palette with subtle warm tones, clean composition, crisp high detail, cinematic but understated. Wide 16:9 landscape framing. Absolutely no visible text, no readable letters or numbers, no logos, no watermarks, no on-screen UI text, no readable phone screens."

const SPECS = [
  // --- water damage restoration ---
  {
    name: "restoration-homeowner-call",
    prompt: `A homeowner standing in a dim hallway at night holding a phone to their ear, looking up at a spreading water stain on the ceiling above them, a bucket on the floor catching drips, only a lamp for light, worry legible in their posture, shot from behind and to the side so the face is not the subject. ${STYLE}`,
  },
  {
    name: "restoration-moisture-reading",
    prompt: `A close editorial shot of a restoration technician in work clothes holding a handheld moisture meter against a damp drywall surface near a removed baseboard, gloved hands, early morning light through a window, air mover blurred in the background. Instrument display must be blank with no readable numbers. ${STYLE}`,
  },
  // --- home care ---
  {
    name: "home-care-morning-visit",
    prompt: `A caregiver in plain scrubs sitting beside an older person in an armchair in a bright living room in the early morning, handing them a mug, both in calm conversation, warm domestic light, walking frame softly out of focus nearby, respectful and unstaged. Faces partly turned away from camera. ${STYLE}`,
  },
  {
    name: "home-care-early-scheduler",
    prompt: `A person at a small office desk before dawn seen from behind, silhouetted against a monitor glow and a window still dark blue outside, a desk phone and a paper roster on the desk, a coffee cup steaming, conveying someone covering an open shift at 5 a.m. Screens and papers completely blank, no interface, no characters. ${STYLE}`,
  },
  // --- self storage ---
  {
    name: "self-storage-move-in",
    prompt: `A person lifting a cardboard box out of the back of a small rented moving truck parked in front of an open self storage unit with a raised roll-up door, late afternoon sun raking across the drive aisle, a few stacked boxes already inside the unit. No branding on the truck, no readable signage or unit numbers. ${STYLE}`,
  },
  {
    name: "self-storage-keypad-night",
    prompt: `A close night shot of a hand reaching toward an illuminated keypad access pedestal at a storage facility gate, headlights from a waiting vehicle blurred behind, cool blue darkness with one warm light source, conveying an after-hours access problem. Keypad keys must be blank with no readable numbers or characters. ${STYLE}`,
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
