import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { GoogleGenAI, Modality } from "@google/genai"

function readKey() {
  const files = [
    ".env.local",
    ".env",
    "/Users/matuskolejak/Downloads/meltflex/techdrawai/.env.local",
    "/Users/matuskolejak/Downloads/meltflex/techdrawai/.env.development.tmp",
  ]
  for (const f of files) {
    try {
      const txt = readFileSync(f, "utf8")
      const m =
        txt.match(/^GEMINI_API_KEY\s*=\s*"?([^"\n\r]+)"?/m) ||
        txt.match(/^GEMINI_KEY\s*=\s*"?([^"\n\r]+)"?/m)
      if (m && m[1].trim()) return m[1].trim()
    } catch {}
  }
  return process.env.GEMINI_API_KEY || process.env.GEMINI_KEY
}

const API_KEY = readKey()
if (!API_KEY) {
  console.error("No GEMINI_API_KEY found.")
  process.exit(1)
}

const MODELS = [
  "gemini-3.1-flash-image-preview",
  "gemini-2.5-flash-image",
  "gemini-2.0-flash-preview-image-generation",
]

// One consistent, premium look so every photo on the page reads as a set.
const STYLE =
  "Premium editorial photography for a modern SaaS website. Soft natural directional light, shallow depth of field, calm muted neutral palette with subtle warm tones, clean minimalist composition with generous negative space, crisp high detail, cinematic but understated, authentic and candid — not stocky. Wide 16:9 landscape framing. Absolutely no visible text, no readable letters or numbers, no logos, no watermarks, no on-screen UI text, no brand names."

