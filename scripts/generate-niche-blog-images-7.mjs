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
  {
    name: "voice-agent-vs-chatbot-hero",
    prompt: `A person sitting alone in a quiet modern office at dusk holding a mobile phone to their ear mid-sentence, one hand raised slightly as if interrupting the other speaker, a laptop closed on the desk beside them, warm lamp light against cool window light, shot three-quarters from behind so the face is partly turned away. Conveys a real spoken conversation rather than typing. ${STYLE}`,
  },
  {
    name: "voice-agent-demo-test",
    prompt: `A close editorial desk shot from above: a mobile phone lying face down beside a spiral notebook with a pen resting on a blank page, a pair of over-ear headphones and a cooling cup of coffee, morning light raking across a wooden desk. The notebook page must be completely blank with no writing, no lines of text, no marks. Conveys someone methodically testing something by phone and taking notes. ${STYLE}`,
  },
  {
    name: "ai-phone-platforms-hero",
    prompt: `An overhead editorial shot of a small business owner's desk with a desk phone handset off the hook lying on the desk, an open blank notebook, a calculator, and a laptop turned away from camera showing only its blank back lid, morning light through a window blind casting soft stripes. Conveys evaluating options and cost. Every surface blank, no text, no interface, no branding. ${STYLE}`,
  },
  {
    name: "ai-receptionist-property-management-hero",
    prompt: `A property manager standing in the doorway of a small leasing office looking out across a residential apartment courtyard in late afternoon light, a phone in one hand at their side and a set of keys in the other, the office desk behind them empty. Face turned away toward the courtyard. Calm, quiet, end-of-day mood. No readable signage, no unit numbers, no branding. ${STYLE}`,
  },
  {
    name: "property-manager-maintenance-call",
    prompt: `A resident standing in a dim apartment kitchen at night holding a phone to their ear, looking down at water pooling on the floor beneath a sink cabinet whose door hangs open, only the range hood light on, shot from the side so the face is not the subject. Worry and urgency without drama. No readable text, no branding. ${STYLE}`,
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
