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
    name: "roofing-answering-service-hero",
    prompt: `A wide editorial shot of a roofer kneeling on an asphalt shingle roof against a dramatic clearing storm sky with breaking golden light, ladder visible at the roof edge, tool belt on, focused on the work with both hands occupied, conveying being unreachable while demand pours in. Face not prominent. ${STYLE}`,
  },
  {
    name: "contractor-answering-service-hero",
    prompt: `A candid wide shot from behind of a general contractor in a hard hat reviewing large rolled building plans on a makeshift table at a residential job site, fresh timber framing softly out of focus behind, a work truck at the edge of frame, morning light through dust, conveying focus on the build while the phone waits. No readable text on the plans. ${STYLE}`,
  },
  {
    name: "electrician-answering-service-hero",
    prompt: `A close editorial shot of an electrician's gloved hands working carefully inside an open residential breaker panel, a voltage tester clipped nearby, warm task lighting on the panel against a softly darkened utility room, conveying precise two-handed work that cannot be interrupted. No readable labels or numbers in the panel. ${STYLE}`,
  },
  {
    name: "veterinary-answering-service-hero",
    prompt: `A warm candid shot of a veterinary technician in scrubs gently holding a calm golden retriever at a bright modern clinic reception area, a desk telephone softly out of focus in the foreground, soft morning window light, conveying caring hands too full to answer the ringing phone. Faces not prominent. ${STYLE}`,
  },
  {
    name: "towing-answering-service-hero",
    prompt: `A cinematic dusk shot of a flatbed tow truck with warm amber lights glowing on a highway shoulder, an operator in a reflective vest securing a sedan onto the bed, blurred headlight streams passing, blue-hour sky, conveying always-on night work. No readable text or license plates. ${STYLE}`,
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
