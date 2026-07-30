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
    name: "call-forwarding-setup-hero",
    prompt: `A close editorial shot of a person's hands holding a smartphone with a blank glowing screen, resting on a tidy small-business desk beside a modern desk phone handset on its cradle, warm late-afternoon window light across the desk, generous empty space on the right, conveying the quiet moment of pointing a business line somewhere new. Screen completely blank with no interface or characters. ${STYLE}`,
  },
  {
    name: "apartment-answering-service-hero",
    prompt: `A calm wide shot of an empty apartment community leasing office at golden hour, a clean reception desk with a desk phone and a small bowl of keys softly out of focus in the foreground, tall windows behind showing a blurred landscaped courtyard and apartment building facade, conveying an office that has closed while calls keep coming. No people, no readable signage. ${STYLE}`,
  },
  {
    name: "emergency-call-escalation-hero",
    prompt: `A cinematic night shot of a smartphone lying face up on a bedside table with its screen glowing softly in a dark bedroom, the shape of a service company work jacket on a chair blurred in the background, cool blue night tones with one warm light source, conveying an on-call handoff at 2 a.m. Screen completely blank with no interface, no characters, no numbers. ${STYLE}`,
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