const SPECS = [
  {
    name: "call-incoming",
    prompt: `A candid evening moment: a person's hand holding a smartphone to their ear near a softly lit window at dusk, seen three-quarter from behind so the face is not prominent, warm amber light, blurred cozy home-office background, conveying a customer calling a business after hours. ${STYLE}`,
  },
  {
    name: "owner-booked",
    prompt: `A relaxed small-business owner in clean casual clothes standing in the doorway of their tidy shop in warm late-afternoon light, calm and in control, gently smiling while glancing at a phone lowered in one hand, three-quarter angle, background softly out of focus. Reassured, relieved, satisfied mood. ${STYLE}`,
  },
  {
    name: "owner-working",
    prompt: `A candid wide shot of a professional at a clean modern desk with a laptop, holding a phone to their ear mid-conversation and taking a note, soft daylight from the side, plant and minimal decor blurred in the background, focused and friendly. Face in soft side profile, not a close-up. ${STYLE}`,
  },
  {
    name: "reception-desk",
    prompt: `An elegant empty modern reception area of a small business at golden hour: a clean minimal front desk in light wood and matte black, a subtle sleek desk phone, a green plant, warm daylight through large windows, calm and welcoming, no people. ${STYLE}`,
  },
  {
    name: "calendar-booked",
    prompt: `An elegant minimalist conceptual still from just above: a clean modern smartphone lying flat on a pale seamless desk beside a simple open notebook and a pen, one small warm highlight suggesting a newly confirmed appointment, lots of soft negative space, premium and quiet. No people, no readable text. ${STYLE}`,
  },
  {
    name: "multilingual-calls",
    prompt: `An elegant minimalist conceptual still: a single smartphone lying flat on a pale seamless surface with delicate glowing concentric sound-wave rings radiating outward from its earpiece across the negative space, a few faint speech-bubble silhouettes suggesting different voices, soft top light, premium and quiet, evoking one AI voice speaking many languages. No people, no text. ${STYLE}`,
  },
  {
    // Used on the Ruby page to represent the human answering service fairly.
    name: "human-receptionist",
    prompt: `A warm, friendly professional receptionist wearing a slim modern headset at a bright, tidy front desk, smiling naturally while helping a caller, three-quarter angle so the face is soft and not a tight close-up, light wood and matte surfaces, a green plant and soft daylight from a large window blurred behind. Approachable, human, reassuring mood. ${STYLE}`,
  },

  {
    name: "rosie-call-incoming",
    prompt: `A candid dusk moment inside a warm European city apartment: a woman's hand raising a smartphone toward her ear near a tall window with soft amber streetlight glow outside, seen three-quarter from behind so the face is not prominent, a cozy blurred interior with books and a leafy plant, warm oatmeal and terracotta tones, evoking a customer phoning a small business in the early evening. ${STYLE}`,
  },
  {
    name: "rosie-owner-booked",
    prompt: `A calm independent European shopkeeper — a florist or boutique owner in clean casual clothes — standing relaxed among plants and shelves in soft morning light through a large storefront window, quietly satisfied and in control, glancing down at a phone held loosely in one hand, three-quarter angle so the face is soft, warm oatmeal and terracotta palette, background gently out of focus. Reassured, relieved mood. ${STYLE}`,
  },
  {
    name: "rosie-multilingual",
    prompt: `An elegant minimalist conceptual still: a single smartphone lying flat on a warm pale linen surface, delicate glowing concentric sound-wave rings radiating softly outward across generous negative space, a few faint translucent speech-bubble silhouettes suggesting many different voices and languages, warm soft top light, muted terracotta and cream palette, premium and quiet, evoking one AI voice speaking many languages. No people, no text. ${STYLE}`,
  },
  {
    name: "rosie-reception",
    prompt: `An elegant empty reception nook of a small European clinic or design studio in warm morning light: a compact minimal front desk in pale oak, a single ceramic vase with one stem, a soft linen chair, sunlight falling across a plaster wall, calm and welcoming, no people, warm neutral oatmeal palette. ${STYLE}`,
  },
  {
    name: "rosie-calendar",
    prompt: `An elegant minimalist conceptual still seen from just above: a smartphone lying flat on a warm cream desk beside a linen-bound open notebook and a slim brass pen, one soft warm highlight suggesting a newly confirmed appointment, generous soft negative space, muted warm palette, premium and quiet. No people, no readable text. ${STYLE}`,
  },

  {
    name: "goodcall-call-incoming",
    prompt: `A candid daytime moment: a tradesperson's hand holding a smartphone to their ear in a bright, busy workshop or service garage, seen three-quarter from behind so the face is not prominent, tools and a workbench softly blurred in cool daylight, conveying a customer calling a busy small business, muted blue-grey palette with warm wood accents. ${STYLE}`,
  },
  {
    name: "goodcall-owner-booked",
    prompt: `A relaxed owner of a busy American small business — an auto shop or contractor in clean workwear — standing in the open bay doorway in bright midday light, calm and in control with a tidy busy shop behind, quietly satisfied, phone lowered in one hand, three-quarter angle so the face is soft, crisp cool daylight, industrial-but-tidy background gently out of focus. ${STYLE}`,
  },
  {
    name: "goodcall-answered",
    prompt: `An elegant minimalist conceptual still: a single smartphone lying flat on a cool pale concrete-grey surface, many delicate glowing arcs and small points of light radiating outward like a steady stream of calls all being answered at once, generous negative space, crisp cool daylight, muted slate and steel palette with one warm highlight, premium and quiet, evoking always-on unlimited answering. No people, no text. ${STYLE}`,
  },
  {
    name: "goodcall-reception",
    prompt: `An elegant empty front service counter of a busy American small-business storefront at opening time: a clean minimal counter in light wood and matte steel, a simple stool, bright daylight through a large shopfront window, calm before the rush, no people, cool neutral palette with warm accents. ${STYLE}`,
  },
  {
    name: "goodcall-calendar",
    prompt: `An elegant minimalist conceptual still seen from just above: a smartphone lying flat on a cool pale grey desk beside a simple open planner and a pen, several soft even highlights suggesting many confirmed appointments in a row, generous negative space, crisp cool light, muted slate palette, premium and quiet. No people, no readable text. ${STYLE}`,
  },

  {
    name: "ruby-human",
    prompt: `A warm, genuine human receptionist at an elegant professional office front desk, a real person mid-conversation wearing a slim discreet headset, smiling softly and naturally, three-quarter angle so the face is soft and not a tight close-up, premium warm walnut desk with brass details and soft lamplight, a subtle plant blurred behind, refined law-office ambiance, authentic and human, warm golden palette. ${STYLE}`,
  },
  {
    name: "ruby-ai-afterhours",
    prompt: `An elegant minimalist conceptual still at night: a single smartphone lying flat on a cool dark slate surface, a soft screen glow casting delicate concentric sound-wave rings across the negative space, calm blue-hour tone, evoking an AI quietly answering calls after hours when the office has closed, muted deep-blue and charcoal palette with one warm highlight, premium and quiet. No people, no text. ${STYLE}`,
  },
  {
    name: "ruby-reception",
    prompt: `An elegant empty premium office reception at dusk: a refined front desk in dark walnut and brass, a soft desk lamp glowing, a leather chair, tall windows with cool blue evening light outside, calm and upscale, no people, a warm-meets-cool palette bridging human warmth and after-hours quiet. ${STYLE}`,
  },
  {
    name: "ruby-call-incoming",
    prompt: `A candid late-evening moment: a person's hand raising a smartphone toward their ear on a quiet city street at night, seen three-quarter from behind so the face is not prominent, warm shop lights and cool blue night softly blurred behind, conveying a customer calling a firm after hours, cinematic muted palette. ${STYLE}`,
  },
  {
    name: "ruby-calendar",
    prompt: `An elegant minimalist conceptual still seen from just above: a smartphone lying flat on a dark refined desk beside a leather-bound notebook and a fountain pen, one soft warm highlight suggesting a newly confirmed appointment, generous negative space, moody premium palette, quiet and upscale. No people, no readable text. ${STYLE}`,
  },
  {
    name: "ruby-owner-booked",
    prompt: `A relaxed professional — a small law-firm or clinic owner in smart-casual clothes — standing in a calm upscale office in soft late-afternoon light, quietly reassured, glancing at a phone lowered in one hand, three-quarter angle so the face is soft, warm refined palette, bookshelves and warm wood softly out of focus. ${STYLE}`,
  },
]

mkdirSync("public/compare/photos", { recursive: true })
const ai = new GoogleGenAI({ apiKey: API_KEY })

async function genOne(spec) {
  // Idempotent: skip specs whose image already exists so re-runs only fill gaps.
  if (existsSync(`public/compare/photos/${spec.name}.png`)) {
    console.log(`SKIP ${spec.name} (already exists)`)
    return true
  }
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
          const out = `public/compare/photos/${spec.name}.png`
          writeFileSync(out, buf)
          console.log(`OK   ${spec.name} via ${model} (${(buf.length / 1024).toFixed(0)} KB)`)
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
